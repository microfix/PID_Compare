'use client';

import { useState } from 'react';

export default function Viewer({ htmlContent, pdfs }) {
    const [activePdfIndex, setActivePdfIndex] = useState(pdfs.length > 0 ? 0 : -1);

    return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Pane: HTML Report */}
            <div style={{ width: '50%', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.5rem 1rem', background: '#222', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    AUDIT REPORT
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <iframe
                        srcDoc={htmlContent}
                        style={{ width: '100%', height: '100%', border: 'none', background: 'white', display: 'block' }}
                        title="Audit Report"
                        sandbox="allow-scripts" // Allow scripts if the report needs them, usually safer to restrict
                    />
                </div>
            </div>

            {/* Right Pane: PDFs */}
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.5rem 1rem', background: '#222', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                    {pdfs.map((pdf, index) => (
                        <button
                            key={pdf.id}
                            onClick={() => setActivePdfIndex(index)}
                            style={{
                                background: activePdfIndex === index ? 'var(--accent-green)' : 'transparent',
                                color: activePdfIndex === index ? 'white' : 'var(--text-muted)',
                                border: '1px solid',
                                borderColor: activePdfIndex === index ? 'transparent' : 'transparent',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}
                        >
                            {pdf.name}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, position: 'relative', background: '#333' }}>
                    {activePdfIndex !== -1 && pdfs[activePdfIndex] ? (
                        <iframe
                            src={`/api/file/${pdfs[activePdfIndex].id}`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="PDF Viewer"
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            No PDF Selected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
