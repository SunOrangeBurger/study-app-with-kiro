// Core data types for StudySync

export interface User {
  _id: string;
  username: string;
}

export interface Subject {
  subject_name: string;
  units: Unit[];
}

export interface Unit {
  unit_name: string;
  concepts: string[];
}

export interface Test {
  name: string;
  date: string; // YYYY-MM-DD
  type: 'Quiz' | 'Midterm' | 'Final';
  subject_name: string;
  covered_topics: string[];
  portion: string;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'Website' | 'Document' | 'YouTube Video';
  link: string;
  added_by: string;
  added_at: Date;
}

export interface Group {
  _id: string;
  name: string;
  owner_id: string;
  members: string[];
  invite_code: string;
  syllabus: Subject[];
  tests: Test[];
  resources: Resource[];
  pending_resources: Resource[];
}

export interface ProgressEntry {
  concept: string; // full key: "Subject||Unit||Concept"
  at: Date;
}

export interface Progress {
  _id: string;
  user_id: string;
  group_id: string;
  username: string;
  history: ProgressEntry[];
}

export type PriorityLevel = 'critical' | 'high' | 'revision-old' | 'revision-recent';

export interface PriorityMap {
  [conceptKey: string]: PriorityLevel;
}

export interface CountdownData {
  test: Test;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  urgentTopics: string[];
}