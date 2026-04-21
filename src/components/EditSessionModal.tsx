import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionHeader: string) => void;
  sessions: string[];
}

export default function EditSessionModal({ isOpen, onClose, onConfirm, sessions }: EditSessionModalProps) {
  const [selectedSession, setSelectedSession] = useState(sessions[0] || '');

  // Reset selected session when sessions change or modal opens
  React.useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[sessions.length - 1]); // Default to latest
    }
  }, [sessions, isOpen, selectedSession]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSession) {
      onConfirm(selectedSession);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                <Pencil className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg tracking-tight">កែប្រែវត្តមានចាស់</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              មិនទាន់មានថ្ងៃបង្រៀនដែលបានកត់ត្រាសម្រាប់ថ្នាក់នេះទេ។
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">ជ្រើសរើសថ្ងៃដែលចង់កែ</label>
              <select
                required
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm font-medium print:bg-transparent"
              >
                <option value="" disabled>-- ជ្រើសរើស --</option>
                {/* Reversed array so latest is on top */}
                {[...sessions].reverse().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">
                * ទិន្នន័យចាស់នឹងត្រូវបានទាញយកមកវិញ ដើម្បីឲ្យអ្នកអាចកែសម្រួលបាន។
              </p>
            </div>
          )}

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
              disabled={sessions.length === 0 || !selectedSession}
              className="px-6 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              ទាញយកមកកែ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
