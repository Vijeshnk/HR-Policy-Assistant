'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

interface Message {
    role: string;
    content: Array<{
        type: string;
        text?: {
            value: string;
        };
    }>;
    created_at?: number;
}

interface ApiError extends Error {
    response?: {
        json(): Promise<{ detail: string }>;
    };
}

export default function EmployeePortal() {
    const router = useRouter();
    const [threadId, setThreadId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState<number>(0);
    const [setupError, setSetupError] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const countdownRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        const initializeChat = async () => {
            try {
                const { thread_id } = await api.initializeChat();
                setThreadId(thread_id);
                setSetupError('');
            } catch (err: unknown) {
                console.error('Failed to initialize chat:', err);
                const error = err as ApiError;
                const errorResponse = await error.response?.json();
                console.log(errorResponse,'errorResponse');
                if (errorResponse?.detail?.includes('Workspace not found')) {
                    setSetupError('Unable to connect to HR Policy Assistant. Please contact your HR department to set up the connection.');
                } else {
                    setSetupError('Unable to connect to HR Policy Assistant. Please contact your HR department to set up the connection.');
                }
            }
        };
        initializeChat();

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startCountdown = (seconds: number) => {
        setCountdown(seconds);
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) {
                        clearInterval(countdownRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() && !attachment) return;
      
        setLoading(true);
        try {
            setMessages(prev => [...prev, {
                role: 'user',
                content: [{
                    type: 'text',
                    text: { value: inputMessage.trim() || 'Please analyze the attached document.' }
                }],
                created_at: Date.now() / 1000
            }]);
      
            const response = await api.sendMessage(
                threadId,
                inputMessage.trim() || "Please analyze the attached document",
                attachment || undefined
            );
          
            if (response?.messages && Array.isArray(response.messages)) {
                setMessages(response.messages);
            } else {
                console.error('Invalid message format received:', response);
                throw new Error('Invalid response format');
            }
          
            setInputMessage('');
            setAttachment(null);
        } catch (err: unknown) {
            console.error('Failed to send message:', err);
            const error = err as ApiError;
            
            if (error.message?.includes('rate_limit_exceeded')) {
                const seconds = parseInt(error.message.match(/Try again in (\d+) seconds/)?.[1] || '60');
                startCountdown(seconds);
            }
          
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: [{
                    type: 'text',
                    text: { value: 'Sorry, there was an error processing your message. Please try again.' }
                }],
                created_at: Date.now() / 1000
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto pt-16"
            >
                <nav className="bg-white shadow-lg rounded-lg p-4 mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </nav>

                {setupError ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-lg p-8 text-center"
                    >
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Error</h2>
                        <p className="text-gray-600 mb-6">{setupError}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Return to Dashboard
                        </button>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6">
                            {messages && messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                                    >
                                        <div
                                            className={`inline-block p-4 rounded-lg ${
                                                msg.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {msg.content?.[0]?.text?.value || 'No message content'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 mt-4">
                                    No messages yet. Start a conversation!
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="border-t p-4">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    id="attachment"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <label
                                    htmlFor="attachment"
                                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                                >
                                    {attachment ? '📎 ' + attachment.name : '📎'}
                                </label>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !loading && countdown === 0) {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || countdown > 0}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 
                                     countdown > 0 ? `Wait ${countdown}s` : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}