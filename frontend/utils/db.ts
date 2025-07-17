import { set, get, del } from 'idb-keyval';

// أنواع البيانات
export interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

export interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
}

// مفاتيح التخزين
const CASES_KEY = 'legal_cases';
const API_KEY = 'gemini_api_key';

// دوال مفتاح API
export async function saveApiKey(apiKey: string) {
  await set(API_KEY, apiKey);
}

export async function loadApiKey(): Promise<string> {
  return (await get(API_KEY)) || '';
}

// دوال CRUD للقضايا
export async function getAllCases(): Promise<LegalCase[]> {
  return (await get(CASES_KEY)) || [];
}

export async function saveAllCases(cases: LegalCase[]) {
  await set(CASES_KEY, cases);
}

export async function addCase(newCase: LegalCase): Promise<void> {
  const cases = await getAllCases();
  cases.unshift(newCase);
  await saveAllCases(cases);
}

export async function updateCase(updatedCase: LegalCase): Promise<void> {
  let cases = await getAllCases();
  cases = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
  await saveAllCases(cases);
}

export async function deleteCase(caseId: string): Promise<void> {
  let cases = await getAllCases();
  cases = cases.filter(c => c.id !== caseId);
  await saveAllCases(cases);
}

export async function getCaseById(caseId: string): Promise<LegalCase | undefined> {
  const cases = await getAllCases();
  return cases.find(c => c.id === caseId);
}

// دوال إدارة المراحل داخل قضية
export async function addStageToCase(caseId: string, stage: AnalysisStage): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages.push(stage);
  await saveAllCases(cases);
}

export async function updateStageInCase(caseId: string, stage: AnalysisStage): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages = cases[idx].stages.map(s => s.id === stage.id ? stage : s);
  await saveAllCases(cases);
}

export async function deleteStageFromCase(caseId: string, stageId: string): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages = cases[idx].stages.filter(s => s.id !== stageId);
  await saveAllCases(cases);
}

// دالة حذف جميع القضايا
export async function clearAllCases() {
  await del(CASES_KEY);
} 