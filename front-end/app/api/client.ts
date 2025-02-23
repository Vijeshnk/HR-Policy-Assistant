export const api = {
    connect: async (connectionString: string) => {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connection_string: connectionString }),
      });
      if (!response.ok) {
        throw new Error("Failed to connect to Azure");
      }
      return response.json();
    },
  
    uploadPolicy: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch("/api/admin/upload-policy", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload policy");
      }
      return response.json();
    },
  
    initializeChat: async () => {
      const response = await fetch("/api/chat/initialize", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to initialize chat");
      }
      return response.json();
    },
  
    sendMessage: async (threadId: string, content: string, attachment?: File) => {
      try {
        const formData = new FormData();
        formData.append('message', content);
        
        if (attachment) {
          formData.append('attachment', attachment);
        }
  
        const response = await fetch(`/api/chat/message?thread_id=${threadId}`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to send message: ${errorText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
  
    checkHealth: async () => {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return response.json();
    }
  };