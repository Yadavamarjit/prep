export type EventType = 'study' | 'exam' | 'reminder' | 'deadline';
export type EventStatus = 'pending' | 'completed' | 'missed';

export type EventSubject = 'Quant' | 'Reasoning' | 'Awareness' | 'English' | 'General';

export interface StudyEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: EventType;
  subject: EventSubject;
  startTime: number; // timestamp
  endTime: number; // timestamp
  isRecurring: boolean;
  recurrenceRule?: string;
  status: EventStatus;
  reminded: boolean;
  color?: string;
  completionNotes?: string;
  aiFeedback?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  prepProgress: Record<string, number>; // subject -> percentage
  overallProgress: number;
  examDate?: number; // timestamp
}
