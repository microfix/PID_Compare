'use client';

export default function TripleViewer({ htmlContent, leftPdfId, rightPdfId }) {
    return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
            {/* Left Pane: PDF A */}
            <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ padding: '0.5rem 1rem', background: '#222', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>
                    REVISION A
                </div>
                <div style={{ flex: 1, position: 'relative', background: '#333' }}>
                    <iframe
                        src={`/api/file/${leftPdfId}`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="PDF A"
                    />
                </div>
            </div>

            {/* Center Pane: HTML Report */}
            <div style={{ flex: 2, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ padding: '0.5rem 1rem', background: '#222', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                    COMPARISON RESULT
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <iframe
                        srcDoc={htmlContent}
                        style={{ width: '100%', height: '100%', border: 'none', background: 'white', display: 'block' }}
                        title="Audit Report"
                        sandbox="allow-scripts"
                    />
                </div>
            </div>

            {/* Right Pane: PDF B */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ padding: '0.5rem 1rem', background: '#222', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>
                    REVISION B
                </div>
                <div style={{ flex: 1, position: 'relative', background: '#333' }}>
                    <iframe
                        src={`/api/file/${rightPdfId}`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="PDF B"
                    />
                </div>
            </div>
        </div>
    );
}
