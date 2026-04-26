import { useState, useEffect } from 'react';
import { StudyEvent } from '../types';
import { eventService } from '../services/eventService';

export function useEvents(userId: string | undefined) {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = eventService.subscribeToEvents(userId, (fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { events, loading };
}
