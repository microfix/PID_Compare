import { listArchiveFolders } from '@/lib/drive';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let folders = [];
  let error = null;

  try {
    folders = await listArchiveFolders();
  } catch (e) {
    console.error('Failed to fetch folders', e);
    error = 'Could not load archive. Check authentication.';
  }

  if (error) {
    return (
      <main className="container">
        <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
          <h3 style={{ color: 'var(--status-critical)' }}>Error</h3>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return <DashboardClient folders={folders} />;
}
