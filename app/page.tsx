import HomeClient from '@/components/HomeClient';
import { getAllApps } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { apps } = await getAllApps();
  return <HomeClient initialApps={apps} />;
}
