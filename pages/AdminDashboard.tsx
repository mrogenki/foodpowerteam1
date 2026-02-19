import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, ChevronRight, Search, FileDown, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, UserPlus, DollarSign, TrendingUp, BarChart3, Mail, User, Clock, Image as ImageIcon, UploadCloud, Loader2, Smartphone, Building2, Briefcase, Globe, FileUp, Download, ClipboardList, CheckSquare, AlertCircle, RotateCcw, MapPin, Filter, X, Eye, EyeOff, Ticket, Cake, CreditCard, Home, Hash, Crown, ArrowLeft, RefreshCcw, Ban, UserCheck, ExternalLink, BellRing, Send, History } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import emailjs from '@emailjs/browser';
import { Activity, MemberActivity, Registration, MemberRegistration, ActivityType, AdminUser, UserRole, Member, AttendanceRecord, AttendanceStatus, Coupon, IndustryCategories, PaymentStatus, MemberApplication } from '../types';
import { EMAIL_CONFIG } from '../constants';

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  activities: Activity[];
  memberActivities: MemberActivity[];
  registrations: Registration[];
  memberRegistrations: MemberRegistration[];
  users: AdminUser[];
  members: Member[];
  memberApplications: MemberApplication[]; // 新增：會員申請列表
  coupons: Coupon[];
  onUpdateActivity: (act: Activity) => void;
  onAddActivity: (act: Activity) => void;
  onDeleteActivity: (id: string | number) => void;
  onUpdateMemberActivity: (act: MemberActivity) => void;
  onAddMemberActivity: (act: MemberActivity) => void;
  onDeleteMemberActivity: (id: string | number) => void;
  onUpdateRegistration: (reg: Registration) => void;
  onDeleteRegistration: (id: string | number) => void;
  onUpdateMemberRegistration: (reg: MemberRegistration) => void;
  onDeleteMemberRegistration: (id: string | number) => void;
  onAddUser: (user: AdminUser) => void;
  onDeleteUser: (id: string) => void;
  onAddMember: (member: Member) => void;
  onAddMembers?: (members: Member[]) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
  onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => void;
  onApproveMemberApplication: (app: MemberApplication) => void; // 新增：核准
  onDeleteMemberApplication: (id: string | number) => void; // 新增：拒絕
}

// 獨立的輸入元件
const PaidAmountInput: React.FC<{ value?: number; onSave: (val: number) => void }> = ({ value, onSave }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '0');
  useEffect(() => { setLocalValue(value?.toString() || '0'); }, [value]);
  const handleBlur = () => {
    const num = parseInt(localValue);
    if (!isNaN(num) && num !== (value || 0)) onSave(num);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') e.currentTarget.blur(); };
  return <input type="number" className="border rounded px-2 py-1 w-24 text-sm focus:ring-1 focus:ring-red-500 outline-none transition-all text-right" value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder="0" />;
};

// Sidebar
const Sidebar: React.FC<{ user: AdminUser; onLogout: () => void; pendingCount: number }> = ({ user, onLogout, pendingCount }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isManager = user.role === UserRole.MANAGER || isSuperAdmin;
  const isStaff = user.role === UserRole.STAFF;

  return (
    <div className="w-64 bg-gray-900 text-gray-400 flex flex-col min-h-screen shrink-0">
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold">食</div>
          <span className="font-bold tracking-tight">管理系統</span>
        </Link>
        <div className="mt-4 px-3 py-2 rounded bg-gray-800 border border-gray-700">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.role}</p>
          <p className="text-sm text-white font-medium truncate">{user.name}</p>
        </div>
      </div>
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
        <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><LayoutDashboard size={20} /><span>儀表板</span></Link>
        
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">活動報到 (工作人員)</div>
        <Link to="/admin/check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><CheckSquare size={20} /><span>一般活動報到</span></Link>
        <Link to="/admin/member-check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Crown size={20} /><span>會員活動報到</span></Link>
        
        {isManager && (<>
          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">活動管理</div>
          <Link to="/admin/activities" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/activities') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Calendar size={20} /><span>一般活動管理</span></Link>
          <Link to="/admin/member-activities" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-activities') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Calendar size={20} /><span>會員活動管理</span></Link>

          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">會員/營運</div>
          <Link to="/admin/members" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/members') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Building2 size={20} /><span>會員資料庫</span></Link>
          <Link to="/admin/member-applications" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-applications') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
            <UserPlus size={20} />
            <div className="flex-grow flex justify-between items-center">
                <span>新會員申請</span>
                {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </div>
          </Link>
          <Link to="/admin/coupons" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/coupons') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Ticket size={20} /><span>折扣券管理</span></Link>
        </>)}

        {isSuperAdmin && (<>
            <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">系統管理</div>
            <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/users') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Shield size={20} /><span>帳號權限</span></Link>
        </>)}
      </nav>
      <div className="p-4 border-t border-gray-800"><button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600/10 hover:text-red-500 transition-colors"><LogOut size={20} /><span>登出</span></button></div>
    </div>
  );
};

interface DashboardHomeProps {
  currentUser: AdminUser;
  members: Member[];
  activities: Activity[];
  memberActivities: MemberActivity[];
  registrations: Registration[];
  memberRegistrations: MemberRegistration[];
  memberApplications: MemberApplication[];
}

