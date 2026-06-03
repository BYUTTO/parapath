export type TrackDay = 30 | 60 | 90;
export type TrackStatus = 'not_started' | 'in_progress' | 'complete' | 'overdue';

// A reusable training module in the district's library.
// Note: no track day here — the day is assigned per-curriculum.
export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  duties: string[]; // duties unlocked once a supervisor signs off
  competencies: string[]; // observable behaviors a supervisor checks off
}

// A module placed into a specific curriculum at a specific track day.
export interface CurriculumModule {
  moduleId: string;
  day: TrackDay;
}

// A named training path. Assembled from library modules, targeted at roles.
export interface Curriculum {
  id: string;
  name: string;
  description: string;
  appliesToRoles: string[]; // roles auto-assigned this curriculum
  modules: CurriculumModule[];
}

export interface ParaProgress {
  moduleId: string;
  completed: boolean;            // signed off by a supervisor → duties unlocked
  completedDate?: string;        // date of supervisor sign-off
  submittedForSignoff?: boolean; // para watched + attested, awaiting supervisor review
  submittedDate?: string;
  signedOffBy?: string;          // supervisor name
}

export interface Para {
  id: string;
  name: string;
  role: string;
  startDate: string;
  avatar: string;
  curriculumId: string; // which curriculum this para is on
  progress: ParaProgress[];
}

export const PARA_ROLES = [
  'Special Ed Para',
  'Behavioral Para',
  'Inclusion Para',
  'Health Aide',
];
