import React, { useState } from 'react';
import { api } from '../../services/api';
import { FileText, Search, Loader2, AlertCircle, Download, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Mock options for dropdowns since we don't have a dedicated API to fetch all classes/subjects globally
const CLASS_OPTIONS = ['Y1S1', 'Y2CHEM', 'Y3BIO', 'Y4IT', 'Y5ARCH'];
const SUBJECT_OPTIONS = ['Chemistry', 'Physics', 'IT', 'Math', 'English', 'Biology'];

interface ReportRow {
  id: string | number;
  lastNameFirstName: string;
  fullName: string;
  gender: string;
  major: string;
  totalSessions: number;
  pCount: number;
  aCount: number;
  eCount: number;
  rate: number;
}

export default function FinalReport() {
  const [className, setClassName] = useState(CLASS_OPTIONS[1]);
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [filteredSessionsCount, setFilteredSessionsCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateReport = async () => {
    if (!className) {
      const errMsg = 'សូមជ្រើសរើសថ្នាក់រៀនជាមុនសិន។';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setHasGenerated(false);
      
      const res = await api.fetchStudents(className);
      
      if (res.success) {
        const allSessions: string[] = res.sessions || [];
        const students: any[] = res.students || [];
        
        // Filter sessions by selected subject
        // Session format expected: "20-Apr-2026 || Chemistry || Tr. Sok"
        const filteredSessions = allSessions.filter(s => 
           subject ? s.toLowerCase().includes(subject.toLowerCase()) : true
        );
        
        const total = filteredSessions.length;
        
        const calculatedData: ReportRow[] = students.map(student => {
          let pCount = 0;
          let aCount = 0;
          let eCount = 0;
          
          filteredSessions.forEach(session => {
            // Support both direct properties and nested attendance object
            const status = student.attendance?.[session] || student[session] || '';
            
            // Normalize status just in case
            const sFormat = status.toString().trim().toUpperCase();
            if (sFormat === 'P' || sFormat === '✔') pCount++;
            else if (sFormat === 'A') aCount++;
            else if (sFormat === 'E') eCount++;
          });
          
          // Attendance Rate = ((P + E) / Total Sessions) * 100
          const rate = total === 0 ? 0 : ((pCount + eCount) / total) * 100;
          
          return {
            id: student.id,
            lastNameFirstName: student.lastNameFirstName,
            fullName: student.fullName,
            gender: student.gender,
            major: student.major,
            totalSessions: total,
            pCount,
            aCount,
            eCount,
            rate: Math.round(rate * 100) / 100 // round to 2 decimal places
          };
        });
        
        setFilteredSessionsCount(total);
        setReportData(calculatedData);
        setHasGenerated(true);
        toast.success('ទាញយករបាយការណ៍បានជោគជ័យ');
      } else {
        const errMsg = res.error || 'បរាជ័យក្នុងការទាញយកទិន្នន័យ';
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

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 print:space-y-0 print:block print:max-w-none print:w-full print:m-0">
      
      {/* Header sections */}
      <div className="animate-fade-in-up print:hidden">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          របាយការណ៍អ្នកអវត្តមាន (Final Report)
        </h2>
        <p className="text-slate-500 font-medium">ជ្រើសរើសថ្នាក់រៀន និងមុខវិជ្ជា ដើម្បីទាញយករបាយការណ៍សរុបនៅចុងឆមាស។</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in-up shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up flex flex-col md:flex-row gap-4 items-end print:hidden">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-slate-700 mb-2">ថ្នាក់រៀន (Class)</label>
          <div className="relative">
            <select 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
            >
              <option value="">-- រើសថ្នាក់ --</option>
              {CLASS_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-slate-700 mb-2">មុខវិជ្ជា (Subject Filters)</label>
          <div className="relative">
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
            >
              <option value="">-- គ្រប់មុខវិជ្ជាទាំងអស់ --</option>
              {SUBJECT_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <button 
            onClick={handleGenerateReport}
            disabled={isLoading || !className}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl shadow-sm transition-all font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>កំពុងទាញយក...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>ទាញយកទិន្នន័យ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Data Display */}
      {hasGenerated && !isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden animate-fade-in-up print:border-none print:shadow-none print:overflow-visible print:block print:w-full">
          
          {/* Print-only Header */}
          <div className="hidden print:block mb-8 text-black">
            <div className="text-center font-bold text-lg mb-8">
              <p className="text-xl inline-block mb-1">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <div className="w-2/3 h-[2px] bg-black mx-auto mt-1 mb-2"></div>
              <p className="text-lg">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            </div>
            <div className="mb-10 text-lg">
              <p className="font-bold">សាកលវិទ្យាល័យពុទ្ធិ</p>
              <p className="font-bold mt-1">ដេប៉ាតឺម៉ង់៖ .................................</p>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-3">របាយការណ៍វត្តមាននិស្សិត - មុខវិជ្ជា៖ {subject || 'ទាំងអស់'}</h2>
              <p className="font-medium text-lg">ថ្នាក់រៀន៖ {className} | ម៉ោងបង្រៀនសរុបមាន៖ {filteredSessionsCount} ដង</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
             <div>
               <h3 className="text-lg font-bold text-slate-800">លទ្ធផលវត្តមាន: {className} {subject ? `- ${subject}` : ''}</h3>
               <p className="text-sm text-slate-500 font-medium mt-1">ម៉ោងបង្រៀនសរុប (Total Sessions): {filteredSessionsCount} ដង</p>
             </div>
             
             {reportData.length > 0 && (
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => window.print()}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
                 >
                    <Printer className="w-4 h-4" />
                     Print Report
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-bold transition-colors">
                    <Download className="w-4 h-4" />
                     Export Excel
                 </button>
               </div>
             )}
          </div>

          {/* Table */}
          {reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-500 print:hidden">
              មិនមានទិន្នន័យសម្រាប់ថ្នាក់រៀន និងមុខវិជ្ជាដែលបានជ្រើសរើសឡើយ។
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain print:overflow-visible">
              <table className="w-full text-left text-sm whitespace-nowrap print:border-collapse print:border-black print:text-black">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-xs font-bold border-b-2 border-slate-200 print:bg-white print:text-black">
                  <tr>
                    <th className="px-6 py-4 sticky left-0 z-10 bg-slate-100 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] print:shadow-none print:border print:border-black print:static print:bg-white print:py-2 print:px-3">ល.រ</th>
                    <th className="px-6 py-4 print:border print:border-black print:py-2 print:px-3">គោត្តនាម នាម</th>
                    <th className="px-6 py-4 print:border print:border-black print:py-2 print:px-3">Full Name</th>
                    <th className="px-6 py-4 text-center print:border print:border-black print:py-2 print:px-3">អវត្តមាន (A)</th>
                    <th className="px-6 py-4 text-center print:border print:border-black print:py-2 print:px-3">ច្បាប់ (E)</th>
                    <th className="px-6 py-4 text-center print:border print:border-black print:py-2 print:px-3">វត្តមាន (P)</th>
                    <th className="px-6 py-4 text-center border-l border-slate-200 print:border print:border-black print:py-2 print:px-3">អត្រាវត្តមាន (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {reportData.map((row) => {
                    // Logic requirement: if rate < 70, highlight bg-red-100
                    const isFailing = row.rate < 70;
                    
                    return (
                      <tr 
                        key={row.id} 
                        className={`transition-colors hover:bg-slate-50 ${isFailing ? 'bg-red-50/80 hover:bg-red-100' : 'bg-white'} print:bg-white print:text-black`}
                      >
                        <td className={`px-6 py-3 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] font-medium ${isFailing ? 'bg-red-50/90' : 'bg-white'} print:static print:shadow-none print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black`}>
                          {row.id}
                        </td>
                        <td className={`px-6 py-3 font-bold ${isFailing ? 'text-red-900' : 'text-slate-800'} print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black`}>
                          {row.lastNameFirstName}
                        </td>
                        <td className={`px-6 py-3 ${isFailing ? 'text-red-700' : 'text-slate-600'} print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black`}>
                          {row.fullName}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-red-600 print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black">
                          {row.aCount}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-amber-600 print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black">
                          {row.eCount}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-emerald-600 print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black">
                          {row.pCount}
                        </td>
                        <td className="px-6 py-3 text-center border-l border-slate-100 print:border print:border-black print:bg-transparent print:py-2 print:px-3 print:text-black print:justify-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black
                            ${isFailing ? 'bg-red-100 text-red-700 border border-red-200' : 
                              row.rate === 100 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'} print:bg-transparent print:text-black print:border-none print:p-0`}
                          >
                            {row.rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Print-only Footer */}
          {reportData.length > 0 && (
            <div className="hidden print:flex justify-between items-start mt-16 text-black px-12">
               <div className="text-center">
                  <p className="font-bold text-lg">បានឃើញនិងឯកភាព</p>
                  <p className="mt-1 font-bold text-lg">ប្រធានដេប៉ាតឺម៉ង់</p>
               </div>
               <div className="text-center">
                  <p className="font-bold text-lg">រាជធានីភ្នំពេញ, ថ្ងៃទី...........ខែ...........ឆ្នាំ២០២....</p>
                  <p className="mt-1 font-bold text-lg">គ្រូបង្រៀន</p>
               </div>
            </div>
          )}

        </div>
      )}
      
    </div>
  );
}
