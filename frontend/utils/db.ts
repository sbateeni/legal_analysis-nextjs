import { set, get, del } from 'idb-keyval';

export async function saveApiKey(apiKey: string) {
  await set('gemini_api_key', apiKey);
}

export async function loadApiKey(): Promise<string> {
  return (await get('gemini_api_key')) || '';
}

export async function saveHistory(history: any[]) {
  await set('legal_analysis_history', history);
}

export async function loadHistory(): Promise<any[]> {
  return (await get('legal_analysis_history')) || [];
}

export async function clearHistory() {
  await del('legal_analysis_history');
} 