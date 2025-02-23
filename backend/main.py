from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FileSearchTool, MessageAttachment, FilePurpose
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv
import tempfile

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
project_client = None
current_agent = None
persistent_vector_stores: Dict[str, str] = {}  # Store vector store IDs

class ConnectionConfig(BaseModel):
    connection_string: str

@app.post("/api/connect")
async def connect(config: ConnectionConfig):
    global project_client
    try:
        project_client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=config.connection_string
        )
        return {"status": "connected"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/upload-policy")
async def upload_policy(file: UploadFile = File(...)):
    global project_client, current_agent, persistent_vector_stores
    
    if not project_client:
        raise HTTPException(status_code=400, detail="Not connected to Azure")
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Upload file for persistent storage
        uploaded_file = project_client.agents.upload_file_and_poll(
            file_path=temp_path,
            purpose=FilePurpose.AGENTS
        )

        # Create persistent vector store
        vector_store = project_client.agents.create_vector_store_and_poll(
            file_ids=[uploaded_file.id],
            name=f"persistent_vs_{file.filename}"
        )
        
        # Store vector store ID
        persistent_vector_stores[file.filename] = vector_store.id

        # Create file search tool with all persistent vector stores
        file_search_tool = FileSearchTool(vector_store_ids=list(persistent_vector_stores.values()))

        # Create or update agent with all persistent vector stores
        if not current_agent:
            current_agent = project_client.agents.create_agent(
                model="gpt-4o",
                name="hr-policy-agent",
                instructions="You are a helpful agent which provides answers from HR policies and temporary documents. For policy questions, use the persistent vector stores. For specific cases, use the temporary attachments.",
                tools=file_search_tool.definitions,
                tool_resources=file_search_tool.resources,
            )
        else:
            # Update agent with new vector store
            current_agent = project_client.agents.update_agent(
                agent_id=current_agent.id,
                tools=file_search_tool.definitions,
                tool_resources=file_search_tool.resources,
            )
        
        os.unlink(temp_path)

        return {
            "status": "success",
            "file_id": uploaded_file.id,
            "vector_store_id": vector_store.id,
            "agent_id": current_agent.id
        }
    except Exception as e:
        if 'temp_path' in locals():
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/initialize")
async def initialize_chat():
    global project_client, current_agent
    
    if not project_client:
        raise HTTPException(status_code=400, detail="Not connected to Azure")
    
    try:
        # Create a new thread
        thread = project_client.agents.create_thread()
        return {"thread_id": thread.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/message")
async def send_message(
    thread_id: str,
    message: str = Form(default=""),
    attachment: Optional[UploadFile] = File(None)
):
    global project_client, current_agent, persistent_vector_stores
    
    if not project_client or not current_agent:
        raise HTTPException(status_code=400, detail="Not connected to Azure or agent not initialized")
    
    temp_path = None
    try:
        # Start with persistent vector stores
        tools = [FileSearchTool(vector_store_ids=list(persistent_vector_stores.values())).definitions]
        tool_resources = []

        if attachment:
            # Handle temporary attachment
            temp_path = tempfile.mktemp(suffix=os.path.splitext(attachment.filename)[1])
            content = await attachment.read()
            with open(temp_path, 'wb') as f:
                f.write(content)

            # Upload as temporary attachment
            message_file = project_client.agents.upload_file_and_poll(
                file_path=temp_path,
                purpose=FilePurpose.AGENTS
            )
            
            # Create temporary attachment with search capability
            temp_attachment = MessageAttachment(
                file_id=message_file.id,
                tools=FileSearchTool().definitions
            )
            attachments = [temp_attachment]
        else:
            attachments = []

        # Create message
        content = message.strip() if message.strip() else "Please analyze the available documents."
        
        new_message = project_client.agents.create_message(
            thread_id=thread_id,
            role="user",
            content=content,
            attachments=attachments
        )

        # Process with agent
        run = project_client.agents.create_and_process_run(
            thread_id=thread_id,
            assistant_id=current_agent.id
        )

        # Get messages
        messages = project_client.agents.list_messages(thread_id=thread_id)
        sorted_messages = sorted(
            messages["data"],
            key=lambda x: x["created_at"]
        )

        return {
            "messages": sorted_messages,
            "thread_id": thread_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok", 
        "connected": project_client is not None,
        "agent_initialized": current_agent is not None,
        "persistent_stores": len(persistent_vector_stores)
    }