import AboutClient from '@/components/AboutClient';
import { getCachedCaseExamplesSnapshot } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const { cases, needsRefresh, appCount } =
    await getCachedCaseExamplesSnapshot();
  return (
    <AboutClient
      initialCases={cases}
      needsRefresh={needsRefresh}
      appCount={appCount}
    />
  );
}
