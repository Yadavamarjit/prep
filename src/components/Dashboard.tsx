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
  if (!user) return null;
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
  const nextEvent = todaysEvents.find(e => e.startTime > now && e.status !== 'completed');

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
      <div className="w-full lg:w-96 flex flex-col">
        <Card className="rounded-3xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors flex flex-col h-[520px]">
          <CardHeader className="pb-4 shrink-0">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Today's Focus</CardTitle>
                 </div>
                 <CheckCircle className="h-4 w-4 text-slate-300 dark:text-slate-700" />
              </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3 pb-4">
               {todaysEvents.length > 0 ? (
                   todaysEvents.map(e => {
                       const isActive = activeEvent?.id === e.id;
                       const isNext = nextEvent?.id === e.id && !isActive;
                       const isPast = now > e.endTime && e.status !== 'completed';
                       const isCompleted = e.status === 'completed';
                       
                       return (
                          <div 
                            key={e.id} 
                            className={cn(
                                "relative flex gap-4 items-start p-4 rounded-2xl transition-all duration-300 group border",
                                isActive ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-indigo-950 scale-[1.02] z-10" : 
                                isNext ? "bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-sm" :
                                isCompleted ? "bg-slate-50/50 dark:bg-slate-900/50 border-transparent opacity-50" :
                                "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                            )}
                          >
                              {isNext && (
                                  <div className="absolute -top-2 left-4 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-sm">Next Mission</div>
                              )}
                              
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className={cn(
                                        "text-sm font-bold leading-tight",
                                        isActive ? "text-white" : "text-slate-900 dark:text-white",
                                        isCompleted && "line-through text-slate-400 dark:text-slate-600"
                                    )}>
                                        {e.title}
                                    </p>
                                    {isActive && (
                                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                                            <Zap className="h-3 w-3 text-white fill-white animate-pulse" />
                                        </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-2">
                                      <p className={cn(
                                          "text-[10px] font-bold uppercase tracking-widest",
                                          isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"
                                      )}>
                                        {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.subject}
                                      </p>
                                      {isCompleted && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                                  </div>

                                  {(isActive || isPast || isNext) && !isCompleted && (
                                      <button 
                                        onClick={() => onCompleteEvent(e)}
                                        className={cn(
                                            "mt-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                                            isActive ? "bg-white text-indigo-600 hover:bg-indigo-50" : 
                                            "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                        )}
                                      >
                                          Commit Progress <CheckCircle className="h-3 w-3" />
                                      </button>
                                  )}

                                  {isCompleted && e.aiFeedback && (
                                      <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white/20 dark:border-slate-800/50">
                                          <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                                              <Zap className="h-2.5 w-2.5 fill-indigo-500" /> Strategic Insight
                                          </p>
                                          <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                                              "{e.aiFeedback}"
                                          </p>
                                      </div>
                                  )}
                              </div>
                          </div>
                       );
                   })
               ) : (
                   <div className="text-center py-20 opacity-20">
                      <Timer className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">No Active Focus</p>
                   </div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
