import React, { useRef, useState, useEffect, useContext } from 'react';
import { UploadCloud, Brain, File, ArrowDown, X } from 'lucide-react';
import { S3MetaDto } from '../AgentForm.types';
import { uploadKnowledgeBase, deleteKnowledgeBase, getKnowledgeBaseDownloadUrl } from '../../../api/client';
import { AuthContext } from '../../../context/AuthContext';

interface PendingUpload {
  meta: S3MetaDto;
  preSignedUrl: string;
  file: File;
}

interface Props {
  existingFiles: S3MetaDto[];
  onFileChange: (files: S3MetaDto[]) => void;
  onPendingChange: (pending: PendingUpload[]) => void;
}

const KnowledgeBaseUploader: React.FC<Props> = ({ existingFiles, onFileChange, onPendingChange }) => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<S3MetaDto[]>(existingFiles);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useContext(AuthContext);

  const pendingIds = new Set(pendingUploads.map((p) => p.meta.fileId));

  // Sync uploadedFiles with existingFiles
  useEffect(() => {
    console.log('KnowledgeBaseUploader - existingFiles:', JSON.stringify(existingFiles, null, 2));
    console.log('KnowledgeBaseUploader - uploadedFiles before update:', JSON.stringify(uploadedFiles, null, 2));
    setUploadedFiles(existingFiles);
    console.log('KnowledgeBaseUploader - uploadedFiles after update:', JSON.stringify(existingFiles, null, 2));
  }, [existingFiles]);

  // Debug rendering
  console.log('KnowledgeBaseUploader - Rendering with uploadedFiles:', JSON.stringify(uploadedFiles, null, 2));

  const allowedFileTypes = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/pdf',
  ];

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) =>
      allowedFileTypes.includes(file.type)
    );
    if (validFiles.length === 0 || !auth?.user?.bId) return;

    setUploading(true);
    setErrorMessage(null);
    const newPending: PendingUpload[] = [];
    const newMetas: S3MetaDto[] = [];

    try {
      for (const file of validFiles) {
        const res = await uploadKnowledgeBase(file.name, file.type, auth.user.bId, file.size, file.lastModified);
        const { preSignedUrl, s3MetaDto } = res.data;
        newPending.push({ meta: s3MetaDto, preSignedUrl, file });
        newMetas.push(s3MetaDto);
      }

      const updatedFiles = [...uploadedFiles, ...newMetas];
      setUploadedFiles(updatedFiles);
      onFileChange(updatedFiles);

      const updatedPending = [...pendingUploads, ...newPending];
      setPendingUploads(updatedPending);
      onPendingChange(updatedPending);
    } catch (e) {
      console.error('Preparation failed', e);
      setErrorMessage('Failed to prepare files for upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = async (f: S3MetaDto) => {
    if (!auth?.user?.bId) return;

    setErrorMessage(null);
    try {
      await deleteKnowledgeBase(auth.user.bId, f.fileId,f.contentType);
      const updatedFiles = uploadedFiles.filter((file) => file.fileId !== f.fileId);
      setUploadedFiles(updatedFiles);
      onFileChange(updatedFiles);

      if (pendingIds.has(f.fileId)) {
        const updatedPending = pendingUploads.filter((p) => p.meta.fileId !== f.fileId);
        setPendingUploads(updatedPending);
        onPendingChange(updatedPending);
      }
    } catch (e) {
      console.error('Delete failed', e);
      setErrorMessage('Failed to delete file. Please try again.');
    }
  };

  const handleDownload = async (f: S3MetaDto) => {
    if (!auth?.user?.bId) return;

    setErrorMessage(null);
    try {
      const res = await getKnowledgeBaseDownloadUrl( auth.user.bId,f.fileId,f.contentType);
     const response = await fetch(res.data.downloadUrl);

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = f.fileName || 'knowledge-base'; // 👈 Force filename here
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      setErrorMessage('Failed to download file. Please try again.');
    }
  };

  return (
    <div className=" border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
        <Brain className="w-4 h-4 mr-2" />
        Knowledge Base
        <span className="text-xs text-gray-400"> (Optional)</span>
      </h3>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 bg-gray-800/60 border-dashed border-gray-600 hover:border-gray-500 transition-colors p-4 rounded-lg ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <UploadCloud className="w-8 h-8 mx-auto text-gray-500" />
        <p className="text-sm text-gray-400 mt-2 text-center">
          Click or drag files to upload
        </p>
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          multiple
          accept=".pdf,.txt,.md,.csv"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
      </div>

      {uploadedFiles.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Existing Files</h4>
          <ul className="space-y-2">
            {uploadedFiles.map((f) => (
              <li key={f.fileId}>
                <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md text-gray-200">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm truncate">{f.fileName || 'Unknown File'}</span>
                  </div>
                  <div className="flex items-center">
                    {!pendingIds.has(f.fileId) && (
                      <button
                        type="button"
                        onClick={() => handleDownload(f)}
                        className="text-gray-400 hover:text-gray-300 mr-2"
                      >
                        <ArrowDown size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(f)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-gray-400 text-sm">No files uploaded yet.</div>
      )}

      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </div>
  );
};

export default KnowledgeBaseUploader;