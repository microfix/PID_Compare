'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewComparisonButton({ currentFolderId, currentFolderName }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const resetState = () => {
        setLoading(false);
        setMessage('');
        setSuccess(false);
    };

    const handleClose = () => {
        setShowModal(false);
        // Small delay to allow fade out if we had one, but instant is fine.
        resetState();
    };

    const handleTrigger = async () => {
        setLoading(true);
        setMessage('n8n analyserer nu dine filer... Dette tager ca. 1 minut. Du kan lukke dette vindue.');

        // Trigger n8n Webhook via Backend Proxy to avoid CSP issues
        const webhookUrl = '/api/trigger-n8n';

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folderId: currentFolderId,
                    folderName: currentFolderName,
                    timestamp: new Date().toISOString()
                })
            });

            if (res.ok) {
                setSuccess(true);
                // We keep the message visible as per requirement (or show success toast)
                // However, requirement says: "Du kan lukke dette vindue" in the loading message.
                // Upon success (HTTP 200), show toast: "Sammenligning sat i gang! Rapporten dukker op i listen om lidt."
                // I will update the UI to show this success state clearly.
            } else {
                setMessage('Der opstod en fejl ved kontakt til n8n.');
                // Don't set success, so user can try again or cancel
            }
        } catch (e) {
            console.error(e);
            setMessage('Netværksfejl. Kunne ikke kontakte n8n.');
        } finally {
            // If strictly following: "Show a success toast"
            // I'll assume that means after the request returns OK.
            // But if it takes 1 minute, the user might leave.
            // The request to the webhook is likely fast (fire and forget from n8n side), then n8n processes.
            // So loading might only be for the HTTP request duration.
            setLoading(false);
        }
    };

    const openDriveFolder = () => {
        window.open('https://drive.google.com/drive/u/0/folders/1wNav_xCSYcQX5-BQgINN7vb9L8FcbkQu', '_blank');
    };

    return (
        <>
            <button className="btn" onClick={() => { resetState(); setShowModal(true); }}>
                New Comparison
            </button>

            {/* Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}
                    onClick={(e) => {
                        // Close if clicking outside card
                        if (e.target === e.currentTarget) handleClose();
                    }}
                >
                    <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                        {!success ? (
                            <>
                                <h3 style={{ marginBottom: '1.5rem' }}>Har du uploadet de 2 PID-filer til mappen?</h3>

                                {loading ? (
                                    <div style={{ padding: '2rem' }}>
                                        <div className="loader" style={{ margin: '0 auto 1rem auto' }}></div>
                                        <p>{message}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <button className="btn" onClick={handleTrigger}>
                                            JA
                                        </button>
                                        <button className="btn btn-secondary" onClick={openDriveFolder}>
                                            NEJ / ÅBN MAPPE
                                        </button>
                                        <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={handleClose}>
                                            ANNULLER
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>Sammenligning sat i gang!</h3>
                                <p>Rapporten dukker op i listen om lidt.</p>
                                <button className="btn" onClick={handleClose} style={{ marginTop: '1.5rem' }}>
                                    Luk
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
