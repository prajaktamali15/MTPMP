'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface FileItem {
  id: number;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  projectId?: number;
  taskId?: number;
}

export default function FilesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load files
  useEffect(() => {
    if (user) {
      // Simulate loading files
      setTimeout(() => {
        setFiles([
          { id: 1, name: 'design_mockup.pdf', size: '2.4 MB', type: 'PDF', uploadedBy: 'John Doe', uploadedAt: '2 hours ago', projectId: 1 },
          { id: 2, name: 'database_schema.png', size: '1.1 MB', type: 'Image', uploadedBy: 'Jane Smith', uploadedAt: '1 day ago', taskId: 2 },
          { id: 3, name: 'requirements.docx', size: '0.8 MB', type: 'Document', uploadedBy: 'You', uploadedAt: '2 days ago', projectId: 1 },
          { id: 4, name: 'presentation.pptx', size: '3.2 MB', type: 'Presentation', uploadedBy: 'Bob Johnson', uploadedAt: '3 days ago', projectId: 2 }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFile: FileItem = {
        id: files.length + 1,
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        type: selectedFile.type.split('/')[1] || 'Unknown',
        uploadedBy: 'You',
        uploadedAt: 'Just now'
      };
      
      setFiles([newFile, ...files]);
      setSelectedFile(null);
      setUploading(false);
    }, 1500);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Files...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">File Storage</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Files ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.uploadedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.uploadedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}