// 儀表板首頁元件
const DashboardHome: React.FC<DashboardHomeProps> = ({ currentUser, members, activities, memberActivities, registrations, memberRegistrations, memberApplications }) => {
  const isStaff = currentUser.role === UserRole.STAFF;

  const stats = useMemo(() => {
    const activeMembers = members.filter(m => {
       if (m.membership_expiry_date) {
          return m.membership_expiry_date >= new Date().toISOString().slice(0, 10);
       }
       return m.status === 'active';
    }).length;

    const totalRevenue = 
      registrations.reduce((sum, r) => sum + (r.paid_amount || 0), 0) + 
      memberRegistrations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);

    const upcomingActivitiesCount = 
      activities.filter(a => (a.status === 'active' || !a.status) && a.date >= new Date().toISOString().slice(0, 10)).length + 
      memberActivities.filter(a => (a.status === 'active' || !a.status) && a.date >= new Date().toISOString().slice(0, 10)).length;
    
    const pendingApplications = memberApplications.length;

    const calculateActivityStats = (act: Activity | MemberActivity, regs: Registration[] | MemberRegistration[]) => {
       const actRegs = regs.filter(r => String(r.activityId) === String(act.id));
       const regCount = actRegs.length;
       const checkInCount = actRegs.filter(r => r.check_in_status).length;
       const revenue = actRegs.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
       return { id: act.id, title: act.title, date: act.date, status: act.status || 'active', regCount, checkInCount, revenue };
    };

    const generalStats = activities.map(a => ({...calculateActivityStats(a, registrations), category: '一般'}));
    const memberStats = memberActivities.map(a => ({...calculateActivityStats(a, memberRegistrations), category: '會員'}));
    
    const allActivityStats = [...generalStats, ...memberStats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { activeMembers, totalRevenue, upcomingActivitiesCount, allActivityStats, pendingApplications };
  }, [members, activities, memberActivities, registrations, memberRegistrations, memberApplications]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系統概況</h1>
        <p className="text-gray-500">{isStaff ? '您好，請使用左側選單進行活動報到。' : '歡迎回到管理後台，以下是目前的營運數據。'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!isStaff && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users size={20} /></div>
              <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">有效</span>
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">會員總數</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeMembers}<span className="text-sm text-gray-400 font-normal ml-1">人</span></p>
          </div>
        )}
        
        {!isStaff && (
          <Link to="/admin/member-applications" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><UserPlus size={20} /></div>
              {stats.pendingApplications > 0 && <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded animate-pulse">待審核</span>}
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider group-hover:text-red-600 transition-colors">新會員申請</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApplications}<span className="text-sm text-gray-400 font-normal ml-1">筆</span></p>
          </Link>
        )}
        
        {!isStaff && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">累積營收</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">NT$ {stats.totalRevenue.toLocaleString()}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><Calendar size={20} /></div>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">近期活動數</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingActivitiesCount}<span className="text-sm text-gray-400 font-normal ml-1">場</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
           <h3 className="text-lg font-bold text-gray-900">各活動營運狀態</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4">活動名稱 / 日期</th>
                    <th className="p-4">類別</th>
                    <th className="p-4 text-center">報名人數</th>
                    <th className="p-4 text-center">出席人數</th>
                    {!isStaff && <th className="p-4 text-right">累積營收</th>}
                    <th className="p-4 text-center">狀態</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                 {stats.allActivityStats.map((act: any) => (
                    <tr key={`${act.category}-${act.id}`} className="hover:bg-gray-50">
                       <td className="p-4">
                          <div className="font-bold text-gray-900">{act.title}</div>
                          <div className="text-xs text-gray-400">{act.date}</div>
                       </td>
                       <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${act.category === '會員' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                             {act.category}
                          </span>
                       </td>
                       <td className="p-4 text-center font-medium">
                          {act.regCount} 人
                       </td>
                       <td className="p-4 text-center">
                          <span className={`font-bold ${act.checkInCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                             {act.checkInCount}
                          </span> 
                          <span className="text-gray-400 text-xs"> / {act.regCount}</span>
                       </td>
                       {!isStaff && (
                         <td className="p-4 text-right font-mono font-bold text-gray-700">
                            NT$ {act.revenue.toLocaleString()}
                         </td>
                       )}
                       <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${act.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                             {act.status === 'active' ? '進行中' : '已結束'}
                          </span>
                       </td>
                    </tr>
                 ))}
                 {stats.allActivityStats.length === 0 && (
                    <tr><td colSpan={isStaff ? 5 : 6} className="p-6 text-center text-gray-400">尚無活動資料</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

const MemberApplicationManager: React.FC<{ 
  applications: MemberApplication[]; 
  onApprove: (app: MemberApplication) => void;
  onDelete: (id: string | number) => void; 
}> = ({ applications, onApprove, onDelete }) => {
  const [selectedApp, setSelectedApp] = useState<MemberApplication | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新會員申請管理</h1>
      <p className="text-gray-500">此處顯示前台提交的會員申請表，請確認已繳費後再進行核准。</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="p-4">申請日期</th>
                <th className="p-4">姓名</th>
                <th className="p-4">公司/職稱</th>
                <th className="p-4">聯繫方式</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-gray-900">{app.name}</td>
                  <td className="p-4">
                    <div className="font-bold">{app.brand_name || app.company_title}</div>
                    <div className="text-xs text-gray-500">{app.job_title}</div>
                  </td>
                  <td className="p-4">
                     <div>{app.phone}</div>
                     <div className="text-xs text-gray-400">{app.email}</div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-blue-200 shadow-sm"
                    >
                      審核 / 詳細資料
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">目前沒有待審核的申請</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">申請內容詳情</h2>
               <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
             </div>
             <div className="space-y-6">
               <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
                 <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                 <div>
                   <p className="text-yellow-800 font-bold">核准前請確認</p>
                   <p className="text-yellow-700 text-sm">請確認申請人已完成入會費繳納，資料填寫正確。點擊「核准並加入會員」後，系統將自動產生會員編號並正式寫入資料庫。</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-500 block mb-1">姓名</span><p className="font-bold text-lg">{selectedApp.name}</p></div>
                 <div><span className="text-gray-500 block mb-1">申請日期</span><p className="font-bold">{new Date(selectedApp.created_at).toLocaleString()}</p></div>
                 
                 <div className="col-span-2 border-t pt-4 mt-2"><h3 className="font-bold text-gray-900 mb-2">基本資料</h3></div>
                 <div><span className="text-gray-500 block">身分證字號</span><p>{selectedApp.id_number}</p></div>
                 <div><span className="text-gray-500 block">生日</span><p>{selectedApp.birthday}</p></div>
                 <div><span className="text-gray-500 block">引薦人</span><p>{selectedApp.referrer || '無'}</p></div>
                 
                 <div className="col-span-2 border-t pt-4 mt-2"><h3 className="font-bold text-gray-900 mb-2">聯絡方式</h3></div>
                 <div><span className="text-gray-500 block">手機</span><p>{selectedApp.phone}</p></div>
                 <div><span className="text-gray-500 block">Email</span><p>{selectedApp.email}</p></div>
                 <div><span className="text-gray-500 block">室內電話</span><p>{selectedApp.home_phone}</p></div>
                 <div className="md:col-span-2"><span className="text-gray-500 block">通訊地址</span><p>{selectedApp.address}</p></div>
                 
                 <div className="col-span-2 border-t pt-4 mt-2"><h3 className="font-bold text-gray-900 mb-2">事業資料</h3></div>
                 <div><span className="text-gray-500 block">產業分類</span><p className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{selectedApp.industry_category}</p></div>
                 <div><span className="text-gray-500 block">品牌名稱</span><p>{selectedApp.brand_name}</p></div>
                 <div><span className="text-gray-500 block">公司抬頭</span><p>{selectedApp.company_title}</p></div>
                 <div><span className="text-gray-500 block">統一編號</span><p>{selectedApp.tax_id}</p></div>
                 <div><span className="text-gray-500 block">職稱</span><p>{selectedApp.job_title}</p></div>
                 <div><span className="text-gray-500 block">公司網站</span><p className="text-blue-600 truncate">{selectedApp.website}</p></div>
                 <div className="md:col-span-2"><span className="text-gray-500 block">主要服務/產品</span><p className="bg-gray-50 p-2 rounded">{selectedApp.main_service}</p></div>
                 <div className="md:col-span-2"><span className="text-gray-500 block">備註</span><p className="bg-gray-50 p-2 rounded">{selectedApp.notes || '無'}</p></div>
               </div>
             </div>
             <div className="flex gap-4 mt-8 pt-6 border-t">
               <button onClick={() => { onDelete(selectedApp.id); setSelectedApp(null); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors">拒絕 / 刪除</button>
               <button onClick={() => { onApprove(selectedApp); setSelectedApp(null); }} className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"><CheckCircle size={20} /> 確認無誤，核准並加入會員</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ActivityManager: React.FC<{
  type: 'general' | 'member';
  activities: (Activity | MemberActivity)[];
  registrations: (Registration | MemberRegistration)[];
  onAdd: (act: any) => void;
  onUpdate: (act: any) => void;
  onDelete: (id: string | number) => void;
  onUpdateReg: (reg: any) => void;
  onDeleteReg: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
  members?: Member[];
}> = ({ type, activities, registrations, onAdd, onUpdate, onDelete, onUpdateReg, onDeleteReg, onUploadImage, members }) => {
  const [view, setView] = useState<'list' | 'edit' | 'registrations'>('list');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [regSearch, setRegSearch] = useState('');

  const currentActivity = activities.find(a => a.id === editingId);
  const currentRegistrations = registrations.filter(r => String(r.activityId) === String(editingId));
  
  const filteredRegs = currentRegistrations.filter((r: any) => {
    const term = regSearch.toLowerCase();
    const name = r.name || r.member_name || '';
    return name.toLowerCase().includes(term) || (r.phone && r.phone.includes(term)) || (r.email && r.email.toLowerCase().includes(term)) || (r.merchant_order_no && r.merchant_order_no.includes(term));
  });

  const handleEdit = (act: any) => { setEditingId(act.id); setFormData({ ...act }); setView('edit'); };
  const handleCreate = () => { setEditingId(null); setFormData({ type: type === 'general' ? ActivityType.GATHERING : ActivityType.GATHERING, title: '', date: '', time: '', location: '', price: 0, picture: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1', description: '', status: 'active' }); setView('edit'); };
  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (editingId) onUpdate(formData); else onAdd(formData); setView('list'); };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const url = await onUploadImage(e.target.files[0]); if (url) setFormData({ ...formData, picture: url }); } };

  const exportCSV = () => {
    const data = currentRegistrations.map((r: any) => ({
      '報名時間': new Date(r.created_at).toLocaleString(),
      '姓名': r.name || r.member_name,
      '電話': r.phone || (members?.find(m => String(m.id) === String(r.memberId))?.phone),
      'Email': r.email,
      '單位/職稱': r.company ? `${r.company}/${r.title}` : '',
      '報到狀態': r.check_in_status ? '已報到' : '未報到',
      '付款狀態': r.payment_status === PaymentStatus.PAID ? '已付款' : (r.payment_status === 'refunded' ? '已退費' : '待付款'),
      '付款金額': r.paid_amount,
      '金流單號': r.merchant_order_no,
      '折扣碼': r.coupon_code
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "報名名單");
    XLSX.writeFile(wb, `${currentActivity?.title}_報名名單.xlsx`);
  };
  
  const handlePaymentStatusToggle = (reg: any) => {
     if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID }); return; }
     if (reg.payment_status === PaymentStatus.PAID) { if (confirm("【已付款】訂單操作：\n\n按「確定」將狀態標記為【已退費】\n按「取消」詢問是否回復為【待付款】")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.REFUNDED }); } else { if (confirm("是否要將此訂單回復為【待付款】？")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING }); } } return; }
     if (reg.payment_status === PaymentStatus.REFUNDED) { if (confirm("是否將此【已退費】訂單重新開啟為【待付款】？")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING }); } return; }
  };

  if (view === 'registrations' && currentActivity) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900"><ChevronRight className="rotate-180" size={20} /> 返回列表</button>
          <div className="flex gap-2"><button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"><FileDown size={16} /> 匯出名單</button></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-2">{currentActivity.title}</h2>
          <div className="flex gap-4 text-sm text-gray-500 mb-6"><span>總報名: {currentRegistrations.length} 人</span><span>已付款: {currentRegistrations.filter(r => r.payment_status === PaymentStatus.PAID).length} 人</span><span>已退費: {currentRegistrations.filter(r => r.payment_status === 'refunded').length} 人</span><span>已報到: {currentRegistrations.filter(r => r.check_in_status).length} 人</span></div>
          <div className="flex gap-2 mb-4"><div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="搜尋姓名、電話、金流單號..." value={regSearch} onChange={e => setRegSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" /></div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="p-4 rounded-tl-lg">姓名/資訊</th><th className="p-4">報到狀態</th><th className="p-4">付款狀態 (點擊切換)</th><th className="p-4">金額</th><th className="p-4 rounded-tr-lg text-right">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRegs.map((reg: any) => (
                  <tr key={reg.id} className={`hover:bg-gray-50 ${reg.payment_status === 'refunded' ? 'bg-gray-50' : ''}`}>
                    <td className="p-4"><div className={`font-bold flex items-center gap-2 ${reg.payment_status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{reg.name || reg.member_name}{reg.payment_status === 'refunded' && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold no-underline">已退費</span>}</div><div className="text-xs text-gray-400">{reg.phone}</div>{reg.merchant_order_no && <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{reg.merchant_order_no}</div>}</td>
                    <td className="p-4"><button onClick={() => onUpdateReg({...reg, check_in_status: !reg.check_in_status})} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${reg.check_in_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{reg.check_in_status ? <CheckCircle size={14}/> : <XCircle size={14}/>} {reg.check_in_status ? '已報到' : '未報到'}</button></td>
                    <td className="p-4"><button onClick={() => handlePaymentStatusToggle(reg)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${reg.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700 hover:bg-green-200' : (reg.payment_status === 'refunded' ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')}`} title={reg.payment_status === PaymentStatus.PAID ? '點擊進行退費' : '點擊變更狀態'}>{reg.payment_status === PaymentStatus.PAID ? '已付款' : (reg.payment_status === 'refunded' ? '已退費' : '待付款')}{reg.payment_status === PaymentStatus.PAID && <RefreshCcw size={10} className="ml-1 opacity-50"/>}{reg.payment_status === 'refunded' && <Ban size={10} className="ml-1 opacity-50"/>}</button></td>
                    <td className="p-4"><PaidAmountInput value={reg.paid_amount} onSave={(val) => onUpdateReg({...reg, paid_amount: val})} /></td>
                    <td className="p-4 text-right"><button onClick={() => { if(confirm('確定刪除此報名資料？')) onDeleteReg(reg.id); }} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
         <div className="flex items-center gap-4"><button onClick={() => setView('list')} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><ChevronRight className="rotate-180" size={20} /></button><h2 className="text-2xl font-bold">{editingId ? '編輯活動' : '新增活動'}</h2></div>
         <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div><label className="block text-sm font-bold text-gray-700 mb-2">活動標題</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">活動類型</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500">{Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">日期</label><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">時間</label><input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">地點</label><input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">費用</label><input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">活動封面圖片</label><div className="flex items-center gap-4"><img src={formData.picture} alt="Preview" className="w-32 h-20 object-cover rounded-lg border bg-gray-50"/><label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2"><UploadCloud size={18} /> 上傳圖片<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label></div></div>
               <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">活動描述</label><textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
               <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">狀態</label><select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"><option value="active">開啟報名 (Active)</option><option value="closed">結束報名 (Closed)</option></select></div>
            </div>
            <div className="flex justify-end pt-6 border-t"><button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700">儲存活動</button></div>
         </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">{type === 'member' ? '會員' : '一般'}活動管理</h1><button onClick={handleCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-200"><Plus size={18} /> 新增活動</button></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{activities.map(act => (<div key={act.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"><div className="h-40 overflow-hidden relative"><img src={act.picture} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/><div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold ${act.status === 'closed' ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'}`}>{act.status === 'closed' ? '已結束' : '報名中'}</div></div><div className="p-5"><div className="mb-4"><span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{act.type}</span><h3 className="text-lg font-bold mt-2 line-clamp-1">{act.title}</h3><p className="text-sm text-gray-500 mt-1">{act.date} | {act.location}</p></div><div className="flex justify-between items-center pt-4 border-t border-gray-50"><button onClick={() => { setEditingId(act.id); setView('registrations'); }} className="text-sm font-bold text-gray-600 hover:text-red-600 flex items-center gap-1"><Users size={16}/> 名單 ({registrations.filter(r => String(r.activityId) === String(act.id)).length})</button><div className="flex gap-2"><button onClick={() => handleEdit(act)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50"><Edit size={16} /></button><button onClick={() => { if(confirm('確定刪除？')) onDelete(act.id); }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button></div></div></div></div>))}</div>
    </div>
  );
};

const ActivityCheckInManager: React.FC<{
  type: 'general' | 'member';
  activities: (Activity | MemberActivity)[];
  registrations: (Registration | MemberRegistration)[];
  onUpdateReg: (reg: any) => void;
}> = ({ type, activities, registrations, onUpdateReg }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!selectedActivityId) {
    const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{type === 'member' ? '會員' : '一般'}活動報到</h1>
        <p className="text-gray-500">請選擇要進行報到的活動：</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sortedActivities.map(act => { const regCount = registrations.filter(r => String(r.activityId) === String(act.id)).length; const checkedInCount = registrations.filter(r => String(r.activityId) === String(act.id) && r.check_in_status).length; return (<button key={act.id} onClick={() => setSelectedActivityId(act.id)} className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-red-200 transition-all group"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm">{new Date(act.date).getDate()}<span className="text-[10px] ml-0.5">日</span></div><span className={`px-2 py-1 rounded text-xs font-bold ${act.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{act.status === 'active' ? '進行中' : '已結束'}</span></div><h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">{act.title}</h3><p className="text-sm text-gray-500 mb-4">{act.date} {act.time}</p><div className="flex items-center justify-between text-sm border-t pt-4"><span className="text-gray-500 font-medium">報名 {regCount} 人</span><span className="text-red-600 font-bold">已到 {checkedInCount} 人</span></div></button>); })} {sortedActivities.length === 0 && <div className="text-gray-400 p-10 text-center col-span-full">目前無活動資料</div>}</div>
      </div>
    );
  }

  const currentActivity = activities.find(a => a.id === selectedActivityId);
  const currentRegistrations = registrations.filter(r => String(r.activityId) === String(selectedActivityId));
  const filteredRegs = currentRegistrations.filter((r: any) => { const term = searchTerm.toLowerCase(); const name = r.name || r.member_name || ''; return name.toLowerCase().includes(term) || (r.phone && r.phone.includes(term)) || (r.merchant_order_no && r.merchant_order_no.includes(term)); });
  const handlePaymentStatusToggle = (reg: any) => { if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID }); return; } if (reg.payment_status === PaymentStatus.PAID) { if (confirm("【已付款】訂單操作：\n\n按「確定」將狀態標記為【已退費】\n按「取消」詢問是否回復為【待付款】")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.REFUNDED }); } else { if (confirm("是否要將此訂單回復為【待付款】？")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING }); } } return; } if (reg.payment_status === PaymentStatus.REFUNDED) { if (confirm("是否將此【已退費】訂單重新開啟為【待付款】？")) { onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING }); } return; } };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
       <div className="flex items-center gap-4"><button onClick={() => setSelectedActivityId(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button><div><h2 className="text-2xl font-bold">{currentActivity?.title}</h2><p className="text-sm text-gray-500">報到管理列表</p></div></div>
       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"><div className="relative flex-grow max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="搜尋姓名、手機末三碼、單號..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 focus:bg-white transition-all" autoFocus/></div><div className="flex gap-4 text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg"><span>總計: {currentRegistrations.length}</span><span className="text-green-600">已到: {currentRegistrations.filter(r => r.check_in_status).length}</span><span className="text-gray-400">未到: {currentRegistrations.length - currentRegistrations.filter(r => r.check_in_status).length}</span></div></div><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="p-4 rounded-tl-lg">參加者</th><th className="p-4">報到操作 (點擊切換)</th><th className="p-4">付款狀態</th><th className="p-4 rounded-tr-lg">金額</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredRegs.map((reg: any) => (<tr key={reg.id} className={`hover:bg-gray-50 transition-colors ${reg.check_in_status ? 'bg-green-50/30' : ''} ${reg.payment_status === 'refunded' ? 'bg-gray-50' : ''}`}><td className="p-4"><div className={`font-bold text-lg flex items-center gap-2 ${reg.payment_status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{reg.name || reg.member_name}{reg.payment_status === 'refunded' && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold no-underline">已退費</span>}</div><div className="text-sm text-gray-500">{reg.phone}</div></td><td className="p-4"><button onClick={() => onUpdateReg({...reg, check_in_status: !reg.check_in_status})} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${reg.check_in_status ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>{reg.check_in_status ? <CheckCircle size={20}/> : <XCircle size={20}/>} {reg.check_in_status ? '已報到' : '未報到'}</button></td><td className="p-4"><button onClick={() => handlePaymentStatusToggle(reg)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${reg.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700 hover:bg-green-200' : (reg.payment_status === 'refunded' ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')}`}>{reg.payment_status === PaymentStatus.PAID ? '已付款' : (reg.payment_status === 'refunded' ? '已退費' : '待付款')}{reg.payment_status === PaymentStatus.PAID && <RefreshCcw size={10} className="ml-1 opacity-50"/>}{reg.payment_status === 'refunded' && <Ban size={10} className="ml-1 opacity-50"/>}</button></td><td className="p-4 font-mono text-gray-600">NT$ {reg.paid_amount}</td></tr>))} {filteredRegs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">查無資料，請嘗試其他關鍵字</td></tr>}</tbody></table></div></div>
    </div>
  );
};

const MemberManager: React.FC<{ members: Member[]; onAdd: (m: Member) => void; onUpdate: (m: Member) => void; onDelete: (id: string | number) => void; onImport: (ms: Member[]) => void }> = ({ members, onAdd, onUpdate, onDelete, onImport }) => {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Payment Records State
  interface PaymentRecord {
    id: number;
    date: string;
    amount: number;
    note: string;
  }
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [newPayment, setNewPayment] = useState({ date: new Date().toISOString().slice(0, 10), amount: 5000, note: '' });

  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [activeRenewalTab, setActiveRenewalTab] = useState<'expiring' | 'expired'>('expiring');
  
  const [sendingRenewal, setSendingRenewal] = useState<string[]>([]);
  
  // LocalStorage logic for sent status
  const [renewalSent, setRenewalSent] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('sent_renewals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toISOString().slice(0, 10)) {
          return parsed.ids || [];
        }
      }
    } catch (e) { console.error(e); }
    return [];
  });

  const expiringMembers = useMemo(() => {
     return members.filter(m => {
        if (!m.membership_expiry_date) return false;
        if (m.status !== 'active') return false; 
        
        const today = new Date();
        const expiry = new Date(m.membership_expiry_date);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 40 && diffDays <= 50;
     }).sort((a, b) => (a.membership_expiry_date || '').localeCompare(b.membership_expiry_date || ''));
  }, [members]);

  const expiredMembers = useMemo(() => {
     const today = new Date().toISOString().slice(0, 10);
     return members.filter(m => {
        if (!m.membership_expiry_date) return false;
        return m.membership_expiry_date < today;
     }).sort((a, b) => (b.membership_expiry_date || '').localeCompare(a.membership_expiry_date || '')); 
  }, [members]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let active = 0;
    let inactive = 0;
    members.forEach(m => {
       const isExpired = m.membership_expiry_date && m.membership_expiry_date < today;
       if (m.status === 'active' && !isExpired) { active++; } else { inactive++; }
    });
    return { total: members.length, active, inactive };
  }, [members]);

  const filtered = members.filter(m => m.name.includes(searchTerm) || m.member_no.includes(searchTerm) || m.phone?.includes(searchTerm));

  const handleEdit = (m: Member) => { 
      setEditingId(m.id); 
      setFormData({ ...m, member_no: (m.member_no || '').toString().padStart(5, '0') });
      
      // Parse Payment Records
      try {
          const records = m.payment_records ? JSON.parse(m.payment_records) : [];
          setPaymentRecords(records);
      } catch (e) {
          setPaymentRecords([]);
      }
      
      setIsFormOpen(true); 
  };

  const handleAdd = () => { 
      setEditingId(null); 
      const maxNo = members.reduce((max, m) => { const num = parseInt(m.member_no); return !isNaN(num) && num > max ? num : max; }, 0); 
      const nextNo = (maxNo + 1).toString().padStart(5, '0'); 
      setFormData({ member_no: nextNo, name: '', status: 'active', industry_category: '其他' }); 
      setPaymentRecords([]);
      setIsFormOpen(true); 
  };

  const handleAddPaymentRecord = () => {
      const record: PaymentRecord = {
          id: Date.now(),
          date: newPayment.date,
          amount: Number(newPayment.amount),
          note: newPayment.note
      };
      const updatedRecords = [...paymentRecords, record];
      setPaymentRecords(updatedRecords);
      // Automatically update formData
      setFormData({ ...formData, payment_records: JSON.stringify(updatedRecords) });
      // Reset input
      setNewPayment({ date: new Date().toISOString().slice(0, 10), amount: 5000, note: '' });
  };

  const handleDeletePaymentRecord = (id: number) => {
      const updatedRecords = paymentRecords.filter(r => r.id !== id);
      setPaymentRecords(updatedRecords);
      setFormData({ ...formData, payment_records: JSON.stringify(updatedRecords) });
  };

  const totalPaymentAmount = useMemo(() => {
      return paymentRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [paymentRecords]);

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); if (editingId) onUpdate(formData); else onAdd(formData); setIsFormOpen(false); };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (evt) => { const bstr = evt.target?.result; const wb = XLSX.read(bstr, { type: 'binary' }); const wsname = wb.SheetNames[0]; const ws = wb.Sheets[wsname]; const data = XLSX.utils.sheet_to_json(ws) as any[]; const newMembers = data.map((row: any) => ({ id: crypto.randomUUID(), member_no: String(row['會員編號'] || ''), name: row['姓名'], industry_category: row['產業分類'] || '其他', brand_name: row['品牌名稱'] || row['公司名稱'], phone: String(row['手機'] || ''), status: 'active' as const })); onImport(newMembers); }; reader.readAsBinaryString(file); };
  const handleExport = () => { const exportData = members.map(m => ({ '會員編號': (m.member_no || '').toString().padStart(5, '0'), '姓名': m.name, '狀態': (m.status === 'active' && (!m.membership_expiry_date || m.membership_expiry_date >= new Date().toISOString().slice(0, 10))) ? '有效' : '失效', '會籍到期日': m.membership_expiry_date, '手機': m.phone, '信箱': m.email, '產業分類': m.industry_category, '品牌名稱': m.brand_name, '公司抬頭': m.company_title, '統一編號': m.tax_id, '職稱': m.job_title, '主要服務': m.main_service, '公司網站': m.website, '通訊地址': m.address, '備註': m.notes })); const ws = XLSX.utils.json_to_sheet(exportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "會員資料"); XLSX.writeFile(wb, `會員名單_${new Date().toISOString().split('T')[0]}.xlsx`); };

  const handleSendRenewalNotice = async (member: Member, type: 'renewal' | 'wakeup') => {
    if (!member.email) {
      alert(`會員 ${member.name} 未填寫 Email，無法發送`);
      return;
    }
    if (!EMAIL_CONFIG.RENEWAL_TEMPLATE_ID) {
        alert('尚未設定通知信 Template ID');
        return;
    }
    
    setSendingRenewal(prev => [...prev, String(member.id)]);
    
    try {
        await emailjs.send(
            EMAIL_CONFIG.SERVICE_ID,
            EMAIL_CONFIG.RENEWAL_TEMPLATE_ID,
            {
                to_name: member.name,
                to_email: member.email,
                expiry_date: member.membership_expiry_date,
                phone: member.phone,
                notice_type: type === 'renewal' ? '續約通知' : '喚醒通知',
            },
            EMAIL_CONFIG.PUBLIC_KEY
        );
        
        setRenewalSent(prev => {
           const updated = [...prev, String(member.id)];
           localStorage.setItem('sent_renewals', JSON.stringify({
              date: new Date().toISOString().slice(0, 10),
              ids: updated
           }));
           return updated;
        });

    } catch (error) {
        console.error('Email Error:', error);
        alert(`發送給 ${member.name} 失敗，請稍後再試。`);
    } finally {
        setSendingRenewal(prev => prev.filter(id => id !== String(member.id)));
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">會員資料庫</h1>
          <div className="flex gap-3">
             <button 
               onClick={() => setShowRenewalModal(true)}
               className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold hover:bg-yellow-200 flex items-center gap-2 relative"
             >
                <BellRing size={18} /> 會員狀態通知
                {expiringMembers.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full absolute -top-2 -right-2 border-2 border-white">{expiringMembers.length}</span>}
             </button>
             <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"><FileDown size={18} /> 匯出 Excel</button>
             <label className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 cursor-pointer"><FileUp size={18} /> 匯入 CSV<input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileUpload}/></label>
             <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={18} /> 新增會員</button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">名單總數</p><p className="text-3xl font-bold text-gray-900">{stats.total}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p></div><div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center"><Users size={24}/></div></div><div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">有效會員</p><p className="text-3xl font-bold text-gray-900">{stats.active}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p></div><div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle size={24}/></div></div><div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">失效會員</p><p className="text-3xl font-bold text-gray-900">{stats.inactive}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p></div><div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center"><XCircle size={24}/></div></div></div>
       
       {showRenewalModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex-shrink-0 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2"><BellRing className="text-yellow-500" /> 會員會籍狀態通知</h2>
                            <p className="text-sm text-gray-500 mt-1">請選擇要執行的通知類型</p>
                        </div>
                        <button onClick={() => setShowRenewalModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                    </div>

                    <div className="flex gap-6">
                        <button 
                            onClick={() => setActiveRenewalTab('expiring')}
                            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeRenewalTab === 'expiring' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            即將到期 (45天)
                            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">{expiringMembers.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveRenewalTab('expired')}
                            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeRenewalTab === 'expired' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            已過期 (喚醒)
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{expiredMembers.length}</span>
                        </button>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50">
                    {activeRenewalTab === 'expiring' ? (
                        <>
                            <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-sm text-yellow-800 border border-yellow-100 shadow-sm">
                                <p className="font-bold mb-1 flex items-center gap-2"><AlertCircle size={14}/> 說明：</p>
                                <p>列表顯示即將在 40~50 天內到期的有效會員。請發送續約通知提醒繳費。</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-4 bg-gray-50">會員姓名</th>
                                            <th className="p-4 bg-gray-50">到期日</th>
                                            <th className="p-4 bg-gray-50">剩餘天數</th>
                                            <th className="p-4 bg-gray-50">Email</th>
                                            <th className="p-4 bg-gray-50 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {expiringMembers.map(m => {
                                            const daysLeft = Math.ceil((new Date(m.membership_expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                            const isTarget = daysLeft === 45;
                                            const isSent = renewalSent.includes(String(m.id));
                                            const isSending = sendingRenewal.includes(String(m.id));

                                            return (
                                                <tr key={m.id} className={`hover:bg-gray-50 ${isTarget ? 'bg-yellow-50/50' : ''}`}>
                                                    <td className="p-4 font-bold">{m.name}</td>
                                                    <td className="p-4 font-mono">{m.membership_expiry_date}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isTarget ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                                                            {daysLeft} 天
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-500 text-xs">{m.email || <span className="text-red-400">未填寫</span>}</td>
                                                    <td className="p-4 text-right">
                                                        {isSent ? (
                                                            <span className="text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={16} /> 已發送</span>
                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleSendRenewalNotice(m, 'renewal')} 
                                                                disabled={isSending || !m.email}
                                                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 ml-auto shadow-sm"
                                                            >
                                                                {isSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} 
                                                                發送通知
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {expiringMembers.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">目前沒有符合 40~50 天內到期的會員</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 border border-gray-200 shadow-sm">
                                <p className="font-bold mb-1 flex items-center gap-2"><RefreshCcw size={14}/> 說明：</p>
                                <p>列表顯示會籍已過期的會員。您可以發送喚醒通知，邀請他們重新加入。</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-4 bg-gray-50">會員姓名</th>
                                            <th className="p-4 bg-gray-50">到期日</th>
                                            <th className="p-4 bg-gray-50">過期天數</th>
                                            <th className="p-4 bg-gray-50">Email</th>
                                            <th className="p-4 bg-gray-50 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {expiredMembers.map(m => {
                                            const daysOverdue = Math.abs(Math.ceil((new Date(m.membership_expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                            const isSent = renewalSent.includes(String(m.id));
                                            const isSending = sendingRenewal.includes(String(m.id));

                                            return (
                                                <tr key={m.id} className="hover:bg-gray-50">
                                                    <td className="p-4 font-bold">{m.name}</td>
                                                    <td className="p-4 font-mono text-red-500">{m.membership_expiry_date}</td>
                                                    <td className="p-4">
                                                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                                            已過期 {daysOverdue} 天
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-500 text-xs">{m.email || <span className="text-red-400">未填寫</span>}</td>
                                                    <td className="p-4 text-right">
                                                        {isSent ? (
                                                            <span className="text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={16} /> 已發送</span>
                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleSendRenewalNotice(m, 'wakeup')} 
                                                                disabled={isSending || !m.email}
                                                                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-900 disabled:opacity-50 flex items-center gap-1 ml-auto shadow-sm"
                                                            >
                                                                {isSending ? <Loader2 className="animate-spin" size={14} /> : <BellRing size={14} />} 
                                                                發送喚醒通知
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {expiredMembers.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">目前沒有已過期的會員</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
         </div>
       )}

       {isFormOpen && (
       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-bold mb-6">{editingId ? '編輯會員' : '新增會員'}</h2>
               <form onSubmit={handleSave} className="space-y-6">
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">基本資料</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-bold mb-1">會員編號 (自動產生)</label><input type="text" value={formData.member_no} readOnly className="w-full p-2 border rounded outline-none bg-gray-100 text-gray-500 cursor-not-allowed"/></div>
                           <div><label className="block text-sm font-bold mb-1">姓名</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">身分證字號</label><input type="text" value={formData.id_number || ''} onChange={e => setFormData({...formData, id_number: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">生日</label><input type="date" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">引薦人</label><input type="text" value={formData.referrer || ''} onChange={e => setFormData({...formData, referrer: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                       </div>
                   </div>
                   
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">聯絡方式</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-bold mb-1">手機</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">信箱</label><input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">室內電話</label><input type="text" value={formData.home_phone || ''} onChange={e => setFormData({...formData, home_phone: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div className="md:col-span-2"><label className="block text-sm font-bold mb-1">通訊地址</label><input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                       </div>
                   </div>
                   
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">事業資料</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-bold mb-1">產業分類</label><select value={formData.industry_category} onChange={e => setFormData({...formData, industry_category: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500">{IndustryCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                           <div><label className="block text-sm font-bold mb-1">品牌名稱</label><input type="text" value={formData.brand_name || ''} onChange={e => setFormData({...formData, brand_name: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">公司抬頭</label><input type="text" value={formData.company_title || ''} onChange={e => setFormData({...formData, company_title: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">統一編號</label><input type="text" value={formData.tax_id || ''} onChange={e => setFormData({...formData, tax_id: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">職稱</label><input type="text" value={formData.job_title || ''} onChange={e => setFormData({...formData, job_title: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">公司網站</label><input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div className="md:col-span-2"><label className="block text-sm font-bold mb-1">主要服務/產品</label><textarea rows={3} value={formData.main_service || ''} onChange={e => setFormData({...formData, main_service: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
                       </div>
                   </div>
                   
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">會籍資料</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-bold mb-1">會籍到期日</label><input type="date" value={formData.membership_expiry_date || ''} onChange={e => setFormData({...formData, membership_expiry_date: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">狀態</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"><option value="active">有效</option><option value="inactive">失效</option></select></div>
                           <div className="md:col-span-2"><label className="block text-sm font-bold mb-1">備註</label><textarea rows={2} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
                       </div>
                   </div>

                   {/* 會籍繳費紀錄區塊 */}
                   <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                       <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
                           <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2"><History size={16} /> 會籍繳費紀錄</h3>
                           <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">總金額: NT$ {totalPaymentAmount.toLocaleString()}</span>
                       </div>
                       
                       {/* 列表 */}
                       <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                           {paymentRecords.length > 0 ? (
                               <table className="w-full text-xs text-left">
                                   <thead className="text-gray-500 bg-blue-50/50 sticky top-0">
                                       <tr>
                                           <th className="p-2">繳費日期</th>
                                           <th className="p-2">金額</th>
                                           <th className="p-2">備註</th>
                                           <th className="p-2 text-right">操作</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {paymentRecords.map((record) => (
                                           <tr key={record.id} className="border-b border-blue-50 last:border-0 hover:bg-blue-50/80">
                                               <td className="p-2">{record.date}</td>
                                               <td className="p-2 font-mono">NT$ {record.amount}</td>
                                               <td className="p-2 text-gray-500">{record.note || '-'}</td>
                                               <td className="p-2 text-right">
                                                   <button type="button" onClick={() => handleDeletePaymentRecord(record.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           ) : (
                               <p className="text-center text-gray-400 text-xs py-4">目前尚無繳費紀錄</p>
                           )}
                       </div>

                       {/* 新增表單 */}
                       <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-wrap gap-2 items-end">
                           <div className="flex-1 min-w-[120px]">
                               <label className="block text-[10px] font-bold text-gray-500 mb-1">日期</label>
                               <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="w-full p-1.5 border rounded text-xs"/>
                           </div>
                           <div className="w-24">
                               <label className="block text-[10px] font-bold text-gray-500 mb-1">金額</label>
                               <input type="number" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} className="w-full p-1.5 border rounded text-xs"/>
                           </div>
                           <div className="flex-[2] min-w-[150px]">
                               <label className="block text-[10px] font-bold text-gray-500 mb-1">備註 (選填)</label>
                               <input type="text" value={newPayment.note} onChange={e => setNewPayment({...newPayment, note: e.target.value})} className="w-full p-1.5 border rounded text-xs" placeholder="例：現金/匯款"/>
                           </div>
                           <button type="button" onClick={handleAddPaymentRecord} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 h-[30px] mb-[1px]">
                               <Plus size={14} /> 新增
                           </button>
                       </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
                       <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-bold hover:bg-gray-200">取消</button>
                       <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200">儲存資料</button>
                   </div>
               </form>
           </div>
       </div>
       )}
       <div className="bg-white p-6 rounded-2xl border border-gray-100"><div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="搜尋會員 (姓名、編號、電話)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"/></div><div className="overflow-x-auto"><table className="w-full text-left border-collapse text-sm"><thead><tr className="bg-gray-50 text-gray-500"><th className="p-3">編號</th><th className="p-3">姓名</th><th className="p-3">品牌/職稱</th><th className="p-3">效期</th><th className="p-3">狀態</th><th className="p-3">操作</th></tr></thead><tbody className="divide-y">{filtered.map(m => { const isExpired = m.membership_expiry_date && m.membership_expiry_date < new Date().toISOString().slice(0, 10); const displayStatus = (m.status === 'active' && !isExpired) ? 'active' : 'inactive'; return (<tr key={m.id} className="hover:bg-gray-50"><td className="p-3 font-mono text-gray-500">{(m.member_no || '').toString().padStart(5, '0')}</td><td className="p-3 font-bold">{m.name}</td><td className="p-3"><div>{m.brand_name || m.company}</div><div className="text-xs text-gray-400">{m.job_title}</div></td><td className="p-3">{m.membership_expiry_date || '-'}</td><td className="p-3">{displayStatus === 'active' ? (<span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">有效</span>) : (<span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs font-bold">失效</span>)}</td><td className="p-3 flex gap-2"><button onClick={() => handleEdit(m)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button><button onClick={() => {if(confirm('確定刪除此會員？')) onDelete(m.id)}} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button></td></tr>); })} {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">無相符資料</td></tr>}</tbody></table></div></div>
    </div>
  );
};

const CouponManager: React.FC<{
  coupons: Coupon[];
  activities: Activity[];
  memberActivities: MemberActivity[];
  members: Member[];
  onGenerate?: (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => void;
}> = ({ coupons, activities, memberActivities, members, onGenerate }) => {
  const [amount, setAmount] = useState(100);
  const [actId, setActId] = useState('');
  const [target, setTarget] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const allActs = [...activities, ...memberActivities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleGenerate = () => {
     if(!onGenerate) return;
     if(!actId) { alert('請選擇活動'); return; }
     setIsGenerating(true);
     const memberIds = target === 'all' ? members.filter(m => m.status === 'active').map(m => String(m.id)) : [target];
     onGenerate(actId, amount, memberIds, false);
     setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">折扣券管理</h1>
       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">產生折扣券</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div><label className="block text-sm font-bold mb-1">選擇活動</label><select className="w-full p-2 border rounded" value={actId} onChange={e=>setActId(e.target.value)}><option value="">請選擇...</option>{allActs.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
             <div><label className="block text-sm font-bold mb-1">折扣金額</label><input type="number" className="w-full p-2 border rounded" value={amount} onChange={e=>setAmount(Number(e.target.value))} /></div>
             <div><label className="block text-sm font-bold mb-1">發送對象</label><select className="w-full p-2 border rounded" value={target} onChange={e=>setTarget(e.target.value)}><option value="all">全體有效會員</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
             <div className="flex items-end"><button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-red-600 text-white p-2 rounded font-bold hover:bg-red-700">{isGenerating ? '處理中' : '產生折扣券'}</button></div>
          </div>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-gray-100">
         <h3 className="font-bold text-lg mb-4">折扣券列表 ({coupons.length})</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead><tr className="bg-gray-50"><th className="p-3">代碼</th><th className="p-3">活動</th><th className="p-3">金額</th><th className="p-3">狀態</th></tr></thead>
               <tbody>
                  {coupons.slice(0, 50).map(c => {
                    const act = allActs.find(a => String(a.id) === String(c.activity_id));
                    return (
                      <tr key={c.id} className="border-b">
                         <td className="p-3 font-mono">{c.code}</td>
                         <td className="p-3">{act?.title || c.activity_id}</td>
                         <td className="p-3">{c.discount_amount}</td>
                         <td className="p-3">{c.is_used ? '已使用' : '未使用'}</td>
                      </tr>
                    )
                  })}
               </tbody>
            </table>
         </div>
       </div>
    </div>
  );
};

const UserManager: React.FC<{
  users: AdminUser[];
  onAdd: (u: AdminUser) => void;
  onDelete: (id: string) => void;
}> = ({ users, onAdd, onDelete }) => {
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: UserRole.STAFF });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...newUser, id: crypto.randomUUID() } as any);
    setNewUser({ name: '', email: '', phone: '', role: UserRole.STAFF });
  };

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">帳號權限管理</h1>
       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 flex gap-4 items-end">
          <div><label className="block text-xs font-bold mb-1">姓名</label><input required className="border rounded p-2 text-sm" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1">Email (登入用)</label><input required type="email" className="border rounded p-2 text-sm" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1">權限</label><select className="border rounded p-2 text-sm" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value as UserRole})}>{Object.values(UserRole).map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <button className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">新增管理員</button>
       </form>
       <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead><tr className="bg-gray-50"><th className="p-4">姓名</th><th className="p-4">權限</th><th className="p-4">操作</th></tr></thead>
             <tbody>
                {users.map(u => (
                   <tr key={u.id} className="border-t">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4">{u.role}</td>
                      <td className="p-4"><button onClick={()=>onDelete(u.id)} className="text-red-600 hover:underline">刪除</button></td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { currentUser, onLogout, memberApplications } = props;
  const pendingCount = memberApplications.filter(m => m.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={currentUser} onLogout={onLogout} pendingCount={pendingCount} />
      <main className="flex-1 h-screen overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<DashboardHome {...props} />} />
          
          <Route path="/check-in" element={<ActivityCheckInManager type="general" activities={props.activities} registrations={props.registrations} onUpdateReg={props.onUpdateRegistration} />} />
          <Route path="/member-check-in" element={<ActivityCheckInManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onUpdateReg={props.onUpdateMemberRegistration} />} />
          
          <Route path="/activities" element={<ActivityManager type="general" activities={props.activities} registrations={props.registrations} onAdd={props.onAddActivity} onUpdate={props.onUpdateActivity} onDelete={props.onDeleteActivity} onUpdateReg={props.onUpdateRegistration} onDeleteReg={props.onDeleteRegistration} onUploadImage={props.onUploadImage} />} />
          <Route path="/member-activities" element={<ActivityManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onAdd={props.onAddMemberActivity} onUpdate={props.onUpdateMemberActivity} onDelete={props.onDeleteMemberActivity} onUpdateReg={props.onUpdateMemberRegistration} onDeleteReg={props.onDeleteMemberRegistration} onUploadImage={props.onUploadImage} members={props.members} />} />
          
          <Route path="/members" element={<MemberManager members={props.members} onAdd={props.onAddMember} onUpdate={props.onUpdateMember} onDelete={props.onDeleteMember} onImport={props.onAddMembers!} />} />
          
          <Route path="/member-applications" element={<MemberApplicationManager applications={props.memberApplications} onApprove={props.onApproveMemberApplication} onDelete={props.onDeleteMemberApplication} />} />
          
          <Route path="/coupons" element={<CouponManager coupons={props.coupons} activities={props.activities} memberActivities={props.memberActivities} members={props.members} onGenerate={props.onGenerateCoupons} />} />
          
          <Route path="/users" element={<UserManager users={props.users} onAdd={props.onAddUser} onDelete={props.onDeleteUser} />} />
          
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;