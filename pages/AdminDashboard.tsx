
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, ChevronRight, Search, FileDown, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, UserPlus, DollarSign, TrendingUp, BarChart3, Mail, User, Clock, Image as ImageIcon, UploadCloud, Loader2, Smartphone, Building2, Briefcase, Globe, FileUp, Download, ClipboardList, CheckSquare, AlertCircle, RotateCcw, MapPin, Filter, X, Eye, EyeOff, Ticket, Cake, CreditCard, Home, Hash, Crown, ArrowLeft, RefreshCcw, Ban } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { Activity, MemberActivity, Registration, MemberRegistration, ActivityType, AdminUser, UserRole, Member, AttendanceRecord, AttendanceStatus, Coupon, IndustryCategories, PaymentStatus } from '../types';

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  activities: Activity[];
  memberActivities: MemberActivity[];
  registrations: Registration[];
  memberRegistrations: MemberRegistration[];
  users: AdminUser[];
  members: Member[];
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
const Sidebar: React.FC<{ user: AdminUser; onLogout: () => void }> = ({ user, onLogout }) => {
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
            <Link to="/admin/coupons" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/coupons') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Ticket size={20} /><span>折扣券管理</span></Link>
        </>)}
        {canAccessUsers && (<Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/users') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Shield size={20} /><span>人員權限</span></Link>)}
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
}

// 儀表板首頁元件
const DashboardHome: React.FC<DashboardHomeProps> = ({ members, activities, memberActivities, registrations, memberRegistrations }) => {
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

    return { activeMembers, totalRevenue, upcomingActivitiesCount, recentRegistrations, allActivityStats };
  }, [members, activities, memberActivities, registrations, memberRegistrations]);

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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">累積營收</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">NT$ {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Calendar size={20} /></div>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">即將舉辦</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingActivitiesCount}<span className="text-sm text-gray-400 font-normal ml-1">場活動</span></p>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">最新報名紀錄</h3>
        <div className="space-y-4">
          {stats.recentRegistrations.map((reg: any) => (
            <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4 overflow-hidden">
                 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${reg.memberId ? 'bg-red-500' : 'bg-gray-500'}`}>
                    {reg.name?.[0] || reg.member_name?.[0]}
                 </div>
                 <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{reg.name || reg.member_name}</p>
                    <p className="text-xs font-bold text-blue-600 truncate my-0.5">{reg.activity_title}</p>
                    <p className="text-xs text-gray-500">{new Date(reg.created_at).toLocaleString('zh-TW')}</p>
                 </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                 <p className="font-bold text-gray-900">NT$ {reg.paid_amount}</p>
                 <span className={`text-xs px-2 py-0.5 rounded ${reg.payment_status === 'paid' ? 'bg-green-100 text-green-700' : (reg.payment_status === 'refunded' ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700')}`}>
                    {reg.payment_status === 'paid' ? '已付款' : (reg.payment_status === 'refunded' ? '已退費' : '待付款')}
                 </span>
              </div>
            </div>
          ))}
          {stats.recentRegistrations.length === 0 && <p className="text-center text-gray-400">尚無報名資料</p>}
        </div>
      </div>
    </div>
  );
};

// --- 活動管理元件 (整合新增/編輯/報名名單) ---
// 為了簡化程式碼長度，這裡使用一個通用的管理元件
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
  members?: Member[]; // 用於會員活動顯示會員資料
}> = ({ type, activities, registrations, onAdd, onUpdate, onDelete, onUpdateReg, onDeleteReg, onUploadImage, members }) => {
  const [view, setView] = useState<'list' | 'edit' | 'registrations'>('list');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [regSearch, setRegSearch] = useState('');

  const currentActivity = activities.find(a => a.id === editingId);
  const currentRegistrations = registrations.filter(r => String(r.activityId) === String(editingId));
  
  // 計算活動總覽
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
  
  // 處理付款狀態變更 (加入退費邏輯)
  const handlePaymentStatusToggle = (reg: any) => {
     // 1. 待付款 -> 已付款
     if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) {
        onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID });
        return;
     }

     // 2. 已付款 -> 選項 (退費 或 回復待付款)
     if (reg.payment_status === PaymentStatus.PAID) {
        if (confirm("【已付款】訂單操作：\n\n按「確定」將狀態標記為【已退費】\n按「取消」詢問是否回復為【待付款】")) {
             // User clicked OK -> Refunded
             onUpdateReg({ ...reg, payment_status: PaymentStatus.REFUNDED });
        } else {
             // User clicked Cancel -> Check if they want to go back to Pending (Double confirmation)
             if (confirm("是否要將此訂單回復為【待付款】？")) {
                onUpdateReg({ ...reg, payment_status: PaymentStatus.PENDING });
             }
        }
        return;
     }

     // 3. 已退費 -> 待付款
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

