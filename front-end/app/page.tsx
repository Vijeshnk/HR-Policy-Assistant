'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const router = useRouter();
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const connectionString = localStorage.getItem('PROJECT_CONNECTION_STRING');
        if (!connectionString) {
            router.push('/');
        }
    }, [router]);

    const handleAdminAccess = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowAdminModal(true);
    };

    const handleAdminAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === '1234') {
            sessionStorage.setItem('adminAuthenticated', 'true');
            router.push('/connect');
        } else {
            setError('Invalid password');
            setAdminPassword('');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-6xl mx-auto pt-16"
            >
                {/* Header */}
                <motion.div
                    variants={cardVariants}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to HR Policy Assistant
                    </h1>
                    <p className="text-lg text-gray-600">
                        Select your role to continue
                    </p>
                </motion.div>

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-8 px-4">
                    {/* Admin Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAdminAccess}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group"
                    >
                        <div className="p-8">
                            <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                                <svg
                                    className="h-8 w-8 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Admin Portal
                            </h2>
                            <p className="text-gray-600">
                                Manage HR policies, upload documents, and configure system settings
                            </p>
                        </div>
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                            <span className="text-blue-600 group-hover:text-blue-700 font-medium flex items-center">
                                Enter as Admin
                                <svg
                                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </span>
                        </div>
                    </motion.div>

                    {/* Employee Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/employee')}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group"
                    >
                        <div className="p-8">
                            <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                                <svg
                                    className="h-8 w-8 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Employee Portal
                            </h2>
                            <p className="text-gray-600">
                                Ask questions about HR policies and get instant answers
                            </p>
                        </div>
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                            <span className="text-green-600 group-hover:text-green-700 font-medium flex items-center">
                                Enter as Employee
                                <svg
                                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </span>
                        </div>
                    </motion.div>
                </div>

               
              
            </motion.div>

            {/* Admin Authentication Modal */}
           {/* Admin Authentication Modal */}
{showAdminModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Admin Access</h2>
            <form onSubmit={handleAdminAuth}>
                <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-2 border rounded mb-4 text-gray-700 placeholder-gray-500"
                    autoFocus
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            setShowAdminModal(false);
                            setError('');
                            setAdminPassword('');
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </div>
            </form>
        </motion.div>
    </div>
)}
        </main>
    );
}