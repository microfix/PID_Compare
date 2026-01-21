import Link from 'next/link';
import { listArchiveFolders } from '@/lib/drive';
import { FileText, Upload, Clock } from 'lucide-react';
import NewComparisonButton from './components/NewComparisonButton';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let folders = [];
  let error = null;

  try {
    folders = await listArchiveFolders();
  } catch (e) {
    console.error("Failed to fetch folders", e);
    error = "Could not load archive. Check authentication.";
  }

  // Helper to guess status (Mock logic for now, or based on name/n8n convention)
  // In a real app, n8n might update a specific property or file name.
  // We'll assume if it's in the Archive, it's processed.
  const getStatus = (folder) => {
    // Just a placeholder logic: Older than 1 month? Or based on name?
    // User requested "Minor/Safe" vs "Critical/Major".
    // We'll mimic this by checking if the name includes "CRITICAL" for demo, default to Safe.
    if (folder.name.toUpperCase().includes('CRITICAL')) return 'critical';
    return 'safe';
  };

  return (
    <main className="container">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ marginBottom: 0 }}>Archive</h1>
        <NewComparisonButton />
      </div>

      {error ? (
        <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
          <h3 style={{ color: 'var(--status-critical)' }}>Error</h3>
          <p>{error}</p>
        </div>
      ) : folders.length === 0 ? (
        <div className="card">
          <p>No comparisons found in archive.</p>
        </div>
      ) : (
        <div className="grid">
          {folders.map((folder) => {
            const status = getStatus(folder);
            return (
              <Link href={`/plant/${folder.id}`} key={folder.id} className="card-link">
                <div className="card">
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <div className={`status-badge ${status === 'critical' ? 'status-critical' : 'status-safe'}`}>
                      {status === 'critical' ? 'Critical' : 'Safe'}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                      <Clock size={14} style={{ marginRight: '4px' }} />
                      {new Date(folder.createdTime).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{folder.name}</h3>
                  <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    View Comparison Report &rarr;
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
