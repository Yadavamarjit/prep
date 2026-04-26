import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Zap, Loader2 } from 'lucide-react';
import { StudyEvent } from '../../types';

interface CompletionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: StudyEvent | null;
  onComplete: (event: StudyEvent, notes: string) => Promise<void>;
  isThinking: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const CompletionDialog: React.FC<CompletionDialogProps> = ({
  isOpen, onOpenChange, event, onComplete, isThinking, notes, onNotesChange
}) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md p-8 border-0 shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 mb-2">Victory Log</DialogTitle>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{event.title}</p>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Session Highlights</Label>
            <textarea 
              className="w-full min-h-[120px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all"
              placeholder="What did you master today? Any hurdles?"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
            />
          </div>
          <Button 
            disabled={isThinking}
            onClick={() => onComplete(event, notes)} 
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            {isThinking ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing Strategy...</>
            ) : (
                <><Zap className="h-5 w-5 fill-indigo-400 text-indigo-400" /> Consult AI Coach</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
