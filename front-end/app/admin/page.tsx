// app/admin/page.tsx
'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import AdminAuthCheck from '../components/AdminAuthCheck';

export default function AdminPortal() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedPolicies, setUploadedPolicies] = useState<string[]>([]);
    const [error, setError] = useState('');




    useEffect(() => {
        const connectionString = localStorage.getItem('PROJECT_CONNECTION_STRING');
        if (connectionString) {
            api.connect(connectionString).catch(err => {
                console.error('Failed to connect:', err);
                router.push('/'); // Redirect to connection string input page
            });
        } else {
            router.push('/');
        }
    }, [router]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    // Handle file upload

    const handleUpload = async () => {
        setUploading(true);
        setError('');

        try {
            for (const file of files) {
                try {
                    const result = await api.uploadPolicy(file);
                    setUploadedPolicies(prev => [...prev, file.name]);

                    // Store the vector_store_id in localStorage for persistence
                    const storedPolicies = JSON.parse(localStorage.getItem('vectorStoreIds') || '{}');
                    localStorage.setItem('vectorStoreIds', JSON.stringify({
                        ...storedPolicies,
                        [file.name]: result.vector_store_id
                    }));
                } catch (err: Error | unknown) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    break;
                }
            }
            if (!error) {
                setFiles([]);
            }
        } catch (err: Error | unknown) {
            console.error('Upload failed:', err);
            setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <AdminAuthCheck>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto pt-16"
                >
                    <nav className="bg-white shadow-lg rounded-lg p-4 mb-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                            <button
                                onClick={() => router.push('/')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </nav>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-xl font-semibold mb-6">Upload HR Policies</h2>

                        {/* File Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                            >
                                Select Files
                            </label>

                            {files.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Selected Files:</h3>
                                    <ul className="space-y-2">
                                        {files.map((file, index) => (
                                            <li key={index} className="text-gray-600">{file.name}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Policies'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Uploaded Policies List */}
                        {uploadedPolicies.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Uploaded Policies</h3>
                                <ul className="space-y-2">
                                    {uploadedPolicies.map((policy, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {policy}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 text-red-600">
                                {error}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </AdminAuthCheck>
    );
}
