import React from 'react';
import { Target, Timer, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { UserProfile, StudyEvent } from '../types';
import { differenceInDays } from 'date-fns';
import { cn } from '../lib/utils';
import { isSameDay } from '../lib/date-utils';

interface DashboardProps {
  user: UserProfile;
  events: StudyEvent[];
  onSetExamDate: () => void;
  onCompleteEvent: (event: StudyEvent) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, events, onSetExamDate, onCompleteEvent }) => {
  const now = Date.now();
  
  // Prioritize user's set exam date, fallback to nearest exam event
  const examTimestamp = user.examDate || events
    .filter(e => e.type === 'exam' && e.startTime > now)
    .sort((a, b) => a.startTime - b.startTime)[0]?.startTime;

  const daysRemaining = examTimestamp 
    ? differenceInDays(new Date(examTimestamp), new Date()) 
    : null;

  const subjects = ['Quant', 'Reasoning', 'Awareness', 'English'];
  
  const getSubjectProgress = (subject: string) => {
    const subjectEvents = events.filter(e => e.subject === subject || e.title.toLowerCase().includes(subject.toLowerCase()));
    if (subjectEvents.length === 0) return 0;
    const completed = subjectEvents.filter(e => e.status === 'completed').length;
    return Math.round((completed / subjectEvents.length) * 100);
  };

  const todaysEvents = events
    .filter(e => isSameDay(new Date(e.startTime), new Date()))
    .sort((a, b) => a.startTime - b.startTime);

  const activeEvent = todaysEvents.find(e => now >= e.startTime && now <= e.endTime);

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Left Area: Summary */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-slate-900 text-white border-0 relative">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start relative z-10">
                   <CardTitle className="text-xs font-bold opacity-60 uppercase tracking-widest">Global Mastery</CardTitle>
                   <Target className="h-4 w-4 opacity-50" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-black mb-4">{user.overallProgress}%</div>
              <Progress value={user.overallProgress} className="h-1.5 bg-white/20" />
            </CardContent>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full"></div>
          </Card>

          <Card className="rounded-3xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Days to Exam</CardTitle>
                   <button onClick={onSetExamDate} className="text-slate-300 hover:text-indigo-600 transition-colors">
                     <Timer className="h-4 w-4" />
                   </button>
                </div>
            </CardHeader>
            <CardContent>
              {daysRemaining !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-rose-500">{String(daysRemaining).padStart(2, '0')}</span>
                  <span className="text-lg font-medium text-slate-400 dark:text-slate-500">Remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={onSetExamDate}>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Set your exam date</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card className="rounded-3xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-tighter text-slate-400">Syllabus Mastery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjects.map(subject => {
              const progress = getSubjectProgress(subject);
              const colorClass = progress < 50 ? "bg-rose-500" : progress < 80 ? "bg-indigo-400" : "bg-indigo-600";
              const textColorClass = progress < 50 ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400";
              
              return (
                <div key={subject}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-600 dark:text-slate-300">{subject} {subject === 'Quant' ? 'Aptitude' : subject === 'Awareness' ? 'General' : ''}</span>
                    <span className={textColorClass}>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right Area: Agenda */}
      <div className="w-full lg:w-80">
        <Card className="rounded-3xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors h-full">
          <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                 <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Today's Focus</CardTitle>
                 <CheckCircle className="h-4 w-4 text-slate-300 dark:text-slate-700" />
              </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {todaysEvents.length > 0 ? (
                   todaysEvents.map(e => {
                       const isActive = activeEvent?.id === e.id;
                       const isPast = now > e.endTime && e.status !== 'completed';
                       
                       return (
                          <div 
                            key={e.id} 
                            className={cn(
                                "flex gap-4 items-start p-3 border-l-4 rounded-r-xl group transition-all",
                                isActive ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 shadow-sm" : 
                                e.status === 'completed' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10 opacity-60" :
                                "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                            )}
                          >
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className={cn(
                                        "text-sm font-bold text-slate-900 dark:text-white",
                                        e.status === 'completed' && "line-through text-slate-500 dark:text-slate-400"
                                    )}>
                                        {e.title}
                                    </p>
                                    {isActive && (
                                        <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-widest font-black">Active</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-wider">
                                    {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.subject}
                                  </p>
                                  {(isActive || isPast) && e.status !== 'completed' && (
                                      <button 
                                        onClick={() => onCompleteEvent(e)}
                                        className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1"
                                      >
                                          Mark Complete <CheckCircle className="h-3 w-3" />
                                      </button>
                                  )}
                                  {e.status === 'completed' && e.completionNotes && (
                                      <p className="mt-1 text-[9px] text-emerald-600 dark:text-emerald-400 italic">Notes: {e.completionNotes}</p>
                                  )}
                                  {e.status === 'completed' && e.aiFeedback && (
                                      <div className="mt-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                                          <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-1 mb-1">
                                              <Zap className="h-2.5 w-2.5 fill-indigo-500" /> Coach Intelligence
                                          </p>
                                          <p className="text-[10px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed font-medium">
                                              {e.aiFeedback}
                                          </p>
                                      </div>
                                  )}
                              </div>
                          </div>
                       );
                   })
               ) : (
                   <div className="text-center py-12 opacity-40">
                      <Timer className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs font-mono uppercase tracking-widest">Clear Schedule</p>
                   </div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
