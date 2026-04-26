import React from 'react';
import { Button } from './ui/button';
import { Target } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-0">
            <Target className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">CPO MASTER <span className="text-indigo-600">2026</span></h1>
        <p className="text-slate-500 mb-10 font-medium uppercase tracking-[0.2em] text-xs">Elite Strategic Preparation Hub</p>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100">
          <p className="text-slate-600 mb-8 leading-relaxed font-medium">Join the ranks of elite aspirants. Sync your tactical schedule and let the AI Coach refine your path to the badge.</p>
          <Button onClick={onLogin} className="w-full h-14 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-100">
            Commence Mission
          </Button>
          <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Google Authentication</p>
        </div>
      </div>
    </div>
  );
};
