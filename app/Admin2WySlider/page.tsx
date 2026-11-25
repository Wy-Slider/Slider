import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllApps } from '@/lib/store';
import AdminClient from '@/components/AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  const { apps } = authenticated ? await getAllApps() : { apps: [] };

  return (
    <AdminClient
      initialAuthenticated={authenticated}
      initialApps={apps}
    />
  );
}
