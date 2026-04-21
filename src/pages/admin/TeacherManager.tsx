import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit, Mail, Loader2, KeyRound, AlertCircle, Save, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface TeacherData {
  name: string;
  email: string;
  password: string;
  subjects: string[];
  classes: string[];
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPass, setEditPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.adminGetTeachers();
      if (res.success) {
        setTeachers(res.teachers || []);
      } else {
        setError(res.error || 'មិនអាចទាញយកទិន្នន័យបានទេ');
        toast.error(res.error || 'បរាជ័យក្នុងការទាញយកទិន្នន័យ');
      }
    } catch (err: any) {
      setError(err.message || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ API');
      toast.error(err.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openEditModal = (teacher: TeacherData) => {
    setEditingTeacher(teacher);
    setEditEmail(teacher.email || '');
    setEditPass(teacher.password || '');
  };

  const handleSaveAccount = async () => {
    if (!editingTeacher) return;
    if (!editEmail || !editPass) {
      toast.error('សូមបញ្ចូលអុីមែល និងពាក្យសម្ងាត់ឲ្យបានគ្រប់គ្រាន់');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.adminUpdateTeacherAccount(editingTeacher.name, editEmail, editPass);
      
      if (res.success) {
        toast.success(`បានរក្សាទុកគណនីសម្រាប់គ្រូ៖ ${editingTeacher.name}`);
        setEditingTeacher(null);
        // Refresh Table
        await fetchTeachers();
      } else {
        toast.error(res.error || 'បរាជ័យក្នុងការរក្សាទុក');
      }
    } catch (err: any) {
      toast.error(err.message || 'មានបញ្ហាក្នុងការរក្សាទុកគណនី');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      
      {/* Account Edit Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">រៀបចំគណនី (Manage Account)</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">គ្រូបង្រៀន៖ <span className="text-indigo-600 font-bold">{editingTeacher.name}</span></p>
              </div>
              <button 
                onClick={() => setEditingTeacher(null)}
                className="p-2 bg-white hover:bg-slate-100 text-slate-400 rounded-full transition-colors border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">អុីមែល (Email)</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="ឧ. teacher@school.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ពាក្យសម្ងាត់ (Password)</label>
                <input 
                  type="text" 
                  value={editPass}
                  onChange={(e) => setEditPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="ឧ. 123456"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => setEditingTeacher(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all focus:ring-2 focus:ring-slate-200"
              >
                បោះបង់
              </button>
              <button 
                onClick={handleSaveAccount}
                disabled={isSaving || !editEmail || !editPass}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>រក្សាទុក</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">គ្រប់គ្រងគ្រូបង្រៀន (Manage Teachers)</h1>
          <p className="text-slate-500 text-sm mt-1">រៀបចំគណនី (Email/Password) សម្រាប់គ្រូដែលបានទាញយកពីបញ្ជីបញ្ចូល។</p>
        </div>
        <button 
          onClick={fetchTeachers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
        >
          <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Data</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3">
           <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
           <div>
              <p className="font-bold mb-1">មានបញ្ហាក្នុងការទាញយកទិន្នន័យពីមុខវិជ្ជា</p>
              <p>{error}</p>
              <p className="mt-2 text-xs opacity-70">
                 សូមប្រាកដថាអ្នកបានបន្ថែម API endpoints ថ្មីទៅក្នុង Google Apps Script របស់អ្នកតាមការណែនាំ។
              </p>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
               <Users className="w-4 h-4" />
               សរុប៖ {teachers.length} នាក់
             </div>
             <div className="text-xs font-medium px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1">
               <AlertCircle className="w-3.5 h-3.5" />
               មិនទាន់មានគណនី៖ {teachers.filter(t => !t.email).length}
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16">ល.រ</th>
                  <th className="px-6 py-4 font-semibold min-w-[200px]">ឈ្មោះគ្រូ</th>
                  <th className="px-6 py-4 font-semibold">គណនី (Account)</th>
                  <th className="px-6 py-4 font-semibold">មុខវិជ្ជា & ថ្នាក់បង្រៀន</th>
                  <th className="px-6 py-4 font-semibold text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                      <p className="font-medium">កំពុងទាញយកទិន្នន័យពីមុខវិជ្ជា និងសៀវភៅបញ្ជី (Sheet)...</p>
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      មិនមានទិន្នន័យគ្រូបង្រៀននៅក្នុង Sheet ទេ
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100 shadow-sm shrink-0">
                              {teacher.name.charAt(0)}
                           </div>
                           <span className="font-bold text-slate-800">{teacher.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-l border-slate-50">
                        {teacher.email ? (
                          <div className="space-y-1 inline-block">
                             <div className="flex items-center gap-2 text-slate-700 font-medium bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-md border border-emerald-100">
                               <Mail className="w-3.5 h-3.5 opacity-70" />
                               {teacher.email}
                             </div>
                             <div className="flex items-center gap-2 text-slate-500 text-xs px-3 py-1">
                               <KeyRound className="w-3.5 h-3.5 opacity-70" />
                               {teacher.password}
                             </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold border border-red-100 text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                            មិនទាន់មានគណនី
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[300px] whitespace-normal">
                        <div className="space-y-2">
                          <div className="flex gap-1.5 flex-wrap">
                            {teacher.subjects?.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {teacher.classes?.map(c => (
                              <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(teacher)}
                          className="px-4 py-2 text-sm font-bold bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm rounded-xl transition-all"
                        >
                           {teacher.email ? 'កែប្រែគណនី' : 'បង្កើតគណនី'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
