import React from 'react';

// Props Interface
export interface Student {
  id: string | number;
  lastNameFirstName: string;
  fullName: string;
  gender: string;
  major: string;
}

interface AttendanceTableProps {
  students: Student[];
  pastSessions: string[];
  attendanceState: Record<string, string>;
  onSetStatus: (studentId: string | number, status: string) => void;
  currentSessionHeader: string | null;
}

const FIXED_COLS = [
  { key: 'id', label: 'ល.រ', width: 50 },
  { key: 'lastNameFirstName', label: 'គោត្តនាម នាម', width: 140 },
  { key: 'fullName', label: 'Full Name', width: 140 },
  { key: 'gender', label: 'ភេទ', width: 70 },
  { key: 'major', label: 'ជំនាញ', width: 90 },
];

const getLeftOffset = (index: number) => {
  let left = 0;
  for (let i = 0; i < index; i++) {
    left += FIXED_COLS[i].width;
  }
  return left;
};

const parseHeader = (header: string) => {
  const parts = header.split('||').map(s => s.trim());
  return {
    date: parts[0] || '-',
    subject: parts[1] || '-',
    teacher: parts[2] || '-'
  };
};

export default function AttendanceTable({
  students,
  pastSessions,
  attendanceState,
  onSetStatus,
  currentSessionHeader
}: AttendanceTableProps) {
  
  const currentParsed = currentSessionHeader ? parseHeader(currentSessionHeader) : null;

  return (
    <>
      {/* Mobile Card View (shown only on small screens) */}
      <div className="block lg:hidden w-full overflow-y-auto space-y-3 px-4 sm:px-0 py-2 pb-24">
        {students.map((student) => {
          const status = attendanceState[student.id.toString()];
          const isGenderMale = student.gender === 'M' || student.gender === 'ប្រុស';

          return (
            <div key={student.id} className="bg-white border text-left border-slate-200 rounded-xl py-2.5 px-3 pl-4 shadow-sm relative overflow-hidden flex flex-row items-center justify-between gap-2 transition-all">
              {/* Highlight Left Border Based on Status */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  !status ? 'bg-slate-200' :
                  status === 'P' ? 'bg-emerald-500' :
                  status === 'A' ? 'bg-red-500' :
                  'bg-amber-500'
               }`}></div>

              {/* Student Info */}
              <div className="flex-1 min-w-0 ml-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400">ID: {student.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isGenderMale ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                    {student.gender}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold truncate max-w-[80px]">
                    {student.major}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight truncate px-0">{student.lastNameFirstName}</h3>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">{student.fullName}</p>
              </div>

              {/* Action Buttons for Mobile */}
              {currentParsed ? (
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shrink-0">
                   <button 
                      onClick={() => onSetStatus(student.id, status === 'P' ? '' : 'P')}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        status === 'P' ? 'bg-emerald-500 text-white shadow-md ring-emerald-500' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-600 ring-slate-300'
                      }`}
                   >
                      ✔
                   </button>
                   <button 
                      onClick={() => onSetStatus(student.id, status === 'A' ? '' : 'A')}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        status === 'A' ? 'bg-red-500 text-white shadow-md ring-red-500' : 'text-slate-400 hover:bg-slate-200 hover:text-red-600 ring-slate-300'
                      }`}
                   >
                      A
                   </button>
                   <button 
                      onClick={() => onSetStatus(student.id, status === 'E' ? '' : 'E')}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        status === 'E' ? 'bg-amber-500 text-white shadow-md ring-amber-500' : 'text-slate-400 hover:bg-slate-200 hover:text-amber-600 ring-slate-300'
                      }`}
                   >
                      E
                   </button>
                </div>
              ) : (
                <div className="text-[10px] text-center p-2 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 border-dashed w-[115px] shrink-0">
                  មិនទាន់មានថ្ងៃបង្រៀន
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden lg:block w-full max-h-[70vh] min-h-[400px] overflow-auto bg-white rounded-xl border border-slate-300 shadow-sm relative overscroll-x-contain">
        <table className="w-full text-left text-sm border-collapse min-w-max bg-white">
          <thead>
            <tr>
              {/* Fixed Columns Headers */}
              {FIXED_COLS.map((col, idx) => (
                <th 
                  key={col.key}
                  className={`sticky top-0 z-30 bg-slate-200 border-b-2 border-r border-slate-300 font-bold text-slate-800 p-0 text-center uppercase tracking-wide text-xs align-middle ${col.key === 'fullName' ? 'shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                  style={{ 
                    left: getLeftOffset(idx), 
                    width: col.width, 
                    minWidth: col.width, 
                    height: '90px',
                    boxShadow: idx === FIXED_COLS.length - 1 ? '4px 0 6px -2px rgba(0,0,0,0.1)' : undefined
                  }}
                >
                  <div className="px-2">{col.label}</div>
                </th>
              ))}
              
              {/* Current Session Header */}
              {currentParsed && (
                <th 
                  className="sticky top-0 z-20 border-b-2 border-r border-emerald-400 min-w-[180px] p-0 font-bold text-slate-800 align-top bg-emerald-50"
                  style={{ boxShadow: 'inset 0 -3px 0 0 #10b981' }}
                >
                  <div className="flex flex-col text-center divide-y divide-emerald-200/60 h-[90px]">
                    <div className="flex-1 flex items-center justify-center bg-emerald-100 text-emerald-800 tracking-tight">{currentParsed.date}</div>
                    <div className="flex-1 flex items-center justify-center text-[11px] px-1 text-emerald-700 font-medium truncate">{currentParsed.subject}</div>
                    <div className="flex-1 flex items-center justify-center text-[11px] text-emerald-600 font-medium truncate">{currentParsed.teacher}</div>
                  </div>
                </th>
              )}

              {/* Past Sessions Headers */}
              {pastSessions.map((s, idx) => {
                const parsed = parseHeader(s);
                return (
                  <th 
                    key={idx}
                    className="sticky top-0 z-20 border-b-2 border-r border-slate-300 min-w-[100px] p-0 font-medium text-slate-600 align-top"
                    title={s}
                  >
                    <div className="flex flex-col text-center divide-y divide-slate-300 border-b border-transparent h-[90px] bg-slate-50/80 backdrop-blur-sm">
                      <div className="flex-1 flex items-center justify-center bg-white/50">{parsed.date}</div>
                      <div className="flex-1 flex items-center justify-center text-[11px] px-1 truncate">{parsed.subject}</div>
                      <div className="flex-1 flex items-center justify-center text-[11px] text-slate-500 truncate">{parsed.teacher}</div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => {
               const status = attendanceState[student.id.toString()];
               
               return (
                 <tr key={student.id} className="transition-colors group hover:bg-slate-50">
                   {/* Fixed Columns Data */}
                   {FIXED_COLS.map((col, cIdx) => (
                      <td 
                        key={col.key}
                        className={`sticky z-10 bg-white border-r border-slate-300 py-3 px-3 text-sm truncate group-hover:bg-slate-50 transition-colors ${col.key === 'fullName' ? 'shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)]' : ''}`}
                        style={{ 
                          left: getLeftOffset(cIdx), 
                          width: col.width, 
                          minWidth: col.width,
                          boxShadow: cIdx === FIXED_COLS.length - 1 ? '4px 0 6px -2px rgba(0,0,0,0.05)' : undefined
                        }}
                        title={student[col.key as keyof Student] as string}
                      >
                        {col.key === 'id' && <span className="font-medium text-slate-500 text-xs">{student.id}</span>}
                        {col.key === 'lastNameFirstName' && <span className="font-bold text-slate-900">{student.lastNameFirstName}</span>}
                        {col.key === 'fullName' && <span className="text-slate-600">{student.fullName}</span>}
                        {col.key === 'gender' && (
                           <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${student.gender === 'M' || student.gender === 'ប្រុស' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                             {student.gender}
                           </span>
                        )}
                        {col.key === 'major' && <span className="text-slate-600 text-[11px]">{student.major}</span>}
                      </td>
                   ))}

                   {/* Current Session Cell (Editable explicitly for Desktop via inline buttons) */}
                   {currentParsed && (
                     <td className={`border-r border-slate-300 p-2 transition-all min-h-[55px] ${
                        !status ? 'bg-white' : 
                        status === 'P' ? 'bg-emerald-50' : 
                        status === 'A' ? 'bg-red-50' : 'bg-amber-50'
                      }`}>
                        <div className="w-full h-full flex items-center justify-center gap-1 min-w-[140px]">
                           <button 
                             onClick={() => onSetStatus(student.id, status === 'P' ? '' : 'P')}
                             className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                status === 'P' ? 'bg-emerald-500 text-white shadow-md ring-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-emerald-600 ring-slate-300'
                             }`}
                             title="Present"
                           >✔</button>
                           <button 
                             onClick={() => onSetStatus(student.id, status === 'A' ? '' : 'A')}
                             className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                status === 'A' ? 'bg-red-500 text-white shadow-md ring-red-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-600 ring-slate-300'
                             }`}
                             title="Absent"
                           >A</button>
                           <button 
                             onClick={() => onSetStatus(student.id, status === 'E' ? '' : 'E')}
                             className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                status === 'E' ? 'bg-amber-500 text-white shadow-md ring-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-600 ring-slate-300'
                             }`}
                             title="Excused"
                           >E</button>
                        </div>
                     </td>
                   )}

                   {/* Past Sessions Data */}
                   {pastSessions.map((_, i) => (
                      <td key={i} className="border-r border-slate-200 bg-slate-50/50 p-2 text-center">
                        <div className="flex items-center justify-center text-slate-300 text-xs select-none">
                          -
                        </div>
                      </td>
                   ))}
                 </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
