import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
         <h2 className="text-2xl font-bold text-slate-800 mb-2">សួស្តី Admin, {user?.name}!</h2>
         <p className="text-slate-500">អ្នកមានសិទ្ធិពេញលេញក្នុងការត្រួតពិនិត្យប្រព័ន្ធគ្រប់គ្រងវត្តមាន។</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Link to="/admin/teachers" className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer block">
            <Users className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg text-slate-800 mb-1">គ្រប់គ្រងគ្រូបង្រៀន</h3>
            <p className="text-sm text-slate-500">បន្ថែម កែប្រែ ឬលុបគណនីគ្រូ</p>
         </Link>
         
         <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer">
            <ShieldAlert className="w-8 h-8 text-amber-600 mb-4" />
            <h3 className="font-bold text-lg text-slate-800 mb-1">កំណត់សិទ្ធិ និងរបាយការណ៍</h3>
            <p className="text-sm text-slate-500">គ្រប់គ្រងការអនុញ្ញាតផ្សេងៗក្នុងប្រព័ន្ធជារួម</p>
         </div>
      </div>
    </div>
  );
}
