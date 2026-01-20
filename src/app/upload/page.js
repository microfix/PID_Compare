'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Upload as UploadIcon, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');

    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateAndSetFiles = (newFiles) => {
        // Convert FileList to Array
        const fileArray = Array.from(newFiles);
        // Filter PDFs
        const pdfs = fileArray.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

        if (pdfs.length !== 2) {
            setMessage('Please select exactly two PDF files (Old and New Version).');
            return;
        }

        setFiles(pdfs);
        setMessage('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFiles(e.target.files);
        }
    };

    const handleUpload = async () => {
        if (files.length !== 2) return;

        setUploading(true);
        setProgress(0);
        setMessage('Uploading to Input Drive...');

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Upload successful. Triggering analysis...');
                // In a real scenario, the API would return a tracking ID. 
                // For this demo, we can generate a mock one or rely on the response.
                // Assuming n8n returns something or we just wait.
                setProgress(10); // Initial progress
                if (data.jobId) {
                    setJobId(data.jobId);
                } else {
                    // Fallback if no n8n configured
                    setJobId('simulated-job-' + Date.now());
                }
            } else {
                setMessage('Error: ' + data.error);
                setUploading(false);
            }
        } catch (e) {
            setMessage('Upload failed.');
            setUploading(false);
        }
    };

    // Polling simulator (or real poller if we had a real ID)
    useEffect(() => {
        let interval;
        if (jobId) {
            interval = setInterval(async () => {
                // Poll our progress API
                // In this demo, we might not get real n8n updates unless configured, 
                // so we'll simulate progress if it stays at 10.
                try {
                    const res = await fetch(`/api/progress?id=${jobId}`);
                    const data = await res.json();
                    if (data.progress > progress) {
                        setProgress(data.progress);
                    } else {
                        // Simulation for demo
                        setProgress(prev => Math.min(prev + 5, 95));
                    }

                    if (progress >= 100) {
                        setMessage('Analysis Complete!');
                        clearInterval(interval);
                    }
                } catch (e) {
                    // ignore
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [jobId, progress]);

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
                </Link>
            </div>

            <div className="card">
                <h1 className="title" style={{ fontSize: '1.5rem', border: 'none', marginBottom: '1rem' }}>Upload P&ID Versions</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Drag and drop exactly two PDF files (Reference and New Revision) to start the comparison analysis.
                </p>

                {!jobId ? (
                    <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            onChange={handleChange}
                            accept=".pdf"
                            style={{ display: 'none' }}
                        />

                        <div
                            className={`drop-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current.click()}
                            style={{
                                border: '2px dashed ' + (dragActive ? 'var(--accent-green)' : 'var(--border-color)'),
                                backgroundColor: dragActive ? 'rgba(75, 83, 32, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <UploadIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                Drop files here or click to browse
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Supports PDF only
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Selected Files:</h4>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                    {files.map((file, i) => (
                                        <div key={i} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', background: '#222' }}>
                                            <FileText size={20} style={{ marginRight: '1rem', color: 'var(--accent-green)' }} />
                                            <span>{file.name}</span>
                                            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ))}
                                </div>

                                {message && <p style={{ color: 'var(--status-critical)', marginTop: '1rem' }}>{message}</p>}

                                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || files.length !== 2}
                                        className="btn"
                                        style={{ width: '100%', opacity: uploading ? 0.7 : 1 }}
                                    >
                                        {uploading ? 'Uploading...' : 'Start Analysis'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            {progress >= 100 ? (
                                <CheckCircle size={64} style={{ color: 'var(--status-safe)' }} />
                            ) : (
                                <div className="loader" style={{ fontSize: '2rem' }}>Processing...</div>
                            )}
                        </div>

                        <h3 style={{ marginBottom: '1rem' }}>{progress >= 100 ? 'Analysis Complete' : 'Analyzing Differences'}</h3>

                        <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'var(--accent-green)',
                                    transition: 'width 0.5s ease'
                                }}
                            />
                        </div>
                        <p className="text-muted" style={{ marginTop: '1rem' }}>{progress}%</p>

                        {progress >= 100 && (
                            <div style={{ marginTop: '2rem' }}>
                                <Link href="/" className="btn btn-secondary">
                                    Return to Dashboard
                                </Link>
                            </div>
                        )}

                        <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                            We are comparing the uploaded versions. You can close this window; the report will appear in the dashboard when ready.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
