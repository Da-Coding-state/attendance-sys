import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogIn, Loader2, BookOpen, Eye, EyeOff } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

export default function Login() {
  const { user, login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use Google's test key if env variable is missing, but advise user to update
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Auto redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === 'Admin' ? '/admin' : '/teacher', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('សូម Tick លើប្រអប់ CAPTCHA ដើម្បីបញ្ជាក់ថាអ្នកមិនមែនជាមនុស្សយន្ត!');
      toast.error('សូម Tick លើប្រអប់ CAPTCHA!');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
       const res = await api.loginUser(email, password);
       if (res.success) {
         login(res.data);
         toast.success('ចូលប្រព័ន្ធបានជោគជ័យ');
         navigate(res.data.role === 'Admin' ? '/admin' : '/teacher', { replace: true });
       } else {
         const errMsg = res.error || 'អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid credentials)';
         setError(errMsg);
         toast.error(errMsg);
       }
    } catch (err: any) {
       const errMsg = err.message || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ API';
       setError(errMsg);
       toast.error(errMsg);
    } finally {
       setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null; // Let App deal with initial loader
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
         
         {/* Banner Area */}
         <div className="relative p-8 text-center bg-indigo-600 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative z-10">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                  <BookOpen className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">ចូលប្រព័ន្ធគ្រប់គ្រង</h1>
               <p className="text-indigo-100 text-sm font-medium">Student Attendance System</p>
            </div>
         </div>

         {/* Form Area */}
         <form onSubmit={handleLogin} className="p-8 space-y-6">
            
            {error && (
               <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100/50 flex items-start gap-3">
                 <span>{error}</span>
               </div>
            )}

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">អុីមែល (Email)</label>
                  <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                     placeholder="បញ្ចូលអុីមែល..."
                     autoComplete="username"
                     required
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ពាក្យសម្ងាត់ (Password)</label>
                  <div className="relative">
                     <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 pr-12"
                        placeholder="បញ្ចូលពាក្យសម្ងាត់..."
                        autoComplete="current-password"
                        required
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-100 transition-colors"
                     >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex justify-center my-4 overflow-hidden rounded-lg">
               <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
               />
            </div>

            <button 
               type="submit" 
               disabled={isSubmitting || !email || !password || !captchaToken}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
            >
               {isSubmitting ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   កំពុងផ្ទៀងផ្ទាត់...
                 </>
               ) : (
                 <>
                   <LogIn className="w-5 h-5" />
                   ចូលប្រើប្រាស់
                 </>
               )}
            </button>
         </form>
      </div>
    </div>
  );
}
