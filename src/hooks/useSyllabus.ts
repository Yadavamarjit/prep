import { useState, useEffect } from 'react';
import { syllabusService, SyllabusSubject, UserSyllabusProgress } from '../services/syllabusService';

export function useSyllabus(userId: string | undefined) {
  const [syllabus, setSyllabus] = useState<SyllabusSubject[]>([]);
  const [progress, setProgress] = useState<UserSyllabusProgress>({ completedChapters: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      const data = await syllabusService.getGlobalSyllabus();
      setSyllabus(data);
    };
    fetchSyllabus();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = syllabusService.subscribeToProgress(userId, (newProgress) => {
      setProgress(newProgress);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const toggleChapter = async (chapterName: string) => {
    if (!userId) return;
    await syllabusService.toggleChapter(userId, chapterName, progress.completedChapters);
  };

  return { syllabus, progress, toggleChapter, loading };
}
