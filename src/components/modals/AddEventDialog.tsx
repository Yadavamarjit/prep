import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { EventSubject, EventType, StudyEvent } from '../../types';

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (event: Partial<StudyEvent>, date: string, start: string, end: string, recurrence: string) => Promise<void>;
  selectedDate: Date;
  uniqueTitles: string[];
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({ 
  isOpen, onOpenChange, onAdd, selectedDate, uniqueTitles 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<EventSubject>('General');
  const [type, setType] = useState<EventType>('study');
  const [eventDate, setEventDate] = useState<string>(selectedDate.toLocaleDateString('en-CA'));
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentHour = now.getHours();
      setStartTime(`${String(currentHour).padStart(2, '0')}:00`);
      const end = new Date(now);
      end.setHours(currentHour, 30);
      setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
      setEventDate(selectedDate.toLocaleDateString('en-CA'));
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = async () => {
    await onAdd({ title, description, subject, type }, eventDate, startTime, endTime, recurrence);
    setTitle('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md p-8 border-0 shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 mb-6">Schedule Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Session Title</Label>
            <input 
              placeholder="e.g., Algebra Revision" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              list="event-titles"
              autoComplete="off"
              className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400"
            />
            <datalist id="event-titles">
              {uniqueTitles.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Date</Label>
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-xl h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-indigo-600 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Subject</Label>
              <select className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none uppercase tracking-wider" value={subject} onChange={e => setSubject(e.target.value as any)}>
                <option value="Quant">Quant Aptitude</option>
                <option value="Reasoning">Reasoning</option>
                <option value="Awareness">Awareness</option>
                <option value="English">English</option>
                <option value="General">General/Misc</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Event Type</Label>
              <select className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none uppercase tracking-wider" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="study">Study Plan</option>
                <option value="exam">Official Exam</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Recurrence</Label>
            <select className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none uppercase tracking-wider" value={recurrence} onChange={e => setRecurrence(e.target.value as any)}>
              <option value="none">One-time Event</option>
              <option value="daily">Everyday</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Notes</Label>
            <textarea className="w-full min-h-[100px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all" placeholder="Key concepts to tackle..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} className="w-full h-14 shrink-0 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-lg shadow-indigo-100">
            Confirm Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
