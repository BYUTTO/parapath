'use client';

import Link from 'next/link';
import { useStore, getParaTrackStatus, getCompletionPct, getUnlockedDuties } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft, Printer, Download } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  complete: 'Complete', in_progress: 'In Progress', overdue: 'Overdue', not_started: 'Not Started',
};

export default function CompliancePage() {
  const { paras, curriculums, getParaCurriculum, moduleMap } = useStore();

  const rows = paras.map(p => {
    const curriculum = getParaCurriculum(p);
    const signedOff = p.progress.filter(pr => pr.completed);
    return {
      para: p,
      curriculum,
      status: getParaTrackStatus(p, curriculum),
      pct: getCompletionPct(p, curriculum),
      duties: getUnlockedDuties(p, curriculum),
      signedOff,
    };
  });

  const downloadCsv = () => {
    const header = ['Paraprofessional', 'Role', 'Curriculum', 'Status', 'Completion %', 'Modules Signed Off', 'Total Modules', 'Cleared Duties', 'Last Sign-off Date'];
    const lines = rows.map(r => {
      const lastDate = r.signedOff.map(s => s.completedDate).filter(Boolean).sort().slice(-1)[0] ?? '';
      return [
        r.para.name,
        r.para.role,
        r.curriculum?.name ?? '',
        STATUS_LABEL[r.status],
        String(r.pct),
        String(r.signedOff.length),
        String(r.curriculum?.modules.length ?? 0),
        r.duties.join('; '),
        lastDate,
      ].map(csvCell).join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parapath-compliance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-3 print:hidden">
        <Link href="/admin" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-indigo-600" />
        <span className="font-semibold text-sm">ParaPath</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-500">Compliance Report</span>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={downloadCsv} variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> CSV</Button>
          <Button onClick={() => window.print()} size="sm" className="bg-slate-900 hover:bg-slate-700 text-white gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Report header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Paraprofessional Training Compliance Report</h1>
          <p className="text-sm text-slate-500 mt-1">Riverside Unified School District · Generated {today}</p>
          <div className="flex gap-6 mt-3 text-sm">
            <span><span className="font-semibold text-slate-900">{rows.length}</span> <span className="text-slate-500">paras</span></span>
            <span><span className="font-semibold text-emerald-600">{rows.filter(r => r.status === 'complete').length}</span> <span className="text-slate-500">fully compliant</span></span>
            <span><span className="font-semibold text-red-600">{rows.filter(r => r.status === 'overdue').length}</span> <span className="text-slate-500">overdue</span></span>
          </div>
        </div>

        {/* Report table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:border-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 print:bg-white">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Paraprofessional</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Curriculum</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Status</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Modules</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Last Sign-off</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const lastDate = r.signedOff.map(s => s.completedDate).filter(Boolean).sort().slice(-1)[0] ?? '—';
                return (
                  <tr key={r.para.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{r.para.name}</div>
                      <div className="text-xs text-slate-500">{r.para.role}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.curriculum?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${r.status === 'complete' ? 'text-emerald-700' : r.status === 'overdue' ? 'text-red-700' : r.status === 'in_progress' ? 'text-blue-700' : 'text-slate-500'}`}>
                        {STATUS_LABEL[r.status]} ({r.pct}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{r.signedOff.length}/{r.curriculum?.modules.length ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{lastDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cleared duties detail */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 print:border-0">
          <h2 className="font-semibold text-slate-900 mb-3">Duty Clearance Detail</h2>
          <div className="space-y-3">
            {rows.map(r => (
              <div key={r.para.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="text-sm font-medium text-slate-900 mb-1">{r.para.name} <span className="text-slate-400 font-normal">— {r.duties.length} duties cleared</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {r.duties.length > 0
                    ? r.duties.map(d => <Badge key={d} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{d}</Badge>)
                    : <span className="text-xs text-slate-400 italic">None cleared</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 print:mt-8">
          This report reflects supervisor-verified competency sign-offs. Duties are cleared only after a supervisor confirms demonstrated competency via observation checklist. Generated by ParaPath.
        </p>
      </div>
    </div>
  );
}

function csvCell(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
