import type { AppData } from "../types/task";

const STORAGE_KEY = 'todo-app-data';

export function loadData(): AppData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
