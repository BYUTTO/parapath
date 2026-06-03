'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, getParaTrackStatus, getUnlockedDuties, getCompletionPct, getCurrentTrack, getPendingSignoffs } from '@/lib/store';
import { MODULE_MAP } from '@/lib/demo-data';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, CheckCircle, Clock, ChevronLeft, Unlock, X, LayoutGrid, ClipboardCheck, FileSpreadsheet } from 'lucide-react';

const STATUS_CONFIG = {
  complete:     { label: 'Complete',     color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  in_progress:  { label: 'In Progress',  color: 'bg-blue-100 text-blue-700',       icon: <Clock className="h-3.5 w-3.5" /> },
  overdue:      { label: 'Overdue',      color: 'bg-red-100 text-red-700',         icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  not_started:  { label: 'Not Started',  color: 'bg-slate-100 text-slate-600',     icon: <Clock className="h-3.5 w-3.5" /> },
};

export default function AdminPage() {
  const { paras, getParaCurriculum } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const pendingCount = getPendingSignoffs(paras).length;

  const rows = paras.map(p => {
    const curriculum = getParaCurriculum(p);
    return {
      ...p,
      curriculum,
      status: getParaTrackStatus(p, curriculum),
      pct: getCompletionPct(p, curriculum),
      duties: getUnlockedDuties(p, curriculum),
      track: getCurrentTrack(p, curriculum),
    };
  });

  const overdue = rows.filter(p => p.status === 'overdue').length;
  const complete = rows.filter(p => p.status === 'complete').length;
  const inProgress = rows.filter(p => p.status === 'in_progress').length;

  const selectedRow = selected ? rows.find(p => p.id === selected) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-indigo-600" />
        <span className="font-semibold text-sm">ParaPath</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-500">Admin Dashboard</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/supervisor" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
            <ClipboardCheck className="h-4 w-4" /> Sign-offs
            {pendingCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>}
          </Link>
          <Link href="/admin/compliance" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
            <FileSpreadsheet className="h-4 w-4" /> Compliance
          </Link>
          <Link href="/admin/curriculums" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
            <LayoutGrid className="h-4 w-4" /> Curriculums
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Paras', value: rows.length, color: 'text-slate-900' },
            { label: 'Overdue', value: overdue, color: 'text-red-600' },
            { label: 'In Progress', value: inProgress, color: 'text-blue-600' },
            { label: 'Complete', value: complete, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">{overdue} paraprofessional{overdue > 1 ? 's' : ''} overdue on required training</p>
              <p className="text-xs text-red-700 mt-0.5">Overdue paras may be assigned duties they have not been cleared for. Review and follow up immediately.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-slate-900">Paraprofessional Roster</h2>
          </div>
          <div className="divide-y">
            {rows.map(para => {
              const cfg = STATUS_CONFIG[para.status];
              return (
                <button key={para.id} onClick={() => setSelected(para.id === selected ? null : para.id)} className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 flex-wrap">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">{para.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900">{para.name}</div>
                    <div className="text-xs text-slate-500">{para.role} · {para.curriculum?.name ?? 'No curriculum'} · {para.track} track</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <Progress value={para.pct} className="h-1.5" />
                      <p className="text-xs text-slate-400 mt-1">{para.pct}% complete</p>
                    </div>
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700">
                      <Unlock className="h-3 w-3" />{para.duties.length} duties
                    </span>
                    <Badge className={`text-xs flex items-center gap-1 ${cfg.color}`}>{cfg.icon}{cfg.label}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRow && selectedRow.curriculum && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-semibold text-slate-900">{selectedRow.name} — Training Detail</h2>
                <p className="text-sm text-slate-500">{selectedRow.role} · {selectedRow.curriculum.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-2 my-4">
              {selectedRow.curriculum.modules.map(cm => {
                const mod = MODULE_MAP[cm.moduleId];
                const prog = selectedRow.progress.find(p => p.moduleId === cm.moduleId);
                const done = prog?.completed ?? false;
                if (!mod) return null;
                return (
                  <div key={cm.moduleId} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${done ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      {done && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-900">{mod.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{cm.day}-day</Badge>
                    </div>
                    <span className={`text-xs shrink-0 ${done ? 'text-emerald-600' : 'text-slate-400'}`}>{done ? prog?.completedDate : 'Pending'}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cleared duties ({selectedRow.duties.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedRow.duties.length > 0
                  ? selectedRow.duties.map(d => <Badge key={d} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{d}</Badge>)
                  : <span className="text-sm text-slate-400 italic">No duties cleared yet</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
