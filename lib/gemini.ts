import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { CaseExample, WySliderApp } from './types';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateCaseExamplesForApps(
  apps: WySliderApp[]
): Promise<CaseExample[]> {
  if (apps.length === 0) {
    return [];
  }

  const ai = getGeminiClient();

  const appsSummary = apps
    .map(
      (app, index) =>
        `${index + 1}. Name: "${app.name}" | Route: "/${app.slug}" | Description: "${app.description}"`
    )
    .join('\n');

  const prompt = `You are writing realistic, concrete product case examples for the WySlider About page.
WySlider's mission is: "We aim on human time freedom by creating powerful and efficient AI tools that remove manual work and give you all the time you need to focus on what really worth for you…"
WySlider's tagline is: "You have a Manual and tedious work to do? You need a WySlider tool"

Here are the ONLY currently registered WySlider apps:
${appsSummary}

Generate one concrete, grounded case example per registered app (up to ${Math.min(apps.length, 8)} case examples, covering the registered apps accurately).
For each case example:
- "appName": exact name of the registered app
- "appSlug": exact slug (without leading slash) of the registered app
- "scenarioTitle": concise, plain-English title (5–9 words)
- "manualChallenge": 1–2 crisp sentences describing the repetitive manual task before using this tool
- "wysliderSolution": 1–2 crisp sentences describing how this specific WySlider app eliminates that manual work
- "outcomeSummary": 1 concrete, realistic time or effort benefit (e.g. "Replaces 45 minutes of manual sorting with a 20-second review")

Avoid generic AI buzzwords like "supercharge", "empower", "unlock", or "elevate". Keep prose clear, human, and practical.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING },
            appSlug: { type: Type.STRING },
            scenarioTitle: { type: Type.STRING },
            manualChallenge: { type: Type.STRING },
            wysliderSolution: { type: Type.STRING },
            outcomeSummary: { type: Type.STRING },
          },
          required: [
            'appName',
            'appSlug',
            'scenarioTitle',
            'manualChallenge',
            'wysliderSolution',
            'outcomeSummary',
          ],
        },
      },
    },
  });

  const rawText = (response.text ?? '[]').trim();
  const parsed = JSON.parse(rawText) as Array<Omit<CaseExample, 'id'>>;

  return parsed.map((item, idx) => {
    const matched =
      apps.find(
        (a) =>
          a.slug.toLowerCase() === item.appSlug?.toLowerCase() ||
          a.name.toLowerCase() === item.appName?.toLowerCase()
      ) ?? apps[idx % apps.length];

    return {
      id: `case-${matched.id}-${idx}`,
      appName: matched.name,
      appSlug: matched.slug,
      scenarioTitle: item.scenarioTitle,
      manualChallenge: item.manualChallenge,
      wysliderSolution: item.wysliderSolution,
      outcomeSummary: item.outcomeSummary,
    };
  });
}

export async function runWorkspaceTool(
  app: WySliderApp,
  userInput: string,
  outputMode: 'concise' | 'detailed' | 'action-plan' = 'concise'
): Promise<string> {
  const ai = getGeminiClient();

  const modeInstruction =
    outputMode === 'detailed'
      ? 'Provide a thorough, structured breakdown with clear headings and bullet points.'
      : outputMode === 'action-plan'
        ? 'Focus on concrete, prioritized next steps, owners, and ready-to-use deliverables.'
        : 'Deliver a crisp, executive-ready result that gets straight to the point.';

  const systemInstruction = `You are "${app.name}", a specialized WySlider AI tool.
Your exact purpose: ${app.description}
WySlider philosophy: Think Less, Create More — remove manual, tedious work cleanly and accurately.
${modeInstruction}
Format the output cleanly with clear headings, bullet points, or tables where helpful. Never include meta-commentary about being an AI model.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: userInput,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  return response.text?.trim() || 'No output was generated. Please refine your input and try again.';
}
