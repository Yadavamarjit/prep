import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { getCoachFeedback } from './services/aiService';
import { StudyEvent, UserProfile } from './types';
import { Calendar } from './components/Calendar';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import { 
  LogOut, 
  Calendar as CalendarIcon, 
  Settings, 
  Plus, 
  RefreshCw,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { getAccessToken, syncGoogleEvents, createGoogleEvent } from './services/googleCalendarService';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [view, setView] = useState<'dashboard' | 'calendar'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [examDateInput, setExamDateInput] = useState<string>('');

  const [newEvent, setNewEvent] = useState<Partial<StudyEvent>>({
    title: '',
    type: 'study',
    description: '',
    subject: 'General',
    status: 'pending'
  });

  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try getting a dummy doc to verify connectivity
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firebase connection verified");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase is in offline mode or connection is pending.");
        } else {
          // It's okay if the doc doesn't exist, we just want to see if we can reach the server
          console.log("Firebase server reached (test doc may not exist)");
        }
      }
    };
    testConnection();
  }, []);

  // Theme Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profileRef = doc(db, 'users', u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || '',
            prepProgress: {},
            overallProgress: 0,
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Events Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyEvent));
      setEvents(evts);
    });
    return unsubscribe;
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleAddEvent = async () => {
    if (!user || !newEvent.title) return;
    
    const eventData = {
      ...newEvent,
      userId: user.uid,
      subject: newEvent.subject || 'General',
      startTime: selectedDate.getTime(),
      endTime: selectedDate.getTime() + (60 * 60 * 1000), // 1 hour default
      reminded: false,
    };

    await addDoc(collection(db, 'users', user.uid, 'events'), eventData);
    setIsEventDialogOpen(false);
    setNewEvent({ title: '', type: 'study', description: '', subject: 'General' });
  };

  const handleApplyTimetable = async () => {
    if (!user) return;
    
    const TIMETABLE_TEMPLATE = [
      { start: '06:00', end: '09:20', title: 'Physical Conditioning', subject: 'Quant', type: 'study', description: '4km Run + Boxing. Builds QAT endurance.' },
      { start: '09:20', end: '10:00', title: 'Recovery', subject: 'General', type: 'reminder', description: 'Breakfast & Hydration' },
      { start: '10:00', end: '11:30', title: 'English (Grammar/RC)', subject: 'English', type: 'study', description: 'Mind is sharpest here.' },
      { start: '11:30', end: '14:00', title: 'Tech Lead Duties', subject: 'General', type: 'study', description: 'Stand-ups, code reviews.' },
      { start: '14:00', end: '15:30', title: 'Reasoning & GK', subject: 'Reasoning', type: 'study', description: '45m PYQs, 45m Static GK/Current Affairs.' },
      { start: '15:30', end: '17:30', title: 'Profession Wrap-up', subject: 'General', type: 'study', description: 'Finish IT tasks & planning.' },
      { start: '17:30', end: '19:30', title: 'Quant (Maths)', subject: 'Quant', type: 'study', description: 'Heavy lifting. 200kg deadlift mindset.' },
      { start: '19:30', end: '20:30', title: 'Dinner & Detach', subject: 'General', type: 'reminder', description: 'Walk around Nehru Vihar.' },
      { start: '20:30', end: '21:30', title: 'Light Revision', subject: 'Awareness', type: 'study', description: 'Vocab / GK PDFs / Mistakes' },
      { start: '22:00', end: '23:00', title: 'Hard Stop (Sleep)', subject: 'General', type: 'deadline', description: 'Secure 8 hours.' }
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of TIMETABLE_TEMPLATE) {
      const startParts = item.start.split(':');
      const endParts = item.end.split(':');

      const startTime = new Date(today);
      startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]));

      const endTime = new Date(today);
      endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

      await addDoc(collection(db, 'users', user.uid, 'events'), {
        userId: user.uid,
        title: item.title,
        description: item.description,
        type: item.type,
        subject: item.subject,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        status: 'pending',
        reminded: false,
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !selectedEvent) return;

    setIsCoachThinking(true);
    try {
      const feedback = await getCoachFeedback(selectedEvent, completionNotes);
      
      const eventRef = doc(db, 'users', user.uid, 'events', selectedEvent.id);
      await updateDoc(eventRef, {
        status: 'completed',
        completionNotes: completionNotes,
        aiFeedback: feedback
      });

      // Update overall progress (crude estimation)
      const newProgress = Math.min(100, (profile?.overallProgress || 0) + 1);
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { overallProgress: newProgress }, { merge: true });
      setProfile(p => p ? { ...p, overallProgress: newProgress } : null);

      setIsCompletionDialogOpen(false);
      setSelectedEvent(null);
      setCompletionNotes('');
    } catch (error) {
      console.error("Failed to complete task:", error);
    } finally {
      setIsCoachThinking(false);
    }
  };

  const handleSyncGoogle = async () => {
    try {
        const token = await getAccessToken();
        const googleEvents = await syncGoogleEvents(token);
        
        // Basic merge logic: add if not exists
        for (const ge of googleEvents) {
            const exists = events.find(e => e.title === ge.summary);
            if (!exists && user) {
                await addDoc(collection(db, 'users', user.uid, 'events'), {
                    userId: user.uid,
                    title: ge.summary,
                    description: ge.description || '',
                    type: 'study',
                    subject: 'General',
                    startTime: new Date(ge.start.dateTime || ge.start.date).getTime(),
                    endTime: new Date(ge.end.dateTime || ge.end.date).getTime(),
                    status: 'pending',
                    reminded: false,
                    isGoogleEvent: true,
                    googleEventId: ge.id
                });
            }
        }
    } catch (error) {
        console.error('Sync failed', error);
    }
  };

  const handleUpdateExamDate = async () => {
    if (!user || !examDateInput) return;
    const date = new Date(examDateInput);
    if (isNaN(date.getTime())) return;

    const profileRef = doc(db, 'users', user.uid);
    const updatedProfile = { ...profile, examDate: date.getTime() } as UserProfile;
    await setDoc(profileRef, updatedProfile, { merge: true });
    setProfile(updatedProfile);
    setIsProfileDialogOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-indigo-200 shadow-xl">
                <CalendarIcon className="text-white h-8 w-8" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter text-slate-900">CPO Master</h1>
            <p className="text-slate-500 mb-10 text-lg font-medium">Your elite prep calendar</p>
            <Button onClick={handleLogin} className="w-full h-14 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-100">
                Sign in with Google
            </Button>
            <div className="mt-12 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offline Mode Ready</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors font-sans flex flex-col", isDarkMode ? "bg-slate-950" : "bg-slate-50")}>
      <nav className="h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block dark:text-white text-slate-900">CPO Master <span className="text-slate-400 font-normal">| Prep Hub</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="rounded-xl h-9 w-9 text-slate-400 hover:text-indigo-600 transition-colors"
                id="theme-toggle"
            >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-100 dark:border-green-800 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Offline Ready
            </div>
            <div className="flex items-center gap-2 text-slate-400">
                <RefreshCw className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Last Sync: Just now</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800" />
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full h-8 w-8 text-slate-400 hover:text-rose-500">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-10">
                    <TabsTrigger value="dashboard" className="rounded-lg px-4 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-bold text-[10px] uppercase tracking-wider transition-all">
                        <LayoutDashboard className="h-3 w-3" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-lg px-4 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-bold text-[10px] uppercase tracking-wider transition-all">
                        <CalendarIcon className="h-3 w-3" /> Calendar
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSyncGoogle} className="rounded-xl gap-2 text-[10px] font-bold uppercase tracking-wider border-slate-200">
                    <RefreshCw className="h-3 w-3" /> Sync Google
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEventDialogOpen(true)} className="rounded-xl gap-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white border-transparent hover:bg-indigo-700">
                    <Plus className="h-3 w-3" /> New Event
                </Button>
            </div>
        </div>

        {view === 'dashboard' ? (
          <div className="space-y-6">
            {events.length === 0 && (
                <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                            <Plus className="text-indigo-600 h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Start with our elite strategy</p>
                            <p className="text-xs text-indigo-700/60 dark:text-indigo-400/60 font-medium">Apply the recommended CPO 2026 timetable template.</p>
                        </div>
                    </div>
                    <Button onClick={handleApplyTimetable} variant="outline" className="rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-white dark:hover:bg-slate-800 bg-transparent font-bold text-xs uppercase tracking-wider">
                        Apply Suggested Plan
                    </Button>
                </div>
            )}
            <Dashboard 
                user={profile || { uid: '', email: '', displayName: '', prepProgress: {}, overallProgress: 0 }} 
                events={events} 
                onSetExamDate={() => {
                    if (profile?.examDate) {
                        setExamDateInput(new Date(profile.examDate).toISOString().split('T')[0]);
                    }
                    setIsProfileDialogOpen(true);
                }}
                onCompleteEvent={(e) => {
                    setSelectedEvent(e);
                    setIsCompletionDialogOpen(true);
                }}
            />
          </div>
        ) : (
          <Calendar 
            events={events} 
            onAddEvent={(d) => { setSelectedDate(d); setIsEventDialogOpen(true); }}
            onSelectEvent={(e) => { /* Handle edit/view details */ }}
          />
        )}
      </main>

      <footer className="h-10 px-8 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Focused preparation for SSC CPO 2026</p>
        <div className="flex gap-4">
          <span className="text-[10px] text-slate-300 font-bold">STABLE BUILD 2.4.0</span>
        </div>
      </footer>

      {/* Profile Settings Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md p-8 border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 mb-6">Target Exam Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Select Exam Date</Label>
              <Input 
                type="date"
                value={examDateInput}
                onChange={e => setExamDateInput(e.target.value)}
                className="rounded-xl h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-indigo-600 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 italic mt-2">This date will be used to calculate your countdown on the dashboard.</p>
            </div>
            <Button onClick={handleUpdateExamDate} className="w-full h-14 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-lg transition-all shadow-lg">
              Save Exam Date
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md p-8 border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 mb-6">Mission Accomplished</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Session Highlights / Notes</Label>
              <textarea 
                className="w-full min-h-[120px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all"
                placeholder="What did you achieve? Any pitfalls? e.g., Mastered 20 geometry formulas, skipped 2 hard ones."
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                disabled={isCoachThinking}
              />
            </div>
            <Button 
                onClick={handleMarkComplete} 
                className={cn(
                    "w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-100",
                    isCoachThinking && "opacity-50 cursor-not-allowed"
                )}
                disabled={isCoachThinking}
            >
              {isCoachThinking ? (
                  <span className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" /> Coach is Reviewing...
                  </span>
              ) : "Log Progress & Get Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md p-8 border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 mb-6">Schedule Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Session Title</Label>
              <Input 
                placeholder="e.g., Algebra Revision" 
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="rounded-xl h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-indigo-600 transition-all font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Subject</Label>
                    <select 
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none uppercase tracking-wider"
                        value={newEvent.subject}
                        onChange={e => setNewEvent({...newEvent, subject: e.target.value as any})}
                    >
                        <option value="Quant">Quant Aptitude</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Awareness">Awareness</option>
                        <option value="English">English</option>
                        <option value="General">General/Misc</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Event Type</Label>
                    <select 
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none uppercase tracking-wider"
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    >
                        <option value="study">Study Plan</option>
                        <option value="exam">Official Exam</option>
                        <option value="deadline">Deadline</option>
                        <option value="reminder">Reminder</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Notes</Label>
              <textarea 
                className="w-full min-h-[100px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all"
                placeholder="Key concepts to tackle..."
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <Button onClick={handleAddEvent} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-lg shadow-indigo-100">
              Confirm Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
