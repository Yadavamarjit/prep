import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { getCalendarDays, formatMonth, isSameMonth, isSameDay, addMonths, subMonths } from '../lib/date-utils';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { StudyEvent } from '../types';
import { motion } from 'motion/react';

interface CalendarProps {
  events: StudyEvent[];
  onAddEvent: (date: Date) => void;
  onSelectEvent: (event: StudyEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = getCalendarDays(currentDate);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const subjectColors: Record<string, string> = {
    'Quant': 'bg-indigo-500',
    'Reasoning': 'bg-purple-500',
    'Awareness': 'bg-rose-500',
    'English': 'bg-emerald-500',
    'General': 'bg-slate-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors"
    >
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
                 <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                    {formatMonth(currentDate)}
                 </h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Deployment Schedule</p>
            </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl h-10 w-10 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl h-10 w-10 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-b border-slate-50 dark:border-slate-800/50 last:border-r-0 bg-slate-50/30 dark:bg-slate-800/20">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
          const isSelectedMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] md:min-h-[120px] p-2 md:p-3 border-r border-b border-slate-50 dark:border-slate-800 group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50 last:border-r-0 relative",
                !isSelectedMonth && "opacity-20 pointer-events-none"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                   "text-[10px] md:text-xs font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg transition-all",
                   isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-110" : "text-slate-500 dark:text-slate-400"
                )}>
                  {day.getDate()}
                </span>
                <button 
                  onClick={() => onAddEvent(day)}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 md:h-8 md:w-8 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all text-indigo-400"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </div>
              
              {/* Mobile Dots */}
              <div className="flex flex-wrap gap-1 md:hidden">
                {dayEvents.map(event => (
                    <div key={event.id} className={cn("w-1.5 h-1.5 rounded-full", subjectColors[event.subject] || 'bg-slate-400')} />
                ))}
              </div>

              {/* Desktop List */}
              <div className="hidden md:block space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={cn(
                        "w-full text-left text-[9px] px-2 py-1.5 rounded-lg truncate transition-all font-black border border-transparent flex items-center gap-2",
                        event.type === 'exam' ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400" :
                        event.type === 'deadline' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400" :
                        "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-md"
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", subjectColors[event.subject] || 'bg-slate-400')} />
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[8px] font-black text-slate-300 dark:text-slate-600 pl-2 uppercase tracking-widest">
                    + {dayEvents.length - 3} More
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
