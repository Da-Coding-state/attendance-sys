/**
 * ENTERPRISE-GRADE GOOGLE APPS SCRIPT FOR ATTENDANCE SYSTEM
 * ==========================================================
 * របៀបប្រើប្រាស់៖
 * 1. ចម្លងកូដនេះទៅដាក់ក្នុង Google Apps Script Project របស់អ្នក។
 * 2. ប្តូរ SPREADSHEET_ID ទៅជា ID នៃ Google Sheet របស់អ្នក។
 * 3. Deploy ជា Web App (Execute as: Me, Access: Anyone)។
 * 4. យក URL ដែលទទួលទានទៅដាក់ក្នុង .env (VITE_API_URL)។
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // សូមដាក់ ID របស់ Sheet លោកគ្រូ
const SECRET_KEY = '123456'; // ត្រូវតែដូចគ្នាទៅនឹង VITE_API_SECRET_KEY ក្នុង .env

/**
 * ដោះស្រាយ Preflight Request (CORS) ពី Browser
 */
function doOptions(e) {
  return createResponse({ status: "ok" });
}

/**
 * ទទួលសំណើប្រភេទ GET
 */
function doGet(e) {
  try {
    const params = e.parameter;
    
    // 1. ផ្ទៀងផ្ទាត់ Secret Key (Security)
    if (params.secret_key !== SECRET_KEY) {
      return createResponse({ success: false, error: 'Forbidden: Secret Key មិនត្រឹមត្រូវ' }, 403);
    }
    
    const action = params.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (action === 'get_classes') {
      const email = params.email;
      const sheet = ss.getSheetByName('Classes');
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      
      const teacherEmailIdx = headers.indexOf('teacherEmail');
      const classNameIdx = headers.indexOf('className');
      
      const classes = data
        .filter(row => row[teacherEmailIdx] === email)
        .map(row => row[classNameIdx]);
        
      return createResponse({ success: true, data: classes });
    }
    
    if (action === 'get_students') {
      const className = params.className;
      const sheet = ss.getSheetByName(className);
      if (!sheet) return createResponse({ success: true, data: [], sessions: [] });
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const sessionHeaders = headers.filter(h => String(h).includes('||'));
      
      const students = rows.map(row => {
        const student = {};
        headers.forEach((h, i) => {
          student[h] = row[i];
        });
        return student;
      });
      
      return createResponse({ success: true, data: students, sessions: sessionHeaders });
    }
    
    if (action === 'admin_get_teachers') {
      const sheet = ss.getSheetByName('Teacher');
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      const teachers = data.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      return createResponse({ success: true, data: teachers });
    }

    return createResponse({ success: false, error: 'Action GET មិនត្រឹមត្រូវ' }, 400);

  } catch (err) {
    return createResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * ទទួលសំណើប្រភេទ POST (កន្លែងដែលត្រូវប្រើ LockService)
 */
function doPost(e) {
  // 1. Concurrency Control: ការពារការជាន់ទិន្នន័យ (Enterprise-Grade)
  const lock = LockService.getScriptLock();
  try {
    // រង់ចាំ lock រយៈពេល ១០វិនាទី
    if (!lock.tryLock(10000)) {
      return createResponse({ success: false, error: 'Server  مصروف (Busy): សូមព្យាយាមម្តងទៀតនៅបន្តិចទៀតនេះ' }, 408);
    }
    
    // 2. ផ្ទៀងផ្ទាត់ Secret Key ពី URL Parameter
    const secretKeyFromUrl = e.parameter.secret_key;
    if (secretKeyFromUrl !== SECRET_KEY) {
      return createResponse({ success: false, error: 'Forbidden: Secret Key មិនត្រឹមត្រូវ' }, 403);
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // --- ផ្នែក Login ---
    if (action === 'login') {
      const { email, password } = payload;
      const sheet = ss.getSheetByName('Teacher');
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      
      const emailIdx = headers.indexOf('email');
      const passIdx = headers.indexOf('password');
      const nameIdx = headers.indexOf('name');
      const roleIdx = headers.indexOf('role');
      
      const userIdx = data.findIndex(row => 
        String(row[emailIdx]) === String(email) && 
        String(row[passIdx]) === String(password)
      );
      
      if (userIdx > -1) {
        const row = data[userIdx];
        return createResponse({ 
          success: true, 
          data: { email: row[emailIdx], name: row[nameIdx], role: row[roleIdx] || 'teacher' } 
        });
      }
      return createResponse({ success: false, error: 'អ៊ីមែល ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ' });
    }
    
    // --- ផ្នែកកត់វត្តមាន (Batch Attendance) ---
    if (action === 'batch_attendance') {
      const { className, sessionHeader, attendanceData } = payload;
      
      // 3. Data Validation: ឆែកមើលសំណើដែលផ្ញើមក (Security Check)
      if (!className || !sessionHeader || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return createResponse({ success: false, error: 'ទិន្នន័យមិនពេញលេញ ឬមិនមានសិស្សសម្រាប់កត់វត្តមានឡើយ' }, 400);
      }
      
      // ឆែកទម្រង់ header (ត្រូវមាន ||)
      if (!sessionHeader.includes('||')) {
        return createResponse({ success: false, error: 'ទម្រង់ Session Header មិនត្រឹមត្រូវ' }, 400);
      }
      
      const sheet = ss.getSheetByName(className);
      if (!sheet) return createResponse({ success: false, error: 'រកមិនឃើញសន្លឹកកិច្ចការថ្នាក់៖ ' + className });
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      let colIdx = headers.indexOf(sessionHeader);
      
      // បើជា Session ថ្មី (មិនទាន់មាន Column ក្នុង Sheet)
      if (colIdx === -1) {
        colIdx = headers.length;
        sheet.getRange(1, colIdx + 1).setValue(sessionHeader);
      }
      
      // សរសេរវត្តមានចូលតាម Student ID
      attendanceData.forEach(item => {
        // Find row by student ID in column 1 (Index 0)
        const rowIdx = data.findIndex(row => String(row[0]) === String(item.studentId));
        if (rowIdx > -1) {
          sheet.getRange(rowIdx + 1, colIdx + 1).setValue(item.status);
        }
      });
      
      SpreadsheetApp.flush(); // បញ្ចប់ការសរសេរភ្លាមៗ
      return createResponse({ success: true });
    }

    // --- ផ្នែកបន្ថែមនិស្សិតថ្មី ---
    if (action === 'add_student') {
        const { className, studentData } = payload;
        const sheet = ss.getSheetByName(className);
        if (!sheet) return createResponse({ success: false, error: 'រកមិនឃើញថ្នាក់សិក្សាឡើយ' });
        
        sheet.appendRow([
            studentData.id || sheet.getLastRow(),
            studentData.lastNameFirstName,
            studentData.fullName,
            studentData.gender,
            studentData.major
        ]);
        return createResponse({ success: true });
    }

    // --- ផ្នែក Admin Update Teacher ---
    if (action === 'admin_update_teacher') {
       const { name, email, pass } = payload;
       const sheet = ss.getSheetByName('Teacher');
       const data = sheet.getDataRange().getValues();
       const headers = data.shift();
       
       const emailIdx = headers.indexOf('email');
       const rowIdx = data.findIndex(row => row[emailIdx] === email);
       
       if (rowIdx > -1) {
         sheet.getRange(rowIdx + 2, headers.indexOf('name') + 1).setValue(name);
         sheet.getRange(rowIdx + 2, headers.indexOf('password') + 1).setValue(pass);
       } else {
         const newRow = new Array(headers.length).fill('');
         newRow[headers.indexOf('name')] = name;
         newRow[headers.indexOf('email')] = email;
         newRow[headers.indexOf('password')] = pass;
         newRow[headers.indexOf('role')] = 'teacher';
         sheet.appendRow(newRow);
       }
       return createResponse({ success: true });
    }
    
    return createResponse({ success: false, error: 'Action POST មិនស្គាល់' }, 400);

  } catch (err) {
    return createResponse({ success: false, error: err.toString() }, 500);
  } finally {
    // 4. ចחרចេញពី Lock ជានិច្ច ទោះបីជាមាន Error ក៏ដោយ
    lock.releaseLock();
  }
}

/**
 * ជំនួយការសម្រាប់បង្កើត JSON Response ជាមួយនឹង CORS Headers
 */
function createResponse(data, status = 200) {
  // Google Apps Script គ្រប់គ្រង CORS ស្វ័យប្រវត្តិតាមរយៈ ContentService JSON output
  // នៅពេលដែលវាត្រូវបាន Deploy ជា Web App ក្នុងកម្រិត Access: Anyone
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
