import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionHeader: string) => void;
  className: string;
  teacherName: string;
}

export default function AddSessionModal({ isOpen, onClose, onConfirm, className, teacherName }: AddSessionModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Time 1'); // Default shift
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format: YYYY-MM-DD (Shift) || Subject || Teacher
    const header = `${date} (${shift}) || ${className} || Tr. ${teacherName}`;
    onConfirm(header);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg tracking-tight">បង្កើតថ្ងៃបង្រៀនថ្មី</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">កាលបរិច្ឆេទ</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">វេនបង្រៀន (Tick)</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              >
                <option value="Time 1">Time 1 (ម៉ោងទី១)</option>
                <option value="Time 2">Time 2 (ម៉ោងទី២)</option>
                <option value="Time 1-2">Time 1-2 (ម៉ោងទី១ និងទី២)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">មុខវិជ្ជា (Subject)</label>
            <input 
              type="text" 
              readOnly
              value={className}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1.5">* ទាញយកស្វ័យប្រវត្តិតាមឈ្មោះថ្នាក់កម្មវិធី</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">គ្រូបង្រៀន (Teacher)</label>
            <input 
              type="text" 
              readOnly
              value={teacherName}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              បោះបង់
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              បង្កើត
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
