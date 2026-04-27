import React from 'react';
import { Button } from './ui/button';
import { Target } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center relative z-10"
      >
        <div className="mb-10 flex justify-center">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.05 }}
            initial={{ rotate: 3 }}
            className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] dark:shadow-none"
          >
            <Target className="h-12 w-12 text-white" />
          </motion.div>
        </div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">CPO <span className="text-indigo-600">MASTER</span></h1>
        <p className="text-slate-400 dark:text-slate-500 mb-12 font-black uppercase tracking-[0.4em] text-[10px]">Elite Tactical Preparation Hub</p>
        
        <div className="glass p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-800/50">
          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium text-sm">Join the ranks of elite aspirants. Sync your tactical schedule and let the AI Coach refine your path to the badge.</p>
          <Button 
            onClick={onLogin} 
            className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-[0_15px_30px_rgba(79,70,229,0.2)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95"
          >
            Commence Mission
          </Button>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
            <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-black">Google Intelligence Secure</p>
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