// --- Check-in Manager Component (專供工作人員/報到使用) ---
// 此元件提供「選擇活動」->「檢視名單」的流程，無需進入活動編輯頁面
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
    // 排序：日期越近越上面，且預設只顯示 'active' 的活動 (或全部，依需求)
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

  // 複製一份付款狀態切換邏輯到這裡
  const handlePaymentStatusToggle = (reg: any) => {
     // 1. 待付款 -> 已付款
     if (reg.payment_status === PaymentStatus.PENDING || !reg.payment_status) {
        onUpdateReg({ ...reg, payment_status: PaymentStatus.PAID });
        return;
     }

     // 2. 已付款 -> 選項 (退費 或 回復待付款)
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

     // 3. 已退費 -> 待付款
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

// --- 成員管理元件 ---
const MemberManager: React.FC<{ members: Member[]; onAdd: (m: Member) => void; onUpdate: (m: Member) => void; onDelete: (id: string | number) => void; onImport: (ms: Member[]) => void }> = ({ members, onAdd, onUpdate, onDelete, onImport }) => {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = members.filter(m => m.name.includes(searchTerm) || m.member_no.includes(searchTerm) || m.phone?.includes(searchTerm));

  const handleEdit = (m: Member) => { setEditingId(m.id); setFormData({...m}); setIsFormOpen(true); };
  const handleAdd = () => { setEditingId(null); setFormData({ member_no: '', name: '', status: 'active', industry_category: '其他' }); setIsFormOpen(true); };
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
      '會員編號': m.member_no,
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

       {isFormOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-bold mb-6">{editingId ? '編輯會員' : '新增會員'}</h2>
               <form onSubmit={handleSave} className="space-y-6">
                  
                  {/* 基本資料 */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-1">基本資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-bold mb-1">會員編號</label><input required type="text" value={formData.member_no} onChange={e => setFormData({...formData, member_no: e.target.value})} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-red-500"/></div>
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
                         <td className="p-3 font-mono text-gray-500">{m.member_no}</td>
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

// --- 使用者(管理員)管理 ---
const UserManager: React.FC<{ users: AdminUser[]; onAdd: (u: AdminUser) => void; onDelete: (id: string) => void }> = ({ users, onAdd, onDelete }) => {
   const [formData, setFormData] = useState<any>({ role: UserRole.STAFF });
   return (
     <div className="space-y-6">
        <h1 className="text-2xl font-bold">權限管理</h1>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <h3 className="font-bold mb-4 text-lg">新增人員</h3>
              <form onSubmit={e => { e.preventDefault(); onAdd({...formData, id: Date.now().toString()} as AdminUser); setFormData({role: UserRole.STAFF, name: '', phone: '', password: ''}); }} className="space-y-4">
                 <input required placeholder="姓名" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded"/>
                 <input required placeholder="手機" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded"/>
                 <input required placeholder="密碼" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border rounded"/>
                 <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border rounded">{Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}</select>
                 <button type="submit" className="w-full bg-red-600 text-white py-2 rounded font-bold">新增</button>
              </form>
           </div>
           <div>
              <h3 className="font-bold mb-4 text-lg">人員列表</h3>
              <div className="space-y-2">
                 {users.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                       <div><p className="font-bold">{u.name} <span className="text-xs text-gray-500 bg-white px-1 rounded border">{u.role}</span></p><p className="text-xs text-gray-400">{u.phone}</p></div>
                       <button onClick={() => onDelete(u.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
     </div>
   );
};

// --- 折扣券管理 ---
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
      <Sidebar user={props.currentUser} onLogout={props.onLogout} />
      <div className="flex-grow overflow-auto p-8">
        <Routes>
          <Route path="/" element={<DashboardHome {...props} />} />
          <Route path="/activities" element={<ActivityManager type="general" activities={props.activities} registrations={props.registrations} onAdd={props.onAddActivity} onUpdate={props.onUpdateActivity} onDelete={props.onDeleteActivity} onUpdateReg={props.onUpdateRegistration} onDeleteReg={props.onDeleteRegistration} onUploadImage={props.onUploadImage} />} />
          <Route path="/member-activities" element={<ActivityManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onAdd={props.onAddMemberActivity} onUpdate={props.onUpdateMemberActivity} onDelete={props.onDeleteMemberActivity} onUpdateReg={props.onUpdateMemberRegistration} onDeleteReg={props.onDeleteMemberRegistration} onUploadImage={props.onUploadImage} members={props.members} />} />
          <Route path="/members" element={<MemberManager members={props.members} onAdd={props.onAddMember} onUpdate={props.onUpdateMember} onDelete={props.onDeleteMember} onImport={props.onAddMembers!} />} />
          <Route path="/users" element={<UserManager users={props.users} onAdd={props.onAddUser} onDelete={props.onDeleteUser} />} />
          <Route path="/coupons" element={<CouponManager coupons={props.coupons} activities={props.activities} members={props.members} onGenerate={props.onGenerateCoupons} />} />
          
          {/* 更新：使用 ActivityCheckInManager 取代原本的 CheckInScanner */}
          <Route path="/check-in" element={<ActivityCheckInManager type="general" activities={props.activities} registrations={props.registrations} onUpdateReg={props.onUpdateRegistration} />} />
          <Route path="/member-check-in" element={<ActivityCheckInManager type="member" activities={props.memberActivities} registrations={props.memberRegistrations} onUpdateReg={props.onUpdateMemberRegistration} />} />
          
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
