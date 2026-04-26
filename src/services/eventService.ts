import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { StudyEvent } from '../types';

export const eventService = {
  subscribeToEvents: (userId: string, callback: (events: StudyEvent[]) => void) => {
    const q = query(
      collection(db, 'users', userId, 'events'), 
      orderBy('startTime', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyEvent));
      callback(events);
    });
  },

  addEvent: async (userId: string, event: Partial<StudyEvent>) => {
    return await addDoc(collection(db, 'users', userId, 'events'), {
      ...event,
      userId,
      status: event.status || 'pending',
      reminded: false,
      createdAt: Date.now(),
    });
  },

  updateEvent: async (userId: string, eventId: string, updates: Partial<StudyEvent>) => {
    const eventRef = doc(db, 'users', userId, 'events', eventId);
    return await updateDoc(eventRef, updates);
  },

  completeEvent: async (userId: string, eventId: string, notes: string, aiFeedback?: string) => {
    return await updateDoc(doc(db, 'users', userId, 'events', eventId), {
      status: 'completed',
      completionNotes: notes,
      aiFeedback,
      completedAt: Date.now(),
    });
  }
};
