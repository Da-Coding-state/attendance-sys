import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  className: string;
}

export default function AddStudentModal({ isOpen, onClose, onSuccess, className }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    lastNameFirstName: '',
    fullName: '',
    gender: 'M', // 'M' or 'F'
    major: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        lastNameFirstName: '',
        fullName: '',
        gender: 'M',
        major: ''
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;

    try {
      setIsSubmitting(true);
      setError('');

      const res = await api.addStudent(className, formData);
      
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'បរាជ័យក្នុងការបន្ថែមនិស្សិត។ សូមព្យាយាមម្តងទៀត។');
      }
    } catch (err: any) {
      setError(err.message || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server API។');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                <UserPlus className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg tracking-tight">បន្ថែមនិស្សិតថ្មី</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
              <p className="text-xs text-slate-500 font-medium flex items-center justify-between">
                <span>ថ្នាក់/ក្រុម៖</span>
                <span className="font-bold text-indigo-600 text-sm">{className}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                គោត្តនាម នាម <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="lastNameFirstName"
                required
                placeholder="ឧ. សុខ សាន្ត"
                value={formData.lastNameFirstName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-60"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Full Name (អង់គ្លេស) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="fullName"
                required
                placeholder="Ex. Sok San"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  ភេទ <span className="text-red-500">*</span>
                </label>
                <select 
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-60 cursor-pointer"
                >
                  <option value="M">ប្រុស (M)</option>
                  <option value="F">ស្រី (F)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  ជំនាញ <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="major"
                  required
                  placeholder="ឧ. IT"
                  value={formData.major}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-60"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            បោះបង់
          </button>
          <button 
            type="submit" 
            form="add-student-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>រក្សាទុក</span>
          </button>
        </div>
      </div>
    </div>
  );
}
