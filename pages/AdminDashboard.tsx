
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, ChevronRight, Search, FileDown, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, UserPlus, DollarSign, TrendingUp, BarChart3, Mail, User, Clock, Image as ImageIcon, UploadCloud, Loader2, Smartphone, Building2, Briefcase, Globe, FileUp, Download, ClipboardList, CheckSquare, AlertCircle, RotateCcw, MapPin, Filter, X, Eye, EyeOff, Ticket, Cake, CreditCard, Home, Hash, Crown, ArrowLeft, RefreshCcw, Ban, UserCheck, ExternalLink } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { Activity, MemberActivity, Registration, MemberRegistration, ActivityType, AdminUser, UserRole, Member, AttendanceRecord, AttendanceStatus, Coupon, IndustryCategories, PaymentStatus, MemberApplication } from '../types';

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

// 獨立的輸入元件 (保留)
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
  const canAccessActivities = user.role === UserRole.MANAGER || user.role === UserRole.SUPER_ADMIN;
  const canAccessUsers = user.role === UserRole.SUPER_ADMIN;
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
        
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">一般業務</div>
        <Link to="/admin/check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><CheckSquare size={20} /><span>一般活動報到</span></Link>
        {canAccessActivities && (<Link to="/admin/activities" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/activities') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Calendar size={20} /><span>一般活動管理</span></Link>)}

        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">會員業務</div>
        <Link to="/admin/member-check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Crown size={20} /><span>會員活動報到</span></Link>
        {canAccessActivities && (<Link to="/admin/member-activities" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-activities') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Calendar size={20} /><span>會員活動管理</span></Link>)}
        
        {canAccessActivities && (<>
            <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">系統管理</div>
            <Link to="/admin/members" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/members') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Building2 size={20} /><span>會員資料庫</span></Link>
            {/* 新增申請管理連結 */}
            <Link to="/admin/member-applications" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/member-applications') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
              <UserPlus size={20} />
              <div className="flex-grow flex justify-between items-center">
                 <span>新會員申請管理</span>
                 {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
              </div>
            </Link>
            <Link to="/admin/coupons" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/coupons') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Ticket size={20} /><span>折扣券管理</span></Link>
        </>)}
        {canAccessUsers && (<Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/users') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Shield size={20} /><span>帳號權限</span></Link>)}
      </nav>
      <div className="p-4 border-t border-gray-800"><button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600/10 hover:text-red-500 transition-colors"><LogOut size={20} /><span>登出</span></button></div>
    </div>
  );
};

interface DashboardHomeProps {
  members: Member[];
  activities: Activity[];
  memberActivities: MemberActivity[];
  registrations: Registration[];
  memberRegistrations: MemberRegistration[];
  memberApplications: MemberApplication[];
}

// 儀表板首頁元件
const DashboardHome: React.FC<DashboardHomeProps> = ({ members, activities, memberActivities, registrations, memberRegistrations, memberApplications }) => {
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
    
    // 待審核會員數
    const pendingApplications = memberApplications.length;

    // 將報名資料與活動標題合併 (最新5筆)
    const recentRegistrations = [
        ...registrations.map(r => {
           const act = activities.find(a => String(a.id) === String(r.activityId));
           return { ...r, activity_title: act?.title || '未知活動 (一般)' };
        }), 
        ...memberRegistrations.map(r => {
           const act = memberActivities.find(a => String(a.id) === String(r.activityId));
           return { ...r, activity_title: act?.title || '未知活動 (會員)' };
        })
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // --- 計算個別活動成效 ---
    const calculateActivityStats = (act: Activity | MemberActivity, regs: Registration[] | MemberRegistration[]) => {
       const actRegs = regs.filter(r => String(r.activityId) === String(act.id));
       const regCount = actRegs.length;
       const checkInCount = actRegs.filter(r => r.check_in_status).length;
       const revenue = actRegs.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
       return {
          id: act.id,
          title: act.title,
          date: act.date,
          status: act.status || 'active',
          regCount,
          checkInCount,
          revenue
       };
    };

    const generalStats = activities.map(a => ({...calculateActivityStats(a, registrations), category: '一般'}));
    const memberStats = memberActivities.map(a => ({...calculateActivityStats(a, memberRegistrations), category: '會員'}));
    
    // 合併並依日期排序 (新 -> 舊)
    const allActivityStats = [...generalStats, ...memberStats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { activeMembers, totalRevenue, upcomingActivitiesCount, recentRegistrations, allActivityStats, pendingApplications };
  }, [members, activities, memberActivities, registrations, memberRegistrations, memberApplications]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系統概況</h1>
        <p className="text-gray-500">歡迎回到管理後台，以下是目前的營運數據。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users size={20} /></div>
            <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">有效</span>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">會員總數</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeMembers}<span className="text-sm text-gray-400 font-normal ml-1">人</span></p>
        </div>
        
        {/* 新增：待審核申請卡片 */}
        <Link to="/admin/member-applications" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><UserPlus size={20} /></div>
            {stats.pendingApplications > 0 && <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded animate-pulse">待審核</span>}
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider group-hover:text-red-600 transition-colors">新會員申請</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApplications}<span className="text-sm text-gray-400 font-normal ml-1">筆</span></p>
        </Link>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">累積營收</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">NT$ {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><TrendingUp size={20} /></div>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">總報名人次</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{registrations.length + memberRegistrations.length}<span className="text-sm text-gray-400 font-normal ml-1">人次</span></p>
        </div>
      </div>

      {/* 新增：各活動營運成效列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
           <h3 className="text-lg font-bold text-gray-900">各活動營運成效</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4">活動名稱 / 日期</th>
                    <th className="p-4">類別</th>
                    <th className="p-4 text-center">報名人數</th>
                    <th className="p-4 text-center">出席人數</th>
                    <th className="p-4 text-right">累積營收</th>
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
                       <td className="p-4 text-right font-mono font-bold text-gray-700">
                          NT$ {act.revenue.toLocaleString()}
                       </td>
                       <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${act.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                             {act.status === 'active' ? '進行中' : '已結束'}
                          </span>
                       </td>
                    </tr>
                 ))}
                 {stats.allActivityStats.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-400">尚無活動資料</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

// ... (MemberApplicationManager, ActivityManager, ActivityCheckInManager, MemberManager, CouponManager - No Changes) ...
// (Re-declaring unchanged components to ensure file completeness for XML replacement)
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

      {/* 列表 */}
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

      {/* 詳細資料 Modal */}
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
               <button 
                 onClick={() => { onDelete(selectedApp.id); setSelectedApp(null); }}
                 className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
               >
                 拒絕 / 刪除
               </button>
               <button 
                 onClick={() => { onApprove(selectedApp); setSelectedApp(null); }}
                 className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
               >
                 <CheckCircle size={20} />
                 確認無誤，核准並加入會員
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

// ActivityManager (Code identical to previous, just need to render it)
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
    return name.toLowerCase().includes(term) || 
           (r.phone && r.phone.includes(term)) ||
           (r.email && r.email.toLowerCase().includes(term)) || 
           (r.merchant_order_no && r.merchant_order_no.includes(term));
  });

  const handleEdit = (act: any) => {
    setEditingId(act.id);
    setFormData({ ...act });
    setView('edit');
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      type: type === 'general' ? ActivityType.GATHERING : ActivityType.GATHERING,
      title: '', date: '', time: '', location: '', price: 0, 
      picture: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1', description: '', status: 'active'
    });
    setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdate(formData);
    else onAdd(formData);
    setView('list');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await onUploadImage(e.target.files[0]);
      if (url) setFormData({ ...formData, picture: url });
    }
  };

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
     if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) {
        onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID });
        return;
     }
     if (reg.payment_status === PaymentStatus.PAID) {
        if (confirm("【已付款】訂單操作：\n\n按「確定」將狀態標記為【已退費】\n按「取消」詢問是否回復為【待付款】")) {
             onUpdateReg({ ...reg, payment_status: PaymentStatus.REFUNDED });
        } else {
             if (confirm("是否要將此訂單回復為【待付款】？")) {
                onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING });
             }
        }
        return;
     }
     if (reg.payment_status === PaymentStatus.REFUNDED) {
        if (confirm("是否將此【已退費】訂單重新開啟為【待付款】？")) {
           onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING });
        }
        return;
     }
  };

  if (view === 'registrations' && currentActivity) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900"><ChevronRight className="rotate-180" size={20} /> 返回列表</button>
          <div className="flex gap-2">
             <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"><FileDown size={16} /> 匯出名單</button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-2">{currentActivity.title}</h2>
          <div className="flex gap-4 text-sm text-gray-500 mb-6">
             <span>總報名: {currentRegistrations.length} 人</span>
             <span>已付款: {currentRegistrations.filter(r => r.payment_status === PaymentStatus.PAID).length} 人</span>
             <span>已退費: {currentRegistrations.filter(r => r.payment_status === 'refunded').length} 人</span>
             <span>已報到: {currentRegistrations.filter(r => r.check_in_status).length} 人</span>
          </div>

          <div className="flex gap-2 mb-4">
             <div className="relative flex-grow">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input type="text" placeholder="搜尋姓名、電話、金流單號..." value={regSearch} onChange={e => setRegSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 rounded-tl-lg">姓名/資訊</th>
                  <th className="p-4">報到狀態</th>
                  <th className="p-4">付款狀態 (點擊切換)</th>
                  <th className="p-4">金額</th>
                  <th className="p-4 rounded-tr-lg text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRegs.map((reg: any) => (
                  <tr key={reg.id} className={`hover:bg-gray-50 ${reg.payment_status === 'refunded' ? 'bg-gray-50' : ''}`}>
                    <td className="p-4">
                      <div className={`font-bold flex items-center gap-2 ${reg.payment_status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {reg.name || reg.member_name}
                        {reg.payment_status === 'refunded' && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold no-underline">已退費</span>}
                      </div>
                      <div className="text-xs text-gray-400">{reg.phone}</div>
                      {reg.merchant_order_no && <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{reg.merchant_order_no}</div>}
                    </td>
                    <td className="p-4">
                      <button onClick={() => onUpdateReg({...reg, check_in_status: !reg.check_in_status})} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${reg.check_in_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {reg.check_in_status ? <CheckCircle size={14}/> : <XCircle size={14}/>} {reg.check_in_status ? '已報到' : '未報到'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handlePaymentStatusToggle(reg)} 
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          reg.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                          (reg.payment_status === 'refunded' ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')
                        }`}
                        title={reg.payment_status === PaymentStatus.PAID ? '點擊進行退費' : '點擊變更狀態'}
                      >
                         {reg.payment_status === PaymentStatus.PAID ? '已付款' : (reg.payment_status === 'refunded' ? '已退費' : '待付款')}
                         {reg.payment_status === PaymentStatus.PAID && <RefreshCcw size={10} className="ml-1 opacity-50"/>}
                         {reg.payment_status === 'refunded' && <Ban size={10} className="ml-1 opacity-50"/>}
                      </button>
                    </td>
                    <td className="p-4">
                      <PaidAmountInput value={reg.paid_amount} onSave={(val) => onUpdateReg({...reg, paid_amount: val})} />
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => { if(confirm('確定刪除此報名資料？')) onDeleteReg(reg.id); }} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                    </td>
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
         <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><ChevronRight className="rotate-180" size={20} /></button>
            <h2 className="text-2xl font-bold">{editingId ? '編輯活動' : '新增活動'}</h2>
         </div>
         <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div><label className="block text-sm font-bold text-gray-700 mb-2">活動標題</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">活動類型</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500">{Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">日期</label><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">時間</label><input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">地點</label><input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">費用</label><input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"/></div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-gray-700 mb-2">活動封面圖片</label>
                 <div className="flex items-center gap-4">
                    <img src={formData.picture} alt="Preview" className="w-32 h-20 object-cover rounded-lg border bg-gray-50"/>
                    <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2"><UploadCloud size={18} /> 上傳圖片<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>
                 </div>
               </div>
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
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">{type === 'member' ? '會員' : '一般'}活動管理</h1>
         <button onClick={handleCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-200"><Plus size={18} /> 新增活動</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(act => (
            <div key={act.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
               <div className="h-40 overflow-hidden relative">
                  <img src={act.picture} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold ${act.status === 'closed' ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'}`}>{act.status === 'closed' ? '已結束' : '報名中'}</div>
               </div>
               <div className="p-5">
                  <div className="mb-4">
                     <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{act.type}</span>
                     <h3 className="text-lg font-bold mt-2 line-clamp-1">{act.title}</h3>
                     <p className="text-sm text-gray-500 mt-1">{act.date} | {act.location}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                     <button onClick={() => { setEditingId(act.id); setView('registrations'); }} className="text-sm font-bold text-gray-600 hover:text-red-600 flex items-center gap-1"><Users size={16}/> 名單 ({registrations.filter(r => String(r.activityId) === String(act.id)).length})</button>
                     <div className="flex gap-2">
                        <button onClick={() => handleEdit(act)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50"><Edit size={16} /></button>
                        <button onClick={() => { if(confirm('確定刪除？')) onDelete(act.id); }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

// ActivityCheckInManager (No changes, omitted for brevity)
const ActivityCheckInManager: React.FC<{
  type: 'general' | 'member';
  activities: (Activity | MemberActivity)[];
  registrations: (Registration | MemberRegistration)[];
  onUpdateReg: (reg: any) => void;
}> = ({ type, activities, registrations, onUpdateReg }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 活動列表檢視
  if (!selectedActivityId) {
    // 排序：日期越近越上面
    const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{type === 'member' ? '會員' : '一般'}活動報到</h1>
        <p className="text-gray-500">請選擇要進行報到的活動：</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedActivities.map(act => {
            const regCount = registrations.filter(r => String(r.activityId) === String(act.id)).length;
            const checkedInCount = registrations.filter(r => String(r.activityId) === String(act.id) && r.check_in_status).length;
            
            return (
              <button 
                key={act.id} 
                onClick={() => setSelectedActivityId(act.id)}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-red-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm">
                      {new Date(act.date).getDate()}
                      <span className="text-[10px] ml-0.5">日</span>
                   </div>
                   <span className={`px-2 py-1 rounded text-xs font-bold ${act.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {act.status === 'active' ? '進行中' : '已結束'}
                   </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">{act.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{act.date} {act.time}</p>
                
                <div className="flex items-center justify-between text-sm border-t pt-4">
                   <span className="text-gray-500 font-medium">報名 {regCount} 人</span>
                   <span className="text-red-600 font-bold">已到 {checkedInCount} 人</span>
                </div>
              </button>
            );
          })}
          {sortedActivities.length === 0 && <div className="text-gray-400 p-10 text-center col-span-full">目前無活動資料</div>}
        </div>
      </div>
    );
  }

  // 2. 報到名單檢視
  const currentActivity = activities.find(a => a.id === selectedActivityId);
  const currentRegistrations = registrations.filter(r => String(r.activityId) === String(selectedActivityId));
  
  const filteredRegs = currentRegistrations.filter((r: any) => {
    const term = searchTerm.toLowerCase();
    const name = r.name || r.member_name || '';
    return name.toLowerCase().includes(term) || 
           (r.phone && r.phone.includes(term)) ||
           (r.merchant_order_no && r.merchant_order_no.includes(term));
  });

  const handlePaymentStatusToggle = (reg: any) => {
     if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) {
        onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID });
        return;
     }
     if (reg.payment_status === PaymentStatus.PAID) {
        if (confirm("【已付款】訂單操作：\n\n按「確定」將狀態標記為【已退費】\n按「取消」詢問是否回復為【待付款】")) {
             onUpdateReg({ ...reg, payment_status: PaymentStatus.REFUNDED });
        } else {
             if (confirm("是否要將此訂單回復為【待付款】？")) {
                onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING });
             }
        }
        return;
     }
     if (reg.payment_status === PaymentStatus.REFUNDED) {
        if (confirm("是否將此【已退費】訂單重新開啟為【待付款】？")) {
           onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING });
        }
        return;
     }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
       <div className="flex items-center gap-4">
          <button onClick={() => setSelectedActivityId(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-2xl font-bold">{currentActivity?.title}</h2>
            <p className="text-sm text-gray-500">報到管理列表</p>
          </div>
       </div>

       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="搜尋姓名、手機末三碼、單號..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 focus:bg-white transition-all" 
                  autoFocus
                />
             </div>
             <div className="flex gap-4 text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                <span>總計: {currentRegistrations.length}</span>
                <span className="text-green-600">已到: {currentRegistrations.filter(r => r.check_in_status).length}</span>
                <span className="text-gray-400">未到: {currentRegistrations.length - currentRegistrations.filter(r => r.check_in_status).length}</span>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 rounded-tl-lg">參加者</th>
                      <th className="p-4">報到操作 (點擊切換)</th>
                      <th className="p-4">付款狀態</th>
                      <th className="p-4 rounded-tr-lg">金額</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredRegs.map((reg: any) => (
                      <tr key={reg.id} className={`hover:bg-gray-50 transition-colors ${reg.check_in_status ? 'bg-green-50/30' : ''} ${reg.payment_status === 'refunded' ? 'bg-gray-50' : ''}`}>
                         <td className="p-4">
                            <div className={`font-bold text-lg flex items-center gap-2 ${reg.payment_status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                               {reg.name || reg.member_name}
                               {reg.payment_status === 'refunded' && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold no-underline">已退費</span>}
                            </div>
                            <div className="text-sm text-gray-500">{reg.phone}</div>
                         </td>
                         <td className="p-4">
                            <button 
                              onClick={() => onUpdateReg({...reg, check_in_status: !reg.check_in_status})} 
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${reg.check_in_status ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                            >
                               {reg.check_in_status ? <CheckCircle size={20}/> : <XCircle size={20}/>} 
                               {reg.check_in_status ? '已報到' : '未報到'}
                            </button>
                         </td>
                         <td className="p-4">
                            <button 
                              onClick={() => handlePaymentStatusToggle(reg)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                reg.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                                (reg.payment_status === 'refunded' ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')
                              }`}
                            >
                               {reg.payment_status === PaymentStatus.PAID ? '已付款' : (reg.payment_status === 'refunded' ? '已退費' : '待付款')}
                               {reg.payment_status === PaymentStatus.PAID && <RefreshCcw size={10} className="ml-1 opacity-50"/>}
                               {reg.payment_status === 'refunded' && <Ban size={10} className="ml-1 opacity-50"/>}
                            </button>
                         </td>
                         <td className="p-4 font-mono text-gray-600">
                            NT$ {reg.paid_amount}
                         </td>
                      </tr>
                   ))}
                   {filteredRegs.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-400">查無資料，請嘗試其他關鍵字</td></tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

// MemberManager (Same as before)
const MemberManager: React.FC<{ members: Member[]; onAdd: (m: Member) => void; onUpdate: (m: Member) => void; onDelete: (id: string | number) => void; onImport: (ms: Member[]) => void }> = ({ members, onAdd, onUpdate, onDelete, onImport }) => {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 計算會員統計數據
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let active = 0;
    let inactive = 0;
    members.forEach(m => {
       const isExpired = m.membership_expiry_date && m.membership_expiry_date < today;
       if (m.status === 'active' && !isExpired) {
         active++;
       } else {
         inactive++;
       }
    });
    return { total: members.length, active, inactive };
  }, [members]);

  const filtered = members.filter(m => m.name.includes(searchTerm) || m.member_no.includes(searchTerm) || m.phone?.includes(searchTerm));

  const handleEdit = (m: Member) => { 
      setEditingId(m.id); 
      setFormData({
          ...m,
          member_no: (m.member_no || '').toString().padStart(5, '0')
      }); 
      setIsFormOpen(true); 
  };

  const handleAdd = () => { 
    setEditingId(null); 
    const maxNo = members.reduce((max, m) => {
        const num = parseInt(m.member_no);
        return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextNo = (maxNo + 1).toString().padStart(5, '0');
    setFormData({ 
      member_no: nextNo, 
      name: '', 
      status: 'active', 
      industry_category: '其他' 
    }); 
    setIsFormOpen(true); 
  };
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); if (editingId) onUpdate(formData); else onAdd(formData); setIsFormOpen(false); };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const newMembers = data.map((row: any) => ({
         id: crypto.randomUUID(),
         member_no: String(row['會員編號'] || ''),
         name: row['姓名'],
         industry_category: row['產業分類'] || '其他',
         brand_name: row['品牌名稱'] || row['公司名稱'],
         phone: String(row['手機'] || ''),
         status: 'active' as const
      }));
      onImport(newMembers);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const exportData = members.map(m => ({
      '會員編號': (m.member_no || '').toString().padStart(5, '0'),
      '姓名': m.name,
      '狀態': (m.status === 'active' && (!m.membership_expiry_date || m.membership_expiry_date >= new Date().toISOString().slice(0, 10))) ? '有效' : '失效',
      '會籍到期日': m.membership_expiry_date,
      '手機': m.phone,
      '信箱': m.email,
      '產業分類': m.industry_category,
      '品牌名稱': m.brand_name,
      '公司抬頭': m.company_title,
      '統一編號': m.tax_id,
      '職稱': m.job_title,
      '主要服務': m.main_service,
      '公司網站': m.website,
      '通訊地址': m.address,
      '備註': m.notes
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "會員資料");
    XLSX.writeFile(wb, `會員名單_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">會員資料庫</h1>
          <div className="flex gap-3">
             <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"><FileDown size={18} /> 匯出 Excel</button>
             <label className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 cursor-pointer"><FileUp size={18} /> 匯入 CSV<input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileUpload}/></label>
             <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={18} /> 新增會員</button>
          </div>
       </div>

       {/* 統計數據區塊 */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
             <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">名單總數</p>
               <p className="text-3xl font-bold text-gray-900">{stats.total}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p>
             </div>
             <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center"><Users size={24}/></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
             <div>
               <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">有效會員</p>
               <p className="text-3xl font-bold text-gray-900">{stats.active}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p>
             </div>
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle size={24}/></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">失效會員</p>
               <p className="text-3xl font-bold text-gray-900">{stats.inactive}<span className="text-sm font-normal text-gray-400 ml-1">人</span></p>
             </div>
             <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center"><XCircle size={24}/></div>
          </div>
       </div>

       {isFormOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-bold mb-6">{editingId ? '編輯會員' : '新增會員'}</h2>
               <form onSubmit={handleSave} className="space-y-6">
                  {/* ... (同原 MemberManager 表單內容，省略以保持精簡) ... */}
                  {/* 基本資料 */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">基本資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold mb-1">會員編號 (自動產生)</label>
                            <input 
                              type="text" 
                              value={formData.member_no} 
                              readOnly
                              className="w-full p-2 border rounded outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          <div><label className="block text-sm font-bold mb-1">姓名</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div><label className="block text-sm font-bold mb-1">身分證字號</label><input type="text" value={formData.id_number || ''} onChange={e => setFormData({...formData, id_number: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div><label className="block text-sm font-bold mb-1">生日</label><input type="date" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div><label className="block text-sm font-bold mb-1">引薦人</label><input type="text" value={formData.referrer || ''} onChange={e => setFormData({...formData, referrer: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                      </div>
                  </div>

                  {/* 聯絡方式 */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">聯絡方式</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-bold mb-1">手機</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div><label className="block text-sm font-bold mb-1">信箱</label><input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div><label className="block text-sm font-bold mb-1">室內電話</label><input type="text" value={formData.home_phone || ''} onChange={e => setFormData({...formData, home_phone: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                          <div className="md:col-span-2"><label className="block text-sm font-bold mb-1">通訊地址</label><input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                      </div>
                  </div>

                  {/* 事業資料 */}
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

                  {/* 會籍資料 */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">會籍資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-bold mb-1">會籍到期日</label><input type="date" value={formData.membership_expiry_date || ''} onChange={e => setFormData({...formData, membership_expiry_date: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
                           <div><label className="block text-sm font-bold mb-1">狀態</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"><option value="active">有效</option><option value="inactive">失效</option></select></div>
                           <div className="md:col-span-2"><label className="block text-sm font-bold mb-1">備註</label><textarea rows={2} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
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

       <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="搜尋會員 (姓名、編號、電話)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"/></div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse text-sm">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3">編號</th><th className="p-3">姓名</th><th className="p-3">品牌/職稱</th><th className="p-3">效期</th><th className="p-3">狀態</th><th className="p-3">操作</th></tr></thead>
                <tbody className="divide-y">
                   {filtered.map(m => {
                      const isExpired = m.membership_expiry_date && m.membership_expiry_date < new Date().toISOString().slice(0, 10);
                      const displayStatus = (m.status === 'active' && !isExpired) ? 'active' : 'inactive';
                      
                      return (
                      <tr key={m.id} className="hover:bg-gray-50">
                         {/* 修正：列表顯示時自動補零至 5 碼 */}
                         <td className="p-3 font-mono text-gray-500">{(m.member_no || '').toString().padStart(5, '0')}</td>
                         <td className="p-3 font-bold">{m.name}</td>
                         <td className="p-3">
                            <div>{m.brand_name || m.company}</div>
                            <div className="text-xs text-gray-400">{m.job_title}</div>
                         </td>
                         <td className="p-3">{m.membership_expiry_date || '-'}</td>
                         <td className="p-3">
                            {displayStatus === 'active' ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">有效</span>
                            ) : (
                                <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs font-bold">失效</span>
                            )}
                         </td>
                         <td className="p-3 flex gap-2">
                            <button onClick={() => handleEdit(m)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button>
                            <button onClick={() => {if(confirm('確定刪除此會員？')) onDelete(m.id)}} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                      );
                   })}
                   {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">無相符資料</td></tr>}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

// UserManager (Updated to be Informational Only)
const UserManager: React.FC<{ users: AdminUser[]; onAdd: (u: AdminUser) => void; onDelete: (id: string) => void }> = ({ users, onAdd, onDelete }) => {
   return (
     <div className="space-y-6">
        <h1 className="text-2xl font-bold">帳號權限</h1>
        
        {/* 新增提示區塊，取代舊的表單 */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
           <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><Shield size={24} /></div>
              <div>
                 <h3 className="font-bold text-lg text-blue-800 mb-2">如何新增管理員？</h3>
                 <p className="text-blue-700 text-sm leading-relaxed mb-4">
                    本系統目前採用 <b>Supabase Authentication</b> 進行最高安全層級的身份驗證。<br/>
                    若您需要新增其他可登入後台的人員，請依照以下步驟操作：
                 </p>
                 <ol className="list-decimal list-inside text-sm text-blue-800 font-medium space-y-2 bg-white/50 p-4 rounded-xl">
                    <li>前往 <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-blue-600 inline-flex items-center gap-1">Supabase Dashboard <ExternalLink size={12}/></a></li>
                    <li>進入您的專案，點擊左側選單的 <b>Authentication</b></li>
                    <li>點擊 <b>Add User</b> 按鈕</li>
                    <li>輸入對方的 Email 並設定密碼 (或發送邀請信)</li>
                    <li>勾選 <b>Auto Confirm User</b> (若您希望對方能直接登入)</li>
                 </ol>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">內部人員通訊錄 (僅供參考)</h3>
              <button disabled className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded font-bold cursor-not-allowed">如需修改請洽工程師</button>
           </div>
           <p className="text-sm text-gray-400 mb-4">
              下方列表為系統建檔時的預設人員名單，與實際登入權限無直接關聯。
           </p>
           <div className="space-y-2">
              {users.map(u => (
                 <div key={u.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={20}/></div>
                       <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.role} • {u.phone}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
   );
};

// CouponManager (Same as before)
const CouponManager: React.FC<{ coupons: Coupon[]; activities: Activity[]; members: Member[]; onGenerate: any }> = ({ coupons, activities, members, onGenerate }) => {
   const [actId, setActId] = useState('');
   const [amount, setAmount] = useState(100);
   const [target, setTarget] = useState('all'); // all, active
   
   const handleGen = () => {
      if (!actId) return alert('請選擇活動');
      const targetMembers = members.filter(m => target === 'all' ? true : m.status === 'active');
      if (confirm(`確定產生 ${targetMembers.length} 張折扣券？`)) {
         onGenerate(actId, amount, targetMembers.map(m => String(m.id)), false);
      }
   };

   return (
      <div className="space-y-6">
         <h1 className="text-2xl font-bold">折扣券管理</h1>
         <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold mb-4">批次產生折扣券</h3>
            <div className="flex gap-4 items-end flex-wrap">
               <div><label className="block text-xs font-bold mb-1">選擇活動</label><select value={actId} onChange={e => setActId(e.target.value)} className="p-2 border rounded w-48"><option value="">請選擇...</option>{activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
               <div><label className="block text-xs font-bold mb-1">金額</label><input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="p-2 border rounded w-24"/></div>
               <div><label className="block text-xs font-bold mb-1">對象</label><select value={target} onChange={e => setTarget(e.target.value)} className="p-2 border rounded w-32"><option value="all">所有會員</option><option value="active">僅有效會員</option></select></div>
               <button onClick={handleGen} className="bg-red-600 text-white px-4 py-2 rounded font-bold">產生並發送</button>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold mb-4">發行紀錄</h3>
            <div className="h-64 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead><tr className="sticky top-0 bg-white"><th className="pb-2">代碼</th><th className="pb-2">金額</th><th className="pb-2">狀態</th></tr></thead>
                  <tbody>
                     {coupons.slice(0, 50).map(c => (
                        <tr key={c.id} className="border-t">
                           <td className="py-2 font-mono">{c.code}</td>
                           <td className="py-2">{c.discount_amount}</td>
                           <td className="py-2">{c.is_used ? <span className="text-red-500">已使用</span> : <span className="text-green-500">未使用</span>}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

// Main Dashboard Router
const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar user={props.currentUser} onLogout={props.onLogout} pendingCount={props.memberApplications.length} />
      <div className="flex-grow overflow-auto p-8">
        <Routes>
          <Route path="/" element={<DashboardHome {...props} />} />
          <Route path="/activities" element={<ActivityManager type="general" activities={props.activities} registrations={props.registrations} onAdd={props.onAddActivity} onUpdate={props.onUpdateActivity} onDelete={props.onDeleteActivity} onUpdateReg={props.onUpdateRegistration} onDeleteReg={props.onDeleteRegistration} onUploadImage={props.onUploadImage} />} />
          <Route path="/member-activities" element={<ActivityManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onAdd={props.onAddMemberActivity} onUpdate={props.onUpdateMemberActivity} onDelete={props.onDeleteMemberActivity} onUpdateReg={props.onUpdateMemberRegistration} onDeleteReg={props.onDeleteMemberRegistration} onUploadImage={props.onUploadImage} members={props.members} />} />
          <Route path="/members" element={<MemberManager members={props.members} onAdd={props.onAddMember} onUpdate={props.onUpdateMember} onDelete={props.onDeleteMember} onImport={props.onAddMembers!} />} />
          
          {/* 新增：會員申請管理路由 */}
          <Route path="/member-applications" element={<MemberApplicationManager applications={props.memberApplications} onApprove={props.onApproveMemberApplication} onDelete={props.onDeleteMemberApplication} />} />
          
          <Route path="/users" element={<UserManager users={props.users} onAdd={props.onAddUser} onDelete={props.onDeleteUser} />} />
          <Route path="/coupons" element={<CouponManager coupons={props.coupons} activities={props.activities} members={props.members} onGenerate={props.onGenerateCoupons} />} />
          
          {/* ActivityCheckInManager */}
          <Route path="/check-in" element={<ActivityCheckInManager type="general" activities={props.activities} registrations={props.registrations} onUpdateReg={props.onUpdateRegistration} />} />
          <Route path="/member-check-in" element={<ActivityCheckInManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onUpdateReg={props.onUpdateMemberRegistration} />} />
          
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
