import toast from 'react-hot-toast';

const SCRIPT_URL = import.meta.env.VITE_API_URL;
const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY;

/**
 * Helper សម្រាប់ទាញយកទិន្នន័យ (GET requests)
 */
async function fetchGet(params: Record<string, string>) {
  const url = new URL(SCRIPT_URL);
  // បន្ថែម Secret Key ទៅកាន់ Query Parameter
  url.searchParams.append('secret_key', SECRET_KEY || '');
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  try {
    const response = await fetch(url.toString());
    
    if (response.status === 403) {
      toast.error('Forbidden: Secret Key មិនត្រឹមត្រូវ! (403)');
      throw new Error('403 Forbidden');
    }
    
    if (!response.ok) throw new Error('API Request Failed');
    return response.json();
  } catch (error: any) {
    if (error.message !== '403 Forbidden') {
      console.error('Fetch GET Error:', error);
    }
    throw error;
  }
}

/**
 * Helper សម្រាប់បញ្ជូនទិន្នន័យ (POST requests)
 * Cution: ប្រើប្រាស់ text/plain ដើម្បីកុំឲ្យជាប់បញ្ហា CORS ជាមួយនឹង Apps Script
 */
async function fetchPost(payload: any) {
  const url = new URL(SCRIPT_URL);
  // បន្ថែម Secret Key ទៅកាន់ Query Parameter ទោះបីជា POST ក៏ដោយ (Apps Script doPost អាចអានបាន)
  url.searchParams.append('secret_key', SECRET_KEY || '');

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.status === 403) {
      toast.error('Forbidden: Secret Key មិនត្រឹមត្រូវ! (403)');
      throw new Error('403 Forbidden');
    }
    
    if (!response.ok) throw new Error('API Request Failed');
    return response.json();
  } catch (error: any) {
    if (error.message !== '403 Forbidden') {
      console.error('Fetch POST Error:', error);
    }
    throw error;
  }
}

export const api = {
  loginUser: async (email: string, password: string) => {
    return fetchPost({ action: 'login', email, password });
  },
  
  fetchTeacherClasses: async (email: string) => {
    return fetchGet({ action: 'get_classes', email });
  },
  
  fetchStudents: async (className: string) => {
    return fetchGet({ action: 'get_students', className });
  },
  
  addStudent: async (className: string, studentData: { lastNameFirstName: string; fullName: string; gender: string; major: string; }) => {
    return fetchPost({ action: 'add_student', className, studentData });
  },
  
  submitBatchAttendance: async (className: string, sessionHeader: string, attendanceData: Array<{studentId: string | number, status: string}>) => {
    return fetchPost({ action: 'batch_attendance', className, sessionHeader, attendanceData });
  },

  // ---- Admin Endpoints ----
  adminGetTeachers: async () => {
    return fetchGet({ action: 'admin_get_teachers' });
  },

  adminUpdateTeacherAccount: async (name: string, email: string, pass: string) => {
    return fetchPost({ action: 'admin_update_teacher', name, email, pass });
  }
};
