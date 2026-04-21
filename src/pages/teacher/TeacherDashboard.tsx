import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LogOut, BookOpen, Users, ArrowRight, AlertCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.email) return;
      
      try {
        setIsLoading(true);
        setError('');
        const res = await api.fetchTeacherClasses(user.email);
        
        if (res.success) {
          setClasses(res.classes || []);
        } else {
          const errMsg = res.error || 'មិនអាចទាញយកទិន្នន័យថ្នាក់រៀនបានទេ';
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
    };

    loadClasses();
  }, [user?.email]);

  const handleEnterClass = (className: string) => {
    navigate(`/teacher/attendance/${className}`);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-8 animate-fade-in-up">
         <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">សួស្តីគ្រូបង្រៀន, {user?.name}! 👋</h2>
         <p className="text-slate-500 font-medium">នេះគឺជាបញ្ជីថ្នាក់រៀនដែលត្រូវគ្រប់គ្រងវត្តមាន។ សូមជ្រើសរើសថ្នាក់ខាងក្រោម។</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {isLoading ? (
          /* Skeleton Loading State */
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
              </div>
              <div className="w-3/4 h-6 bg-slate-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-slate-200 rounded mb-8"></div>
              <div className="w-full h-11 bg-slate-200 rounded-xl"></div>
            </div>
          ))
        ) : classes.length > 0 ? (
          /* Actual Data Cards */
          classes.map(c => (
            <div 
              key={c} 
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col animate-fade-in-up"
            >
              {/* Decorative background element */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              
              <div className="relative z-10 flex-1">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                    <CalendarDays className="w-3.5 h-3.5" />
                    សកម្ម
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{c}</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">ថ្នាក់/ក្រុមជំនាញប្រចាំឆ្នាំ</p>
              </div>

              <button 
                onClick={() => handleEnterClass(c)}
                className="relative z-10 mt-auto w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 font-bold py-3 px-4 rounded-xl transition-colors duration-200 group/btn"
              >
                ចូលកត់វត្តមាន
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-white shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">មិនមានថ្នាក់រៀនទេ</h3>
            <p className="text-slate-500">អ្នកមិនទាន់ត្រូវបានចាត់តាំងឱ្យបង្រៀនថ្នាក់ណាមួយនៅឡើយទេ។</p>
          </div>
        )}

      </div>
    </div>
  );
}
