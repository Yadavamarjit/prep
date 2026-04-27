import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle2, Circle, ChevronRight, Zap, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSyllabus } from '../hooks/useSyllabus';
import { motion } from 'motion/react';

interface SyllabusViewProps {
  userId: string;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({ userId }) => {
  const { syllabus, progress, toggleChapter, loading } = useSyllabus(userId);
  const [activeSubject, setActiveSubject] = useState(syllabus[0]?.id || 'reasoning');

  if (loading && syllabus.length === 0) return <div className="py-12 text-center text-slate-400">Loading Syllabus Intelligence...</div>;

  const currentSubject = syllabus.find(s => s.id === activeSubject) || syllabus[0];
  
  const getSubjectStats = (subjectId: string) => {
    const subject = syllabus.find(s => s.id === subjectId);
    if (!subject) return { completed: 0, total: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;
    
    subject.sections.forEach(section => {
      section.chapters.forEach(chapter => {
        total++;
        if (progress.completedChapters.includes(chapter)) completed++;
      });
    });
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stats - Mobile Scrollable */}
      <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {syllabus.map(s => {
          const stats = getSubjectStats(s.id);
          const isActive = activeSubject === s.id;
          
          return (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="shrink-0 w-[240px] md:w-auto"
            >
              <Card 
                onClick={() => setActiveSubject(s.id)}
                className={cn(
                  "rounded-[2rem] cursor-pointer transition-all duration-500 border-0 overflow-hidden relative group h-full",
                  isActive ? "bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-[1.02]" : "bg-white hover:bg-slate-50 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                )}
              >
                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isActive ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <BarChart3 className={cn("h-4 w-4", isActive ? "text-white/20" : "text-slate-200")} />
                  </div>
                  <h3 className={cn("font-black text-xs uppercase tracking-[0.2em] mb-1", isActive ? "text-white" : "text-slate-900 dark:text-white")}>
                    {s.id === 'reasoning' ? 'Reasoning' : s.id === 'quant' ? 'Quantitative' : s.id === 'english' ? 'English' : 'Science'}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black">{stats.percentage}%</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-white/40" : "text-slate-400")}>
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                  <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isActive ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800")}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percentage}%` }}
                        className={cn("h-full", isActive ? "bg-indigo-500" : "bg-indigo-600")} 
                      />
                  </div>
                </CardContent>
                {isActive && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-3xl bg-indigo-600 text-white border-0 shadow-xl relative overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 fill-white" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Strategic Performance</span>
                        <p className="text-sm font-bold text-white leading-tight">You are outperforming 84% of aspirants in overall coverage.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-6">Detailed Analytics</Button>
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-6">AI Study Plan</Button>
                </div>
            </CardContent>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
        </Card>
      </div>

      {/* Subject Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{currentSubject?.subject}</CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Mastery Blueprint • SSC CPO 2026</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentSubject?.sections.map((section, sIdx) => {
                  const sectionTotal = section.chapters.length;
                  const sectionCompleted = section.chapters.filter(c => progress.completedChapters.includes(c)).length;
                  const sectionPercentage = Math.round((sectionCompleted / sectionTotal) * 100);

                  return (
                    <div key={sIdx} className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400">
                            {String(sIdx + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{section.section_name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sectionCompleted}/{sectionTotal} Mastery Blocks</span>
                                <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sectionPercentage}%` }} />
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {section.chapters.map((chapter, cIdx) => {
                          const isDone = progress.completedChapters.includes(chapter);
                          
                          return (
                            <div 
                              key={cIdx}
                              onClick={() => toggleChapter(chapter)}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                isDone 
                                  ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30" 
                                  : "bg-white border-slate-100 hover:border-indigo-200 dark:bg-slate-800/50 dark:border-slate-800 dark:hover:border-indigo-900"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-200 group-hover:text-indigo-400" />
                                )}
                                <span className={cn(
                                  "text-xs font-bold tracking-tight",
                                  isDone ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-slate-600 dark:text-slate-300"
                                )}>
                                  {chapter}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`AI Coach is preparing a specialized Mock Test for "${chapter}".\n\nThis will include 10 high-yield questions based on recent SSC CPO patterns.`);
                                }}
                              >
                                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
