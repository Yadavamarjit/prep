import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { getCalendarDays, formatMonth, isSameMonth, isSameDay, addMonths, subMonths } from '../lib/date-utils';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { StudyEvent } from '../types';

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
    'Quant': 'bg-blue-500',
    'Reasoning': 'bg-indigo-500',
    'Awareness': 'bg-rose-500',
    'English': 'bg-emerald-500',
    'General': 'bg-slate-500'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
      <div className="p-6 flex items-center justify-between">
        <div className="relative">
             <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {formatMonth(currentDate)}
             </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-lg h-8 w-8 border-slate-100 dark:border-slate-800 text-slate-400">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-lg h-8 w-8 border-slate-100 dark:border-slate-800 text-slate-400">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-slate-100 dark:border-slate-800">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-r border-slate-50 dark:border-slate-800 last:border-r-0 bg-slate-50/50 dark:bg-slate-800/30">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
          const isSelected = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[140px] p-2 border-r border-t border-slate-100 dark:border-slate-800 group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 last:border-r-0",
                !isSelected && "bg-slate-50/30 dark:bg-slate-800/10 text-slate-200 dark:text-slate-700"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                   "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                   isToday ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-indigo-950 scale-110" : "text-slate-500 dark:text-slate-400"
                )}>
                  {day.getDate()}
                </span>
                <button 
                  onClick={() => onAddEvent(day)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map(event => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={cn(
                        "w-full text-left text-[9px] px-1.5 py-1 rounded-md truncate transition-all font-bold border border-transparent flex items-center gap-1.5",
                        event.type === 'exam' ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400" :
                        event.type === 'deadline' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400" :
                        "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-100 dark:hover:border-slate-600 hover:shadow-sm"
                    )}
                  >
                    <div className={cn("w-1 h-1 rounded-full shrink-0", subjectColors[event.subject] || 'bg-slate-400')} />
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[8px] font-bold text-slate-300 dark:text-slate-600 pl-1 uppercase tracking-wider">
                    {dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
