import React from 'react';
import { Target, Timer, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { UserProfile, StudyEvent } from '../types';
import { differenceInDays } from 'date-fns';
import { cn } from '../lib/utils';
import { isSameDay } from '../lib/date-utils';

import { motion, AnimatePresence } from 'motion/react';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row gap-6 mb-8"
    >
      {/* Left Area: Summary */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="rounded-[2rem] border-0 shadow-2xl overflow-hidden bg-slate-900 text-white relative group h-40 md:h-48">
            <CardHeader className="pb-1 relative z-10">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Global Mastery</CardTitle>
                   <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                     <Target className="h-4 w-4 text-white" />
                   </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="flex items-baseline gap-1 mb-2 md:mb-4">
                <span className="text-5xl md:text-6xl font-black">{user.overallProgress}</span>
                <span className="text-xl md:text-2xl font-bold opacity-30">%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user.overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                />
              </div>
            </CardContent>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </Card>

          <Card className="rounded-[2rem] shadow-xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-2xl overflow-hidden relative h-40 md:h-48">
            <CardHeader className="pb-1">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Days to Exam</CardTitle>
                   <button onClick={onSetExamDate} className="h-8 w-8 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">
                     <Timer className="h-4 w-4" />
                   </button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
              {daysRemaining !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-rose-500 tabular-nums">{String(daysRemaining).padStart(2, '0')}</span>
                  <span className="text-sm md:text-lg font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400 py-4 cursor-pointer hover:text-indigo-600 transition-all group" onClick={onSetExamDate}>
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Set Mission Date</span>
                </div>
              )}
            </CardContent>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card className="rounded-[2.5rem] shadow-sm border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syllabus Mastery</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8 pb-8">
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
      <div className="w-full lg:w-[400px] flex flex-col">
        <Card className="rounded-[2.5rem] shadow-2xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="pb-4 shrink-0 border-b border-slate-50 dark:border-slate-800/50 mx-6 px-0 pt-8">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                    <CardTitle className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Strategic Agenda</CardTitle>
                 </div>
                 <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                    <CheckCircle className="h-4 w-4" />
                 </div>
              </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-6">
            <div className="space-y-5 pb-4">
               {todaysEvents.length > 0 ? (
                   todaysEvents.map((e, idx) => {
                       const isActive = activeEvent?.id === e.id;
                       const isNext = nextEvent?.id === e.id && !isActive;
                       const isPast = now > e.endTime && e.status !== 'completed';
                       const isCompleted = e.status === 'completed';
                       
                       return (
                          <motion.div 
                            key={e.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "relative flex gap-4 items-start p-5 rounded-[1.5rem] transition-all duration-500 group border",
                                isActive ? "bg-indigo-600 border-indigo-500 shadow-[0_20px_40px_rgba(79,70,229,0.2)] dark:shadow-none scale-[1.03] z-10" : 
                                isNext ? "bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/50 shadow-sm mt-3" :
                                isCompleted ? "bg-slate-50/50 dark:bg-slate-900/40 border-transparent opacity-80" :
                                "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                            )}
                          >
                              {isNext && (
                                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em] shadow-lg z-20 animate-in zoom-in duration-500">Next Mission</div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1.5">
                                    <p className={cn(
                                        "text-sm font-black leading-snug truncate",
                                        isActive ? "text-white" : "text-slate-900 dark:text-white",
                                        isCompleted && "line-through text-slate-500 dark:text-slate-600"
                                    )}>
                                        {e.title}
                                    </p>
                                    {isActive && (
                                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                                            <Zap className="h-3 w-3 text-white fill-white animate-pulse" />
                                        </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-3">
                                      <div className={cn(
                                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                          isActive ? "bg-white/10 text-indigo-100" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                      )}>
                                        {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      <div className={cn(
                                          "text-[9px] font-bold uppercase tracking-widest",
                                          isActive ? "text-indigo-200" : "text-slate-400"
                                      )}>
                                        {e.subject}
                                      </div>
                                      {isCompleted && <CheckCircle className="h-3 w-3 text-emerald-500 ml-auto" />}
                                  </div>

                                  {(isActive || isPast || isNext) && !isCompleted && (
                                      <button 
                                        onClick={() => onCompleteEvent(e)}
                                        className={cn(
                                            "w-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm",
                                            isActive ? "bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-md" : 
                                            "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                        )}
                                      >
                                          Commit Progress <CheckCircle className="h-3 w-3" />
                                      </button>
                                  )}

                                  {isCompleted && e.aiFeedback && (
                                      <div className="mt-3 p-4 bg-white/40 dark:bg-slate-900/60 rounded-2xl border border-white/20 dark:border-slate-800/50 backdrop-blur-sm">
                                          <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                              <Zap className="h-3 w-3 fill-indigo-500" /> Strategic Insight
                                          </p>
                                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic opacity-80">
                                              "{e.aiFeedback}"
                                          </p>
                                      </div>
                                  )}
                              </div>
                          </motion.div>
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
    </motion.div>
  );
};
