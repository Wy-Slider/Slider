export interface WySliderApp {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  appUrl?: string;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseExample {
  id: string;
  appName: string;
  appSlug: string;
  scenarioTitle: string;
  manualChallenge: string;
  wysliderSolution: string;
  outcomeSummary: string;
}

export interface WySliderStoreData {
  apps: WySliderApp[];
  appsRevision: string;
  caseExamples: CaseExample[];
  caseExamplesRevision: string;
  caseExamplesGeneratedAt: string | null;
}
