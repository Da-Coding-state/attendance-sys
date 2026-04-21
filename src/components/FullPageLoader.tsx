import React from 'react';
import { Loader2 } from 'lucide-react';

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
      <h2 className="text-xl font-bold text-slate-800 tracking-tight animate-pulse">កំពុងរៀបចំប្រព័ន្ធ...</h2>
      <p className="text-sm text-slate-500 font-medium mt-1">សូមរង់ចាំបន្តិច (Loading)</p>
    </div>
  );
}
