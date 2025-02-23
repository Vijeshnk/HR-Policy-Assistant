'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [connectionString, setConnectionString] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (connectionString) {
      // Store connection string and redirect to dashboard
      localStorage.setItem('PROJECT_CONNECTION_STRING', connectionString);
      window.location.href = '/admin';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HR Policy Assistant
            </h1>
            <p className="text-gray-600">
              Connect your Azure AI Project to get started
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="connection-string"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Connection String
              </label>
              <input
                type="text"
                id="connection-string"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 bg-white"
                placeholder="Enter your connection string"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Connect
            </motion.button>
          </form>

          {!connectionString && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Demo Video
              </h2>
              <a
                href="YOUR_DEMO_VIDEO_LINK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition duration-200"
              >
                Watch how it works →
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

