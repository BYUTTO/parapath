'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, getParaTrackStatus, getUnlockedDuties, getCompletionPct, getCurrentTrack, getPendingSignoffs } from '@/lib/store';
import { MODULE_MAP } from '@/lib/demo-data';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, CheckCircle, Clock, ChevronLeft, Unlock, X, LayoutGrid, ClipboardCheck, FileSpreadsheet } from 'lucide-react';

const STATUS_CONFIG = {
  complete:     { label: 'Complete',     color: 'bg-passbg text-pass', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  in_progress:  { label: 'In Progress',  color: 'bg-infobg text-info',       icon: <Clock className="h-3.5 w-3.5" /> },
  overdue:      { label: 'Overdue',      color: 'bg-failbg text-fail',         icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  not_started:  { label: 'Not Started',  color: 'bg-secondary text-inkmute',     icon: <Clock className="h-3.5 w-3.5" /> },
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
    <div className="min-h-screen bg-paper">
      <nav className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-accent" />
        <span className="font-display font-semibold text-[15px] tracking-tight">ParaPath</span>
        <span className="text-inkfaint">/</span>
        <span className="text-sm text-inkmute">Admin Dashboard</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/supervisor" className="flex items-center gap-1.5 text-sm text-inkmute hover:text-accent transition-colors">
            <ClipboardCheck className="h-4 w-4" /> Sign-offs
            {pendingCount > 0 && <span className="bg-info text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>}
          </Link>
          <Link href="/admin/compliance" className="flex items-center gap-1.5 text-sm text-inkmute hover:text-accent transition-colors">
            <FileSpreadsheet className="h-4 w-4" /> Compliance
          </Link>
          <Link href="/admin/curriculums" className="flex items-center gap-1.5 text-sm text-inkmute hover:text-accent transition-colors">
            <LayoutGrid className="h-4 w-4" /> Curriculums
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Paras', value: rows.length, color: 'text-ink' },
            { label: 'Overdue', value: overdue, color: 'text-fail' },
            { label: 'In Progress', value: inProgress, color: 'text-info' },
            { label: 'Complete', value: complete, color: 'text-pass' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-line p-4">
              <p className="text-xs text-inkmute mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {overdue > 0 && (
          <div className="bg-failbg border border-fail/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-fail mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-fail text-sm">{overdue} paraprofessional{overdue > 1 ? 's' : ''} overdue on required training</p>
              <p className="text-xs text-fail mt-0.5">Overdue paras may be assigned duties they have not been cleared for. Review and follow up immediately.</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-line overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-ink">Paraprofessional Roster</h2>
          </div>
          <div className="divide-y">
            {rows.map(para => {
              const cfg = STATUS_CONFIG[para.status];
              return (
                <button key={para.id} onClick={() => setSelected(para.id === selected ? null : para.id)} className="w-full text-left px-5 py-4 hover:bg-paper transition-colors flex items-center gap-4 flex-wrap">
                  <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">{para.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-ink">{para.name}</div>
                    <div className="text-xs text-inkmute">{para.role} · {para.curriculum?.name ?? 'No curriculum'} · {para.track} track</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <Progress value={para.pct} className="h-1.5" />
                      <p className="text-xs text-inkfaint mt-1">{para.pct}% complete</p>
                    </div>
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber">
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
          <div className="bg-card rounded-xl border border-line p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-semibold text-ink">{selectedRow.name} — Training Detail</h2>
                <p className="text-sm text-inkmute">{selectedRow.role} · {selectedRow.curriculum.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-inkfaint hover:text-inkmute"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-2 my-4">
              {selectedRow.curriculum.modules.map(cm => {
                const mod = MODULE_MAP[cm.moduleId];
                const prog = selectedRow.progress.find(p => p.moduleId === cm.moduleId);
                const done = prog?.completed ?? false;
                if (!mod) return null;
                return (
                  <div key={cm.moduleId} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${done ? 'bg-passbg' : 'bg-paper'}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-pass' : 'bg-line'}`}>
                      {done && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-ink">{mod.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{cm.day}-day</Badge>
                    </div>
                    <span className={`text-xs shrink-0 ${done ? 'text-pass' : 'text-inkfaint'}`}>{done ? prog?.completedDate : 'Pending'}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-xs font-semibold text-inkmute uppercase tracking-wide mb-2">Cleared duties ({selectedRow.duties.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedRow.duties.length > 0
                  ? selectedRow.duties.map(d => <Badge key={d} variant="outline" className="text-xs bg-passbg text-pass border-pass/30">{d}</Badge>)
                  : <span className="text-sm text-inkfaint italic">No duties cleared yet</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
