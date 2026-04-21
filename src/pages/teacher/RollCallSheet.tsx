import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTable, { Student } from '../../components/AttendanceTable';
import AddSessionModal from '../../components/AddSessionModal';
import EditSessionModal from '../../components/EditSessionModal';
import AddStudentModal from '../../components/AddStudentModal';
import { ArrowLeft, Save, Loader2, AlertCircle, UserX, CalendarPlus, UserPlus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RollCallSheet() {
  const { className } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  
  // State សម្រាប់រក្សាទុកការកត់វត្តមានបណ្តោះអាសន្ន: { [studentId]: 'P' | 'A' | 'E' }
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  // ជំនួសឲ្យ Default គឺចាប់ផ្តើមដោយគ្មាន Session រហូតទាល់តែគ្រូចុចបង្កើត
  const [currentSessionHeader, setCurrentSessionHeader] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!className) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await api.fetchStudents(className);
      
      if (res.success) {
        setStudents(res.students || []);
        setSessions(res.sessions || []);
        
        // កំណត់ Default ទទេ (មិនទាន់កត់)
        setAttendanceState({});
      } else {
        const errMsg = res.error || 'មិនអាចទាញយកទិន្នន័យនិស្សិតបានទេ';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server API';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [className]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Set explicitly the status (P, A, E, or '') instead of cyclic clicking
  const handleSetStatus = (studentId: string | number, status: string) => {
    if (isSubmitting || !currentSessionHeader) return;
    setAttendanceState(prev => {
      const newState = { ...prev };
      if (status === '') {
        delete newState[studentId.toString()];
      } else {
        newState[studentId.toString()] = status;
      }
      return newState;
    });
  };

  const handleAddSession = (header: string) => {
    setCurrentSessionHeader(header);
    setIsModalOpen(false);
    
    // Auto Default P (មានវត្តមាន) អោយស្រាប់ដើម្បីលឿនដល់គ្រាន់តែចូល
    const initialAttendance: Record<string, string> = {};
    students.forEach((s: Student) => {
       initialAttendance[s.id.toString()] = 'P';
    });
    setAttendanceState(initialAttendance);
    
    toast.success('បានរៀបចំមុខវិជ្ជា និងថ្ងៃបង្រៀនរួចរាល់');
  };

  const handleEditSession = (header: string) => {
    setCurrentSessionHeader(header);
    setIsEditModalOpen(false);
    
    // Load existing values from that session
    const existingAttendance: Record<string, string> = {};
    students.forEach((s: any) => {
       const status = s.attendance?.[header] || s[header];
       if (status) {
         // Normalize status format
         const normStatus = status.toString().trim().toUpperCase();
         if (normStatus === 'P' || normStatus === '✔') existingAttendance[s.id.toString()] = 'P';
         else if (normStatus === 'A') existingAttendance[s.id.toString()] = 'A';
         else if (normStatus === 'E') existingAttendance[s.id.toString()] = 'E';
       }
    });
    
    setAttendanceState(existingAttendance);
    toast.success(`កំពុងកែប្រែ: ${header.split('||')[0].trim()}`);
  };

  const handleSubmit = async () => {
    if (!className || Object.keys(attendanceState).length === 0 || !currentSessionHeader) {
       toast.error("សូមបង្កើតថ្ងៃបង្រៀនថ្មី និងជ្រើសរើសវត្តមាននិស្សិតយ៉ាងហោចណាស់ម្នាក់។");
       return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // រៀបចំទិន្នន័យបញ្ជូន
      const payloadData = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status: status as string
      }));

      // Support Time 1-2 dual submission mapping
      let headersToSubmit = [currentSessionHeader];
      if (currentSessionHeader.includes('(Time 1-2)')) {
        headersToSubmit = [
          currentSessionHeader.replace('(Time 1-2)', '(Time 1)'),
          currentSessionHeader.replace('(Time 1-2)', '(Time 2)')
        ];
      }

      // Submit sequentially
      for (const header of headersToSubmit) {
        const res = await api.submitBatchAttendance(className, header, payloadData);
        if (!res.success) {
          throw new Error(res.error || `បរាជ័យក្នុងការរក្សាទុកទិន្នន័យសម្រាប់: ${header}`);
        }
      }
      
      toast.success(headersToSubmit.length > 1 ? 'រក្សាទុកវត្តមានទាំង ២ វេនបានជោគជ័យ!' : 'រក្សាទុកការកត់វត្តមានបានជោគជ័យ!');
      
      // ដក Session ទើបបញ្ជូលជោគជ័យចេញពី Local State
      setCurrentSessionHeader(null);
      
      // ទាញយកទិន្នន័យមកម្តងទៀត ដើម្បី Update Columns
      await loadStudents();
      
    } catch (err: any) {
      const errMsg = err.message || 'មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យទៅកាន់ Server';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pb-32 sm:pb-24 relative">
      <AddSessionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddSession}
        className={className || ''}
        teacherName={user?.name || ''}
      />

      <EditSessionModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditSession}
        sessions={sessions}
      />

      <AddStudentModal 
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSuccess={() => {
          setIsAddStudentModalOpen(false);
          toast.success('បន្ថែមនិស្សិតថ្មីបានជោគជ័យ!');
          loadStudents();
        }}
        className={className || ''}
      />
      
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">ថ្នាក់៖ <span className="text-indigo-600">{className}</span></h1>
            {sessions.length > 0 && !isLoading && (
              <p className="text-xs font-medium mt-0.5 flex items-center gap-2">
                <span className="text-slate-500">វគ្គសិក្សាបញ្ចប់បាន៖</span>
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{sessions.length}/24 ដង</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Desktop Save Button */}
        <button 
          onClick={handleSubmit}
          disabled={isLoading || students.length === 0 || isSubmitting || Object.keys(attendanceState).length === 0 || !currentSessionHeader}
          className="hidden sm:flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 font-bold text-sm z-30"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>កំពុងរក្សាទុក...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>រក្សាទុកវត្តមាន</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto px-0 sm:px-6 py-4 sm:py-6 overflow-hidden flex flex-col max-w-[1400px]">
        
        {error && (
          <div className="mx-4 sm:mx-0 mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in-up shrink-0">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && !isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">កំពុងទាញយកទិន្នន័យនិស្សិត...</p>
          </div>
        ) : students.length === 0 && !error ? (
          <div className="text-center py-20 mx-4 sm:mx-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center">
             <UserX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-1">មិនមាននិស្សិតក្នុងថ្នាក់នេះទេ</h3>
             <p className="text-slate-500 mb-6">សូមបន្ថែមបញ្ជីឈ្មោះនិស្សិតជាមុនសិន។</p>
             <button 
                onClick={() => setIsAddStudentModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all font-bold text-sm"
             >
                <UserPlus className="w-5 h-5" />
                <span>បន្ថែមនិស្សិតថ្មី</span>
             </button>
          </div>
        ) : !error && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in-up">
            
            <div className="mx-4 sm:mx-0 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
               {/* Controls / Legend */}
               <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs font-bold text-slate-500 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex-wrap">
                  <span className="flex items-center gap-1.5"><div className="w-4 h-4 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded">✔</div> វត្តមាន (P)</span>
                  <span className="flex items-center gap-1.5"><div className="w-4 h-4 bg-red-100 text-red-600 flex items-center justify-center rounded">A</div> អវត្តមាន (A)</span>
                  <span className="flex items-center gap-1.5"><div className="w-4 h-4 bg-amber-100 text-amber-600 flex items-center justify-center rounded">E</div> ច្បាប់ (E)</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 shrink-0"
                 >
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden lg:inline">បន្ថែមនិស្សិត</span>
                 </button>
                 
                 <button
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={!!currentSessionHeader || sessions.length === 0}
                    title="កែប្រែវត្តមានចាស់"
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all focus:ring-2 focus:ring-offset-1 shrink-0 ${
                      !!currentSessionHeader || sessions.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-700 focus:ring-amber-500'
                    }`}
                 >
                    <Pencil className="w-5 h-5" />
                    <span className="hidden sm:inline">កែប្រែ</span>
                 </button>

                 <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={!!currentSessionHeader}
                    className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all focus:ring-2 focus:ring-offset-1 shrink-0 ${
                      currentSessionHeader 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                    }`}
                 >
                    <CalendarPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">បង្កើតថ្ងៃបង្រៀន</span>
                 </button>
               </div>
            </div>

            <div className={`flex-1 overflow-y-auto sm:overflow-hidden relative sm:rounded-xl sm:shadow-sm sm:border sm:border-slate-200 bg-slate-50 sm:bg-white ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}>
                <AttendanceTable 
                  students={students} 
                  pastSessions={sessions} 
                  attendanceState={attendanceState}
                  onSetStatus={handleSetStatus}
                  currentSessionHeader={currentSessionHeader}
                />
            </div>
            
            <div className="mx-4 sm:mx-0 bg-slate-50 border border-slate-200 mt-4 px-4 sm:px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium shrink-0 shadow-sm">
               <div className="text-slate-500 text-center sm:text-left">
                  សរុបមានក្នុងបញ្ជី៖ <strong className="text-slate-800">{students.length} នាក់</strong>
                  <span className="mx-2 text-slate-300">|</span>
                  បានចំណាំ៖ <strong className="text-indigo-600">{Object.keys(attendanceState).length}</strong> នាក់
               </div>
               <div className="flex gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex-wrap items-center justify-center w-full sm:w-auto">
                  <span className="text-emerald-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {Object.values(attendanceState).filter(v => v === 'P').length}</span>
                  <span className="text-red-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {Object.values(attendanceState).filter(v => v === 'A').length}</span>
                  <span className="text-amber-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {Object.values(attendanceState).filter(v => v === 'E').length}</span>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Fixed Bottom Save Bar */}
      {currentSessionHeader && students.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 animate-fade-in-up">
           <button 
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting || Object.keys(attendanceState).length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all font-bold text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>រក្សាទុកវត្តមានឥឡូវនេះ</span>
                </>
              )}
            </button>
        </div>
      )}

    </div>
  );
}
