import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { CaseExample, WySliderApp, WySliderStoreData } from './types';
import { generateCaseExamplesForApps } from './gemini';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'wyslider-store.json');

const RESERVED_SLUGS = new Set([
  'about',
  'admin2wyslider',
  'api',
  '_next',
  'images',
  'favicon.ico',
]);

function computeAppsRevision(apps: WySliderApp[]): string {
  const canonical = apps.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    appUrl: a.appUrl || '',
  }));
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonical))
    .digest('hex')
    .slice(0, 16);
}

function createInitialSeedApps(): WySliderApp[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'app-briefcraft',
      slug: 'briefcraft',
      name: 'BriefCraft',
      description:
        'Turns scattered meeting notes, transcripts, and rough bullet points into structured executive briefs and clear next-step plans.',
      logo: '/images/logo_briefcraft.jpg',
      appUrl: '',
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app-sheetpulse',
      slug: 'sheetpulse',
      name: 'SheetPulse',
      description:
        'Cleans messy CSV exports, standardizes columns, and extracts immediate trend summaries without writing manual spreadsheet formulas.',
      logo: '/images/logo_sheetpulse.jpg',
      appUrl: '',
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app-mailtriage',
      slug: 'mailtriage',
      name: 'MailTriage',
      description:
        'Distills long email threads into key decisions and drafts accurate, tone-matched replies ready to review and send.',
      logo: '/images/logo_mailtriage.jpg',
      appUrl: '',
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app-docusift',
      slug: 'docusift',
      name: 'DocuSift',
      description:
        'Pulls obligations, deadlines, pricing terms, and risk clauses out of lengthy proposals and policy documents in seconds.',
      logo: '/images/logo_docusift.jpg',
      appUrl: '',
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createInitialStore(): WySliderStoreData {
  const apps = createInitialSeedApps();
  return {
    apps,
    appsRevision: computeAppsRevision(apps),
    caseExamples: [],
    caseExamplesRevision: '',
    caseExamplesGeneratedAt: null,
  };
}

let writeQueue: Promise<unknown> = Promise.resolve();

function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.catch(() => undefined);
  return next;
}

async function readStoreUnsafe(): Promise<WySliderStoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as WySliderStoreData;
    if (!Array.isArray(parsed.apps)) {
      throw new Error('Invalid store format');
    }
    return parsed;
  } catch {
    const initial = createInitialStore();
    await writeStoreUnsafe(initial);
    return initial;
  }
}

async function writeStoreUnsafe(data: WySliderStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmpPath, STORE_PATH);
}

export function slugifyAppName(rawName: string): string {
  const base = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'wyslider-tool';
}

function ensureUniqueSlug(
  desiredSlug: string,
  existingApps: WySliderApp[],
  excludeId?: string
): string {
  let candidate = slugifyAppName(desiredSlug);
  if (RESERVED_SLUGS.has(candidate.toLowerCase())) {
    candidate = `${candidate}-app`;
  }
  const taken = new Set(
    existingApps
      .filter((a) => a.id !== excludeId)
      .map((a) => a.slug.toLowerCase())
  );
  if (!taken.has(candidate.toLowerCase())) {
    return candidate;
  }
  let suffix = 2;
  while (taken.has(`${candidate}-${suffix}`.toLowerCase())) {
    suffix += 1;
  }
  return `${candidate}-${suffix}`;
}

export async function getAllApps(): Promise<{
  apps: WySliderApp[];
  appsRevision: string;
}> {
  const store = await readStoreUnsafe();
  return {
    apps: store.apps,
    appsRevision: store.appsRevision,
  };
}

export async function getAppBySlug(slug: string): Promise<WySliderApp | null> {
  const store = await readStoreUnsafe();
  const normalized = slug.trim().toLowerCase();
  return (
    store.apps.find((app) => app.slug.toLowerCase() === normalized) ?? null
  );
}

