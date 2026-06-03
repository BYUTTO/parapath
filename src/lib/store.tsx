'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Module, Curriculum, Para, TrackStatus, TrackDay } from './types';
import { MODULE_LIBRARY, SEED_CURRICULUMS, SEED_PARAS, MODULE_MAP } from './demo-data';

interface StoreState {
  modules: Module[];
  curriculums: Curriculum[];
  paras: Para[];
}

interface StoreContextType extends StoreState {
  moduleMap: Record<string, Module>;
  getCurriculum: (id: string) => Curriculum | undefined;
  getParaCurriculum: (para: Para) => Curriculum | undefined;
  saveCurriculum: (c: Curriculum) => void;
  deleteCurriculum: (id: string) => void;
  assignParaCurriculum: (paraId: string, curriculumId: string) => void;
  toggleModuleComplete: (paraId: string, moduleId: string, done: boolean) => void;
  addModule: (m: Module) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'parapath_store_v1';

function loadInitial(): StoreState {
  return {
    modules: MODULE_LIBRARY,
    curriculums: SEED_CURRICULUMS,
    paras: SEED_PARAS,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadInitial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }
  }, [state, hydrated]);

  const moduleMap = Object.fromEntries(state.modules.map(m => [m.id, m]));

  const getCurriculum = useCallback((id: string) => state.curriculums.find(c => c.id === id), [state.curriculums]);

  const getParaCurriculum = useCallback(
    (para: Para) => state.curriculums.find(c => c.id === para.curriculumId),
    [state.curriculums]
  );

  const saveCurriculum = useCallback((c: Curriculum) => {
    setState(s => {
      const exists = s.curriculums.some(x => x.id === c.id);
      return {
        ...s,
        curriculums: exists
          ? s.curriculums.map(x => (x.id === c.id ? c : x))
          : [...s.curriculums, c],
      };
    });
  }, []);

  const deleteCurriculum = useCallback((id: string) => {
    setState(s => ({ ...s, curriculums: s.curriculums.filter(c => c.id !== id) }));
  }, []);

  const assignParaCurriculum = useCallback((paraId: string, curriculumId: string) => {
    setState(s => ({
      ...s,
      paras: s.paras.map(p =>
        p.id === paraId
          ? { ...p, curriculumId, progress: reconcileProgress(p, curriculumId, s.curriculums) }
          : p
      ),
    }));
  }, []);

  const toggleModuleComplete = useCallback((paraId: string, moduleId: string, done: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    setState(s => ({
      ...s,
      paras: s.paras.map(p => {
        if (p.id !== paraId) return p;
        const has = p.progress.some(pr => pr.moduleId === moduleId);
        const progress = has
          ? p.progress.map(pr => pr.moduleId === moduleId ? { ...pr, completed: done, completedDate: done ? today : undefined } : pr)
          : [...p.progress, { moduleId, completed: done, completedDate: done ? today : undefined }];
        return { ...p, progress };
      }),
    }));
  }, []);

  const addModule = useCallback((m: Module) => {
    setState(s => ({ ...s, modules: [...s.modules, m] }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(loadInitial());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <StoreContext.Provider value={{
      ...state, moduleMap, getCurriculum, getParaCurriculum,
      saveCurriculum, deleteCurriculum, assignParaCurriculum,
      toggleModuleComplete, addModule, resetDemo,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

// When a para is moved to a new curriculum, keep progress only for modules
// that exist in the new curriculum; seed missing ones as incomplete.
function reconcileProgress(para: Para, newCurriculumId: string, curriculums: Curriculum[]) {
  const cur = curriculums.find(c => c.id === newCurriculumId);
  if (!cur) return para.progress;
  return cur.modules.map(cm => {
    const existing = para.progress.find(p => p.moduleId === cm.moduleId);
    return existing ?? { moduleId: cm.moduleId, completed: false };
  });
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────────
// Per-curriculum computation helpers
// ─────────────────────────────────────────────────────────────
export function getParaTrackStatus(para: Para, curriculum: Curriculum | undefined): TrackStatus {
  if (!curriculum || curriculum.modules.length === 0) return 'not_started';
  const daysSinceStart = Math.floor((Date.now() - new Date(para.startDate).getTime()) / 86400000);
  const completed = para.progress.filter(p => p.completed).length;

  const dayModules = (day: TrackDay) => curriculum.modules.filter(m => m.day <= day);
  const tier30Done = dayModules(30).every(m => para.progress.find(p => p.moduleId === m.moduleId)?.completed);
  const tier60Done = dayModules(60).every(m => para.progress.find(p => p.moduleId === m.moduleId)?.completed);

  if (completed === 0 && daysSinceStart > 7) return 'overdue';
  if (daysSinceStart > 30 && !tier30Done) return 'overdue';
  if (daysSinceStart > 60 && !tier60Done) return 'overdue';

  if (completed === curriculum.modules.length) return 'complete';
  if (completed > 0) return 'in_progress';
  return 'not_started';
}

export function getUnlockedDuties(para: Para, curriculum: Curriculum | undefined): string[] {
  if (!curriculum) return [];
  const unlocked = new Set<string>();
  for (const cm of curriculum.modules) {
    const done = para.progress.find(p => p.moduleId === cm.moduleId)?.completed;
    if (done) MODULE_MAP[cm.moduleId]?.duties.forEach(d => unlocked.add(d));
  }
  return [...unlocked];
}

export function getCompletionPct(para: Para, curriculum: Curriculum | undefined): number {
  if (!curriculum || curriculum.modules.length === 0) return 0;
  const done = curriculum.modules.filter(cm => para.progress.find(p => p.moduleId === cm.moduleId)?.completed).length;
  return Math.round((done / curriculum.modules.length) * 100);
}

export function getCurrentTrack(para: Para, curriculum: Curriculum | undefined): string {
  if (!curriculum) return '—';
  const dayModules = (day: TrackDay) => curriculum.modules.filter(m => m.day <= day);
  const tier30Done = dayModules(30).every(m => para.progress.find(p => p.moduleId === m.moduleId)?.completed);
  if (!tier30Done) return '30-day';
  const tier60Done = dayModules(60).every(m => para.progress.find(p => p.moduleId === m.moduleId)?.completed);
  if (!tier60Done) return '60-day';
  return '90-day';
}
