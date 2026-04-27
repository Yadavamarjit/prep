import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { StudyEvent } from './types';
import { cn } from './lib/utils';

// UI Components
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { LayoutDashboard, Calendar as CalendarIcon, LogOut, Sun, Moon, Plus, BookOpen } from 'lucide-react';

// Custom Components
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { SyllabusView } from './components/SyllabusView';
import { Login } from './components/Login';
import { AddEventDialog } from './components/modals/AddEventDialog';
import { CompletionDialog } from './components/modals/CompletionDialog';

// Hooks & Services
import { useEvents } from './hooks/useEvents';
import { useProfile } from './hooks/useProfile';
import { eventService } from './services/eventService';
import { getCoachFeedback } from './services/aiService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const { events, loading: eventsLoading } = useEvents(user?.uid);
  const { profile, loading: profileLoading } = useProfile(user);
  const location = useLocation();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dialog States
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleLogin = () => signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = () => signOut(auth);

  const handleAddEvent = async (event: Partial<StudyEvent>, date: string, start: string, end: string, recurrence: string) => {
    if (!user) return;
    
    const [year, month, day] = date.split('-').map(Number);
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    const startTime = new Date(year, month - 1, day, startH, startM).getTime();
    const endTime = new Date(year, month - 1, day, endH, endM).getTime();

    await eventService.addEvent(user.uid, {
      ...event,
      startTime,
      endTime,
      isRecurring: recurrence !== 'none',
      recurrenceRule: recurrence !== 'none' ? recurrence : undefined,
    });
  };

  const handleCompleteEvent = async (event: StudyEvent, notes: string) => {
    if (!user) return;
    setIsCoachThinking(true);
    try {
      const feedback = await getCoachFeedback(event, notes);
      await eventService.completeEvent(user.uid, event.id, notes, feedback);
      setIsCompletionDialogOpen(false);
      setCompletionNotes('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCoachThinking(false);
    }
  };

  const uniqueTitles = useMemo(() => {
    const defaults = ["Physical Conditioning", "Quant (Maths)", "English (Grammar/RC)", "Reasoning & GK", "Light Revision", "Tech Lead Duties", "Vocabulary Review", "Mock Test", "Current Affairs"];
    const history = events.map(e => e.title);
    return Array.from(new Set([...defaults, ...history])).sort();
  }, [events]);

  if (!user) return <Login onLogin={handleLogin} />;
  if (profileLoading || eventsLoading) return <div className="min-h-screen flex items-center justify-center">Loading Tactical Data...</div>;

  return (
    <div className={cn("min-h-screen transition-colors font-sans flex flex-col pb-20 md:pb-0", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
      {/* Top Header - Desktop & Mobile */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <LayoutDashboard className="h-4 w-4 md:h-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5 md:mb-1">CPO MASTER</h1>
              <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{profile?.displayName?.split(' ')[0] || 'Elite Candidate'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop Nav */}
            <div className="hidden md:flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 h-9 items-center mr-2">
                <Link 
                    to="/" 
                    className={cn(
                        "rounded-lg text-[10px] uppercase font-black tracking-widest px-4 h-full flex items-center transition-all",
                        location.pathname === '/' ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <LayoutDashboard className="h-3 w-3 mr-2" /> Overview
                </Link>
                <Link 
                    to="/syllabus" 
                    className={cn(
                        "rounded-lg text-[10px] uppercase font-black tracking-widest px-4 h-full flex items-center transition-all",
                        location.pathname === '/syllabus' ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <BookOpen className="h-3 w-3 mr-2" /> Syllabus
                </Link>
                <Link 
                    to="/calendar" 
                    className={cn(
                        "rounded-lg text-[10px] uppercase font-black tracking-widest px-4 h-full flex items-center transition-all",
                        location.pathname === '/calendar' ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <CalendarIcon className="h-3 w-3 mr-2" /> Calendar
                </Link>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-8 w-8 md:h-10 md:w-10 rounded-xl text-slate-400 hover:text-indigo-600">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 md:h-10 md:w-10 rounded-xl text-slate-400 hover:text-rose-600">
              <LogOut className="h-4 w-4" />
            </Button>
            
            <Button onClick={() => setIsEventDialogOpen(true)} className="h-8 w-8 md:h-10 md:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest px-0 md:px-6 shadow-lg shadow-indigo-200 dark:shadow-none ml-1">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline text-[10px]">New Event</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-around items-center">
        <Link to="/" className={cn("flex flex-col items-center gap-1 transition-colors", location.pathname === '/' ? "text-indigo-600" : "text-slate-400")}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Overview</span>
        </Link>
        <Link to="/syllabus" className={cn("flex flex-col items-center gap-1 transition-colors", location.pathname === '/syllabus' ? "text-indigo-600" : "text-slate-400")}>
            <BookOpen className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Syllabus</span>
        </Link>
        <Link to="/calendar" className={cn("flex flex-col items-center gap-1 transition-colors", location.pathname === '/calendar' ? "text-indigo-600" : "text-slate-400")}>
            <CalendarIcon className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Calendar</span>
        </Link>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-12 md:pb-6">
        <Routes>
          <Route path="/" element={
            <Dashboard 
              user={profile!} 
              events={events} 
              onSetExamDate={() => {}} 
              onCompleteEvent={(e) => { setSelectedEvent(e); setIsCompletionDialogOpen(true); }}
            />
          } />
          <Route path="/syllabus" element={<SyllabusView userId={user.uid} />} />
          <Route path="/calendar" element={
            <Calendar 
              events={events} 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate}
              onAddEvent={() => setIsEventDialogOpen(true)}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AddEventDialog 
        isOpen={isEventDialogOpen} 
        onOpenChange={setIsEventDialogOpen} 
        onAdd={handleAddEvent} 
        selectedDate={selectedDate} 
        uniqueTitles={uniqueTitles} 
      />

      <CompletionDialog 
        isOpen={isCompletionDialogOpen} 
        onOpenChange={setIsCompletionDialogOpen} 
        event={selectedEvent} 
        onComplete={handleCompleteEvent} 
        isThinking={isCoachThinking} 
        notes={completionNotes} 
        onNotesChange={setCompletionNotes} 
      />
    </div>
  );
}