export async function addApp(input: {
  name: string;
  description: string;
  logo: string;
  appUrl?: string;
  slug?: string;
}): Promise<WySliderApp> {
  return runSerialized(async () => {
    const store = await readStoreUnsafe();
    const now = new Date().toISOString();
    const id = `app-${crypto.randomUUID().slice(0, 8)}`;
    const slug = ensureUniqueSlug(input.slug || input.name, store.apps);

    const newApp: WySliderApp = {
      id,
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      logo: input.logo,
      appUrl: input.appUrl?.trim() || '',
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    store.apps.push(newApp);
    store.appsRevision = computeAppsRevision(store.apps);
    await writeStoreUnsafe(store);
    return newApp;
  });
}

export async function updateApp(
  id: string,
  patch: {
    name?: string;
    description?: string;
    logo?: string;
    appUrl?: string;
    slug?: string;
  }
): Promise<WySliderApp | null> {
  return runSerialized(async () => {
    const store = await readStoreUnsafe();
    const index = store.apps.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = store.apps[index];
    const nextName = patch.name !== undefined ? patch.name.trim() : current.name;
    const nextSlug =
      patch.slug !== undefined && patch.slug.trim()
        ? ensureUniqueSlug(patch.slug, store.apps, current.id)
        : patch.name !== undefined && patch.name.trim() !== current.name
          ? ensureUniqueSlug(nextName, store.apps, current.id)
          : current.slug;

    const updated: WySliderApp = {
      ...current,
      name: nextName,
      slug: nextSlug,
      description:
        patch.description !== undefined
          ? patch.description.trim()
          : current.description,
      logo: patch.logo !== undefined ? patch.logo : current.logo,
      appUrl:
        patch.appUrl !== undefined ? patch.appUrl.trim() : current.appUrl || '',
      updatedAt: new Date().toISOString(),
    };

    store.apps[index] = updated;
    store.appsRevision = computeAppsRevision(store.apps);
    await writeStoreUnsafe(store);
    return updated;
  });
}

export async function removeApp(id: string): Promise<boolean> {
  return runSerialized(async () => {
    const store = await readStoreUnsafe();
    const nextApps = store.apps.filter((a) => a.id !== id);
    if (nextApps.length === store.apps.length) return false;
    store.apps = nextApps;
    store.appsRevision = computeAppsRevision(store.apps);
    await writeStoreUnsafe(store);
    return true;
  });
}

export async function incrementAppVisit(slug: string): Promise<WySliderApp | null> {
  return runSerialized(async () => {
    const store = await readStoreUnsafe();
    const normalized = slug.trim().toLowerCase();
    const index = store.apps.findIndex(
      (a) => a.slug.toLowerCase() === normalized
    );
    if (index === -1) return null;

    store.apps[index] = {
      ...store.apps[index],
      visitCount: (store.apps[index].visitCount || 0) + 1,
    };
    await writeStoreUnsafe(store);
    return store.apps[index];
  });
}

let inFlightCaseGeneration: Promise<{
  caseExamples: CaseExample[];
  appsRevision: string;
  generatedAt: string | null;
  cached: boolean;
}> | null = null;

/**
 * Returns cached AI case examples unless Admin has modified the apps list
 * (i.e. appsRevision !== caseExamplesRevision).
 */
export async function getOrRefreshCaseExamples(): Promise<{
  caseExamples: CaseExample[];
  appsRevision: string;
  generatedAt: string | null;
  cached: boolean;
}> {
  const store = await readStoreUnsafe();

  if (store.apps.length === 0) {
    if (store.caseExamplesRevision !== store.appsRevision) {
      await runSerialized(async () => {
        const fresh = await readStoreUnsafe();
        fresh.caseExamples = [];
        fresh.caseExamplesRevision = fresh.appsRevision;
        fresh.caseExamplesGeneratedAt = new Date().toISOString();
        await writeStoreUnsafe(fresh);
      });
    }
    return {
      caseExamples: [],
      appsRevision: store.appsRevision,
      generatedAt: store.caseExamplesGeneratedAt,
      cached: true,
    };
  }

  if (
    store.caseExamplesRevision === store.appsRevision &&
    store.caseExamples.length > 0
  ) {
    return {
      caseExamples: store.caseExamples,
      appsRevision: store.appsRevision,
      generatedAt: store.caseExamplesGeneratedAt,
      cached: true,
    };
  }

  if (inFlightCaseGeneration) {
    return inFlightCaseGeneration;
  }

  inFlightCaseGeneration = (async () => {
    try {
      const targetRevision = store.appsRevision;
      const generated = await generateCaseExamplesForApps(store.apps);
      const generatedAt = new Date().toISOString();

      await runSerialized(async () => {
        const latest = await readStoreUnsafe();
        if (latest.appsRevision === targetRevision) {
          latest.caseExamples = generated;
          latest.caseExamplesRevision = targetRevision;
          latest.caseExamplesGeneratedAt = generatedAt;
          await writeStoreUnsafe(latest);
        }
      });

      return {
        caseExamples: generated,
        appsRevision: targetRevision,
        generatedAt,
        cached: false,
      };
    } finally {
      inFlightCaseGeneration = null;
    }
  })();

  return inFlightCaseGeneration;
}

export async function getCachedCaseExamplesSnapshot(): Promise<{
  cases: CaseExample[];
  needsRefresh: boolean;
  appCount: number;
}> {
  const store = await readStoreUnsafe();
  const isFresh =
    store.caseExamplesRevision === store.appsRevision &&
    (store.apps.length === 0 || store.caseExamples.length > 0);
  return {
    cases: isFresh ? store.caseExamples : [],
    needsRefresh: !isFresh && store.apps.length > 0,
    appCount: store.apps.length,
  };
}

export function triggerBackgroundCaseRefresh(): void {
  void getOrRefreshCaseExamples().catch((err) => {
    console.error('Background case examples refresh failed:', err);
  });
}
