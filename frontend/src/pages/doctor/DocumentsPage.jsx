// src/pages/doctor/DocumentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getDoctorDocuments, uploadDoctorDocument, deleteDoctorDocument } from '../../services/doctorService';
import { FaFileMedical, FaUpload, FaTrash, FaSpinner, FaEye } from 'react-icons/fa';

const DoctorDocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('medical_license'); // Example types
    const [uploading, setUploading] = useState(false);

    const mockDocuments = [
        { id: 1, document_type: 'Medical License', file_name: 'license_2024.pdf', file_path: '/path/to/license_2024.pdf', uploaded_at: '2024-01-15T10:00:00Z', status: 'approved' },
        { id: 2, document_type: 'Identity Proof', file_name: 'passport.jpg', file_path: '/path/to/passport.jpg', uploaded_at: '2024-01-20T14:30:00Z', status: 'pending_review' },
    ];

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        // try {
        //     const response = await getDoctorDocuments();
        //     setDocuments(response.data.documents || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch documents.');
        //     setDocuments([]);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API
            setDocuments(mockDocuments);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !documentType) {
            alert('Please select a file and document type.');
            return;
        }
        setUploading(true);
        // const formData = new FormData();
        // formData.append('document', file);
        // formData.append('document_type', documentType);
        // try {
        //     await uploadDoctorDocument(formData);
        //     fetchDocuments(); // Refresh list
        //     setFile(null);
        //     e.target.reset(); // Reset file input
        //     alert('Document uploaded successfully! It will be reviewed by an admin.');
        // } catch (err) {
        //     setError(err.response?.data?.message || 'Failed to upload document.');
        // } finally {
        //     setUploading(false);
        // }
        alert(`Mock upload: ${file.name} as ${documentType}`);
        setDocuments(prev => [...prev, {id: Date.now(), document_type: documentType, file_name: file.name, file_path: '#mock', uploaded_at: new Date().toISOString(), status: 'pending_review'}]);
        setUploading(false);
        setFile(null);
        e.target.reset();
    };

    const handleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            // try {
            //     await deleteDoctorDocument(docId);
            //     fetchDocuments();
            //     alert('Document deleted.');
            // } catch (err) {
            //     setError(err.response?.data?.message || 'Failed to delete document.');
            // }
            alert(`Mock delete document ID: ${docId}`);
            setDocuments(prev => prev.filter(d => d.id !== docId));
        }
    };

    if (loading) return <div className="p-6 text-center flex justify-center items-center min-h-[200px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading documents...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center"><FaFileMedical className="mr-3 text-indigo-600"/>My Documents</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Upload New Document</h2>
                <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Document Type</label>
                    <select id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="medical_license">Medical License</option>
                        <option value="identity_proof">Identity Proof (e.g., Passport, ID Card)</option>
                        <option value="degree_certificate">Degree Certificate</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">Select File (PDF, JPG, PNG)</label>
                    <input type="file" id="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                <button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center min-w-[120px]">
                    {uploading ? <FaSpinner className="animate-spin h-5 w-5 mr-2"/> : <FaUpload className="h-5 w-5 mr-2"/>}
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            <div className="bg-white shadow-xl rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Uploaded Documents List</h3>
                {documents.length > 0 ? (
                    <ul className="space-y-3">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-md border hover:shadow-md transition-shadow">
                                <div className="mb-2 sm:mb-0">
                                    <p className="font-medium text-gray-800">{doc.document_type}</p>
                                    <p className="text-sm text-blue-600 hover:text-blue-800 break-all">
                                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                                    </p>
                                    <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {doc.status.replace('_', ' ')}
                                    </span>
                                     <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 p-1" title="View Document"><FaEye/></a>
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Document"><FaTrash/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-600 text-center py-5">No documents uploaded yet.</p>}
            </div>
        </div>
    );
};
export default DoctorDocumentsPage;