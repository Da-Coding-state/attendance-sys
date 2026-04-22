import toast from 'react-hot-toast';

const SCRIPT_URL = import.meta.env.VITE_API_URL || '';
const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY || '';

/**
 * Universal Helper សម្រាប់បញ្ជូន/ទាញទិន្នន័យ (POST requests only សម្រាប់រាល់សកម្មភាព)
 */
async function fetchSecure(payload: any) {
  if (!SCRIPT_URL) {
    toast.error('VITE_API_URL មិនទាន់ត្រូវបានកំណត់ក្នុង .env ទេ!');
    throw new Error('Missing VITE_API_URL');
  }

  // យើងលែងបញ្ចូល Secret Key តាម URL ទៀតហើយ (ដើម្បីសុវត្ថិភាព)
  // តែយើងរុញវាចូលទៅក្នុង Body នៃ Payload វិញ។
  const securePayload = {
    ...payload,
    secret_key: SECRET_KEY
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(securePayload),
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const data = await response.json();

    // បើប្រព័ន្ធត្រឡប់មកវិញថា Forbidden តាមរយៈ JSON Body
    if (data.error && data.error.includes('Forbidden')) {
      toast.error(data.error);
      throw new Error('403 Forbidden');
    }

    return data;
  } catch (error: any) {
    // លុបការប្រើប្រាស់ console.error ដើម្បីសុវត្ថិភាព តម្រូវតាមការស្នើសុំ
    throw error;
  }
}

export const api = {
  loginUser: async (email: string, password: string) => {
    return fetchSecure({ action: 'login', email, password });
  },
  
  fetchTeacherClasses: async (email: string) => {
    return fetchSecure({ action: 'get_classes', email });
  },
  
  fetchStudents: async (className: string) => {
    return fetchSecure({ action: 'get_students', className });
  },
  
  addStudent: async (className: string, studentData: { lastNameFirstName: string; fullName: string; gender: string; major: string; }) => {
    return fetchSecure({ action: 'add_student', className, studentData });
  },
  
  submitBatchAttendance: async (className: string, sessionHeader: string, attendanceData: Array<{studentId: string | number, status: string}>) => {
    return fetchSecure({ action: 'batch_attendance', className, sessionHeader, attendanceData });
  },

  // ---- Admin Endpoints ----
  adminGetTeachers: async () => {
    return fetchSecure({ action: 'admin_get_teachers' });
  },

  adminUpdateTeacherAccount: async (name: string, email: string, pass: string) => {
    return fetchSecure({ action: 'admin_update_teacher', name, email, pass });
  }
};
