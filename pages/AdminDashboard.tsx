
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, ChevronRight, Search, FileDown, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, UserPlus, DollarSign, TrendingUp, BarChart3, Mail, User, Clock, Image as ImageIcon, UploadCloud, Loader2, Smartphone, Building2, Briefcase, Globe, FileUp, Download, ClipboardList, CheckSquare, AlertCircle, RotateCcw, MapPin, Filter, X, Eye, EyeOff, Ticket, Cake } from 'lucide-react';
import { Activity, Registration, ActivityType, AdminUser, UserRole, Member, AttendanceRecord, AttendanceStatus, Coupon } from '../types';

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  activities: Activity[];
  registrations: Registration[];
  users: AdminUser[];
  members: Member[];
  attendance: AttendanceRecord[]; 
  coupons: Coupon[]; // 新增
  onUpdateActivity: (act: Activity) => void;
  onAddActivity: (act: Activity) => void;
  onDeleteActivity: (id: string | number) => void;
  onUpdateRegistration: (reg: Registration) => void;
  onDeleteRegistration: (id: string | number) => void;
  onAddUser: (user: AdminUser) => void;
  onDeleteUser: (id: string) => void;
  onAddMember: (member: Member) => void;
  onAddMembers?: (members: Member[]) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string | number) => void;
  onUpdateAttendance: (activityId: string, memberId: string, status: AttendanceStatus) => void; 
  onDeleteAttendance: (activityId: string, memberId: string) => void; 
  onUploadImage: (file: File) => Promise<string>;
  onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[]) => void; // 新增
}

// 獨立的輸入元件：解決輸入時頻繁更新導致卡頓的問題
const PaidAmountInput: React.FC<{ value?: number; onSave: (val: number) => void }> = ({ value, onSave }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '0');

  useEffect(() => {
    setLocalValue(value?.toString() || '0');
  }, [value]);

  const handleBlur = () => {
    const num = parseInt(localValue);
    if (!isNaN(num) && num !== (value || 0)) {
      onSave(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      className="border rounded px-2 py-1 w-24 text-sm focus:ring-1 focus:ring-red-500 outline-none transition-all text-right"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="0"
    />
  );
};

const Sidebar: React.FC<{ user: AdminUser; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const canAccessActivities = user.role === UserRole.MANAGER || user.role === UserRole.SUPER_ADMIN;
  const canAccessUsers = user.role === UserRole.SUPER_ADMIN;

  return (
    <div className="w-64 bg-gray-900 text-gray-400 flex flex-col min-h-screen">
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
      <nav className="flex-grow p-4 space-y-2">
        <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
          <LayoutDashboard size={20} />
          <span>儀表板</span>
        </Link>
        <Link to="/admin/check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
          <Users size={20} />
          <span>來賓報到 (訪客)</span>
        </Link>
        
        {/* 新增：會員報到，所有後台權限皆可看 */}
        <Link to="/admin/attendance" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/attendance') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
          <ClipboardList size={20} />
          <span>會員報到 (活動)</span>
        </Link>
        
        {canAccessActivities && (
          <>
            <Link to="/admin/activities" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/activities') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
              <Calendar size={20} />
              <span>活動管理</span>
            </Link>
            <Link to="/admin/members" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/members') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
              <Building2 size={20} />
              <span>會員管理</span>
            </Link>
            <Link to="/admin/coupons" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/coupons') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
              <Ticket size={20} />
              <span>折扣券管理</span>
            </Link>
          </>
        )}

        {canAccessUsers && (
          <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/users') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}>
            <Shield size={20} />
            <span>人員權限</span>
          </Link>
        )}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600/10 hover:text-red-500 transition-colors">
          <LogOut size={20} />
          <span>登出</span>
        </button>
      </div>
    </div>
  );
};

const DashboardHome: React.FC<{ activities: Activity[]; registrations: Registration[] }> = ({ activities, registrations }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 根據日期篩選活動
  const filteredActivities = activities.filter(activity => {
    if (startDate && activity.date < startDate) return false;
    if (endDate && activity.date > endDate) return false;
    return true;
  });

  // 根據篩選後的活動，找出相關的報名資料
  const filteredActivityIds = new Set(filteredActivities.map(a => String(a.id)));
  const filteredRegistrations = registrations.filter(r => filteredActivityIds.has(String(r.activityId)));

  // 計算活動統計資料 (基於篩選後的數據)
  const activityStats = filteredActivities.map(activity => {
    const activityRegs = registrations.filter(r => String(r.activityId) === String(activity.id));
    const checkedIn = activityRegs.filter(r => r.check_in_status === true).length; 
    const revenue = activityRegs.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
    const rate = activityRegs.length > 0 ? Math.round((checkedIn / activityRegs.length) * 100) : 0;
    
    return {
      ...activity,
      regCount: activityRegs.length,
      checkedInCount: checkedIn,
      checkInRate: rate,
      revenue
    };
  });

  const activeActivitiesCount = filteredActivities.filter(a => !a.status || a.status === 'active').length;
  const totalRevenue = filteredRegistrations.reduce((sum, reg) => sum + (reg.paid_amount || 0), 0);
  const checkedInCount = filteredRegistrations.filter(r => r.check_in_status).length;

  const handleSingleExport = (activity: Activity) => {
    const targetRegs = registrations.filter(r => String(r.activityId) === String(activity.id));
    if (targetRegs.length === 0) {
      alert(`「${activity.title}」目前尚無報名資料，無法匯出。`);
      return;
    }
    let csvContent = '\uFEFF';
    const headers = ['活動名稱', '日期', '姓名', '電話', 'Email', '公司', '職稱', '引薦人', '繳費金額', '報到狀態', '使用折扣碼', '報名時間'];
    csvContent += headers.join(',') + '\n';
    targetRegs.forEach(reg => {
      const checkIn = reg.check_in_status ? '已報到' : '未報到';
      const paid = reg.paid_amount || 0;
      const regTime = new Date(reg.created_at).toLocaleString('zh-TW');
      const escape = (text: string | undefined) => {
        if (!text) return '""';
        return `"${text.replace(/"/g, '""')}"`;
      };
      const row = [
        escape(activity.title),
        escape(activity.date),
        escape(reg.name),
        escape(reg.phone),
        escape(reg.email),
        escape(reg.company),
        escape(reg.title),
        escape(reg.referrer),
        paid,
        escape(checkIn),
        escape(reg.coupon_code),
        escape(regTime)
      ];
      csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activity.date}_${activity.title}_報名名單.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">活動數據儀表板</h1>
          <p className="text-gray-500">掌握各場活動的報名與收益狀況。</p>
        </div>
        
        {/* 日期篩選器 */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-500">日期區間</span>
          </div>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <span className="text-gray-400 text-xs">至</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {(startDate || endDate) && (
            <button 
              onClick={clearFilter}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              title="清除篩選"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* 總覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">總活動場次</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{activeActivitiesCount}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Calendar size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">總報名人數</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{filteredRegistrations.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">總報到人數</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{checkedInCount}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">總營收 (已繳費)</p>
               <h3 className="text-3xl font-bold text-gray-900 mt-2">NT$ {totalRevenue.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><DollarSign size={24} /></div>
           </div>
        </div>
      </div>

      {/* 活動列表與詳細數據 */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">各活動報名狀況</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-8 py-6 w-1/3">活動名稱 / 時間</th>
                  <th className="px-6 py-6">報名人數</th>
                  <th className="px-6 py-6">實收金額</th>
                  <th className="px-6 py-6">報到進度</th>
                  <th className="px-6 py-6">報到率</th>
                  <th className="px-8 py-6 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activityStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400">
                      在此日期區間內無活動資料
                    </td>
                  </tr>
                ) : (
                  activityStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-900 text-lg">{stat.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
                          <Calendar size={12} className="text-red-600" />
                          {stat.date}
                          <Clock size={12} className="text-red-600 ml-2" />
                          {stat.time}
                          <span className="mx-1">•</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500">{stat.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-2xl font-bold text-gray-800">{stat.regCount}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-red-600">NT$ {stat.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-lg font-bold text-gray-700">
                          {stat.checkedInCount} <span className="text-gray-300 font-normal">/</span> {stat.regCount}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`text-xl font-black ${stat.checkInRate > 80 ? 'text-green-600' : stat.checkInRate > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                          {stat.checkInRate}%
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleSingleExport(stat)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="匯出此活動報名表"
                          >
                            <FileDown size={20} />
                          </button>
                          <Link 
                            to="/admin/check-in" 
                            state={{ activityId: stat.id }}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="進入報到管理"
                          >
                            <ChevronRight size={20} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

// ----------------------
// CheckInManager (新增)
// ----------------------
const CheckInManager: React.FC<{
  activities: Activity[];
  registrations: Registration[];
  onUpdateRegistration: (reg: Registration) => void;
  onDeleteRegistration: (id: string | number) => void;
}> = ({ activities, registrations, onUpdateRegistration, onDeleteRegistration }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | number>(activities.length > 0 ? activities[0].id : '');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if ((!selectedActivityId || !activities.find(a => String(a.id) === String(selectedActivityId))) && activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
  }, [activities, selectedActivityId]);

  const currentRegistrations = registrations.filter(r => String(r.activityId) === String(selectedActivityId));
  
  const filteredRegistrations = currentRegistrations.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.phone.includes(searchTerm) ||
    (r.company && r.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const checkedInCount = currentRegistrations.filter(r => r.check_in_status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">來賓報到管理</h1>
           <p className="text-gray-500">管理一般報名來賓的報到狀態與繳費紀錄。</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <div className="px-3 py-2 bg-gray-50 rounded text-xs font-bold text-gray-500">活動切換</div>
           <select 
             value={selectedActivityId} 
             onChange={(e) => setSelectedActivityId(e.target.value)}
             className="bg-transparent outline-none font-bold text-gray-700 py-1 pr-2 cursor-pointer hover:text-red-600 transition-colors"
           >
             {activities.map(a => (
               <option key={a.id} value={a.id}>{a.date} {a.title}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">總報名人數</p>
               <p className="text-2xl font-bold text-gray-900">{currentRegistrations.length}</p>
            </div>
            <Users size={24} className="text-blue-500 opacity-20"/>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">已報到人數</p>
               <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
            </div>
            <CheckCircle size={24} className="text-green-500 opacity-20"/>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">報到率</p>
               <p className="text-2xl font-bold text-gray-900">
                 {currentRegistrations.length > 0 ? Math.round((checkedInCount / currentRegistrations.length) * 100) : 0}%
               </p>
            </div>
            <TrendingUp size={24} className="text-red-500 opacity-20"/>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
           <div className="relative flex-grow max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
             <input 
               type="text" 
               placeholder="搜尋姓名、電話或公司..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4">姓名 / 公司</th>
                <th className="px-6 py-4">聯絡資訊</th>
                <th className="px-6 py-4">繳費金額</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRegistrations.map(reg => (
                <tr key={reg.id} className={`hover:bg-gray-50/50 transition-colors ${reg.check_in_status ? 'bg-green-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onUpdateRegistration({ ...reg, check_in_status: !reg.check_in_status })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        reg.check_in_status 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {reg.check_in_status ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                      {reg.check_in_status ? '已報到' : '未報到'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{reg.name}</div>
                    <div className="text-xs text-gray-500">{reg.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">{reg.phone}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[150px]">{reg.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <span className="text-xs text-gray-400">$</span>
                      <PaidAmountInput 
                        value={reg.paid_amount} 
                        onSave={(val) => onUpdateRegistration({ ...reg, paid_amount: val })} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if(window.confirm(`確定要刪除 ${reg.name} 的報名資料嗎？`)) {
                           onDeleteRegistration(reg.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRegistrations.length === 0 && (
             <div className="p-10 text-center text-gray-400">找不到符合條件的報名資料</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------
// MemberAttendanceManager (新增)
// ----------------------
const MemberAttendanceManager: React.FC<{
  activities: Activity[];
  members: Member[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (activityId: string, memberId: string, status: AttendanceStatus) => void;
  onDeleteAttendance: (activityId: string, memberId: string) => void;
}> = ({ activities, members, attendance, onUpdateAttendance, onDeleteAttendance }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | number>(activities.length > 0 ? activities[0].id : '');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if ((!selectedActivityId || !activities.find(a => String(a.id) === String(selectedActivityId))) && activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
  }, [activities, selectedActivityId]);

  // 只顯示活躍會員
  const activeMembers = members.filter(m => m.status === undefined || m.status === 'active');
  
  const filteredMembers = activeMembers.filter(m => 
     m.name.includes(filter) || 
     m.company.includes(filter) || 
     (m.member_no && String(m.member_no).includes(filter))
  );

  // 取得該活動的所有出席紀錄
  const currentAttendance = attendance.filter(r => String(r.activity_id) === String(selectedActivityId));
  const presentCount = currentAttendance.filter(r => r.status === AttendanceStatus.PRESENT).length;

  const getStatus = (memberId: string | number) => {
     const record = currentAttendance.find(r => String(r.member_id) === String(memberId));
     return record ? record.status : AttendanceStatus.ABSENT;
  };

  const handleToggle = (memberId: string | number) => {
     const currentStatus = getStatus(memberId);
     const newStatus = currentStatus === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
     onUpdateAttendance(String(selectedActivityId), String(memberId), newStatus);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">會員出席管理</h1>
           <p className="text-gray-500">管理正式會員在各場活動的出席狀況。</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <div className="px-3 py-2 bg-gray-50 rounded text-xs font-bold text-gray-500">活動切換</div>
           <select 
             value={selectedActivityId} 
             onChange={(e) => setSelectedActivityId(e.target.value)}
             className="bg-transparent outline-none font-bold text-gray-700 py-1 pr-2 cursor-pointer hover:text-red-600 transition-colors"
           >
             {activities.map(a => (
               <option key={a.id} value={a.id}>{a.date} {a.title}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">應出席會員數 (活躍)</p>
               <p className="text-2xl font-bold text-gray-900">{activeMembers.length}</p>
            </div>
            <Users size={24} className="text-purple-500 opacity-20"/>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">實際出席人數</p>
               <p className="text-2xl font-bold text-blue-600">{presentCount}</p>
            </div>
            <CheckCircle size={24} className="text-blue-500 opacity-20"/>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
             <input 
               type="text" 
               placeholder="搜尋會員..." 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-gray-50 border-b border-gray-100">
               <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <th className="px-6 py-4">出席狀態</th>
                 <th className="px-6 py-4">會員編號</th>
                 <th className="px-6 py-4">姓名</th>
                 <th className="px-6 py-4">公司</th>
                 <th className="px-6 py-4">產業鏈</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {filteredMembers.map(member => {
                 const status = getStatus(member.id);
                 const isPresent = status === AttendanceStatus.PRESENT;
                 return (
                   <tr key={member.id} className={`hover:bg-gray-50/50 transition-colors ${isPresent ? 'bg-blue-50/30' : ''}`}>
                     <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggle(member.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            isPresent
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isPresent ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                          {isPresent ? '出席' : '缺席'}
                        </button>
                     </td>
                     <td className="px-6 py-4 font-mono text-gray-500 font-bold">{member.member_no}</td>
                     <td className="px-6 py-4 font-bold text-gray-900">{member.name}</td>
                     <td className="px-6 py-4 text-gray-600">{member.company}</td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium">{member.industry_chain}</span>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------
// ActivityManager (新增)
// ----------------------
const ActivityManager: React.FC<{
  activities: Activity[];
  onAddActivity: (act: Activity) => void;
  onUpdateActivity: (act: Activity) => void;
  onDeleteActivity: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
}> = ({ activities, onAddActivity, onUpdateActivity, onDeleteActivity, onUploadImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 初始化表單狀態 (避免 uncontrolled/controlled 錯誤)
  const defaultFormState: Partial<Activity> = {
    type: ActivityType.GATHERING,
    title: '',
    date: '',
    time: '',
    location: '',
    price: 0,
    member_price: 0,
    picture: '',
    description: '',
    status: 'active'
  };

  const [formData, setFormData] = useState<Partial<Activity>>(defaultFormState);

  const openModal = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData(activity);
    } else {
      setEditingActivity(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setIsUploading(true);
     try {
       const url = await onUploadImage(file);
       setFormData(prev => ({ ...prev, picture: url }));
     } catch (err) {
       alert('圖片上傳失敗');
     } finally {
       setIsUploading(false);
     }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const activityData: Activity = {
      id: editingActivity ? editingActivity.id : Date.now().toString(),
      type: formData.type || ActivityType.GATHERING,
      title: formData.title!,
      date: formData.date!,
      time: formData.time || '14:00',
      location: formData.location || '',
      price: Number(formData.price) || 0,
      member_price: formData.member_price ? Number(formData.member_price) : undefined,
      picture: formData.picture || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop',
      description: formData.description || '',
      status: formData.status || 'active'
    };

    if (editingActivity) {
      onUpdateActivity(activityData);
    } else {
      onAddActivity(activityData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">活動管理</h1>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> 新增活動
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <th className="px-6 py-4">狀態</th>
                 <th className="px-6 py-4">活動名稱 / 類型</th>
                 <th className="px-6 py-4">時間 / 地點</th>
                 <th className="px-6 py-4">費用 (一般/會員)</th>
                 <th className="px-6 py-4 text-right">操作</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
             {activities.map(activity => (
               <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        (activity.status === 'active' || !activity.status)
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-200 text-gray-500'
                     }`}>
                        {(activity.status === 'active' || !activity.status) ? '進行中' : '已結束'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-gray-900">{activity.title}</div>
                     <div className="text-xs text-gray-500 inline-block px-2 py-0.5 bg-gray-100 rounded mt-1">{activity.type}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                     <div className="flex items-center gap-1"><Calendar size={14}/> {activity.date}</div>
                     <div className="flex items-center gap-1 mt-0.5"><Clock size={14}/> {activity.time}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-gray-900">${activity.price}</div>
                     {activity.member_price !== undefined && (
                        <div className="text-xs text-red-500 font-bold">${activity.member_price}</div>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openModal(activity)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Edit size={16} /></button>
                       <button 
                         onClick={() => {
                           if(window.confirm(`確定要刪除「${activity.title}」嗎？相關的報名資料也會一併刪除。`)) {
                             onDeleteActivity(activity.id);
                           }
                         }}
                         className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-xl font-bold mb-6">{editingActivity ? '編輯活動' : '新增活動'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">活動類型</label>
                         <select 
                           value={formData.type} 
                           onChange={e => setFormData({...formData, type: e.target.value as ActivityType})}
                           className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500"
                         >
                            <option value={ActivityType.GATHERING}>產業小聚</option>
                            <option value={ActivityType.VISIT}>企業參訪</option>
                            <option value={ActivityType.COURSE}>專業課程</option>
                            <option value={ActivityType.DINNER}>交流餐敘</option>
                            <option value={ActivityType.PROJECT}>專案活動</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">活動狀態</label>
                         <select 
                           value={formData.status || 'active'} 
                           onChange={e => setFormData({...formData, status: e.target.value as 'active'|'closed'})}
                           className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500"
                         >
                            <option value="active">Active (進行中)</option>
                            <option value="closed">Closed (已結束/隱藏)</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">活動名稱</label>
                         <input 
                           required 
                           value={formData.title} 
                           onChange={e => setFormData({...formData, title: e.target.value})} 
                           className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">日期</label>
                            <input 
                              type="date" 
                              required 
                              value={formData.date} 
                              onChange={e => setFormData({...formData, date: e.target.value})} 
                              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">時間</label>
                            <input 
                              type="time" 
                              required 
                              value={formData.time} 
                              onChange={e => setFormData({...formData, time: e.target.value})} 
                              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                            />
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">地點</label>
                         <input 
                           required 
                           value={formData.location} 
                           onChange={e => setFormData({...formData, location: e.target.value})} 
                           className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">一般價格</label>
                          <input 
                            type="number" 
                            required 
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">會員價格 (選填)</label>
                          <input 
                            type="number" 
                            value={formData.member_price || ''} 
                            onChange={e => setFormData({...formData, member_price: e.target.value ? Number(e.target.value) : undefined})} 
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="留空則無優惠"
                          />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">封面圖片</label>
                         <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                            {isUploading && (
                               <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                  <Loader2 className="animate-spin text-red-600" />
                               </div>
                            )}
                            {formData.picture ? (
                               <div className="relative group">
                                  <img src={formData.picture} alt="Cover" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                     <span className="text-white text-sm font-bold">點擊更換</span>
                                  </div>
                               </div>
                            ) : (
                               <div className="py-8 text-gray-400">
                                  <ImageIcon className="mx-auto mb-2" size={32} />
                                  <span className="text-sm">點擊上傳圖片</span>
                               </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleImageChange}
                            />
                         </div>
                      </div>
                      <div className="flex-grow flex flex-col">
                         <label className="block text-sm font-bold text-gray-700 mb-1">活動描述</label>
                         <textarea 
                           required 
                           value={formData.description} 
                           onChange={e => setFormData({...formData, description: e.target.value})} 
                           className="w-full flex-grow min-h-[150px] border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                         />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)} 
                     className="flex-1 border py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                   >
                     取消
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
                   >
                     {editingActivity ? '儲存變更' : '建立活動'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------
// 折扣券管理 (新增)
// ----------------------
const CouponManager: React.FC<{
  activities: Activity[],
  members: Member[],
  coupons: Coupon[],
  onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[]) => void
}> = ({ activities, members, coupons, onGenerateCoupons }) => {
  const [selectedActivityId, setSelectedActivityId] = useState(activities.length > 0 ? activities[0].id : '');
  const [amount, setAmount] = useState(500);
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  const activeMembers = members.filter(m => m.status === 'active' || !m.status);
  
  // 當活動資料更新時，確保選中的活動ID有效
  useEffect(() => {
    if (!selectedActivityId && activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
  }, [activities]);

  const handleGenerate = () => {
    if (!onGenerateCoupons) return;
    if (!selectedActivityId) {
      alert('請先選擇活動');
      return;
    }
    
    if (window.confirm(`確定要產生折扣券嗎？\n金額: ${amount}\n對象: ${targetType === 'all' ? `全體活躍會員 (${activeMembers.length}人)` : '指定會員'}`)) {
      let targets: string[] = [];
      if (targetType === 'all') {
        targets = activeMembers.map(m => String(m.id));
      } else {
        if (!selectedMemberId) {
          alert('請選擇會員');
          return;
        }
        targets = [selectedMemberId];
      }
      
      onGenerateCoupons(String(selectedActivityId), amount, targets);
    }
  };

  const handleExportCoupons = () => {
     let csvContent = '\uFEFF';
     const headers = ['活動名稱', '折扣碼', '金額', '會員編號', '會員姓名', '公司', '使用狀態', '產生時間'];
     csvContent += headers.join(',') + '\n';
     
     // 排序：活動 > 姓名
     const sortedCoupons = [...coupons].sort((a, b) => {
        if (a.activity_id !== b.activity_id) return String(a.activity_id).localeCompare(String(b.activity_id));
        const mA = members.find(m => String(m.id) === String(a.member_id));
        const mB = members.find(m => String(m.id) === String(b.member_id));
        return (mA?.name || '').localeCompare(mB?.name || '');
     });

     sortedCoupons.forEach(c => {
       const act = activities.find(a => String(a.id) === String(c.activity_id));
       const mem = members.find(m => String(m.id) === String(c.member_id));
       const status = c.is_used ? '已使用' : '未使用';
       
       const row = [
         act?.title || '未知活動',
         c.code,
         c.discount_amount,
         mem?.member_no || '',
         mem?.name || '未知會員',
         mem?.company || '',
         status,
         new Date(c.created_at).toLocaleDateString()
       ];
       csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
     });
     
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', `折扣券匯出_${new Date().toISOString().slice(0,10)}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold">折扣券管理</h1>
            <p className="text-gray-500 text-sm">產生一次性活動折扣券，發送給會員使用。</p>
         </div>
         <button onClick={handleExportCoupons} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
           <FileDown size={18} /> 匯出所有折扣券
         </button>
       </div>

       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus size={20} className="text-red-600"/> 產生新折扣券
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">選擇活動</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={selectedActivityId}
                  onChange={e => setSelectedActivityId(e.target.value)}
                >
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.date} {a.title}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">折扣金額</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">發送對象</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={targetType}
                  onChange={e => setTargetType(e.target.value as any)}
                >
                   <option value="all">全體活躍會員 ({activeMembers.length}人)</option>
                   <option value="single">指定單一會員</option>
                </select>
             </div>
             {targetType === 'single' && (
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">選擇會員</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                  >
                    <option value="">請選擇...</option>
                    {activeMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.member_no} {m.name} ({m.company})</option>
                    ))}
                  </select>
               </div>
             )}
             <button 
                onClick={handleGenerate}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors h-[42px]"
             >
                產生折扣券
             </button>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
             最近產生的折扣券 (總數: {coupons.length})
          </div>
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-500">活動</th>
                  <th className="px-6 py-3 font-bold text-gray-500">折扣碼</th>
                  <th className="px-6 py-3 font-bold text-gray-500">金額</th>
                  <th className="px-6 py-3 font-bold text-gray-500">會員</th>
                  <th className="px-6 py-3 font-bold text-gray-500">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => {
                   const act = activities.find(a => String(a.id) === String(c.activity_id));
                   const mem = members.find(m => String(m.id) === String(c.member_id));
                   return (
                     <tr key={c.id} className="hover:bg-gray-50">
                       <td className="px-6 py-3 text-gray-900 font-medium truncate max-w-[200px]" title={act?.title}>{act?.title || '未知'}</td>
                       <td className="px-6 py-3 font-mono text-blue-600 font-bold select-all">{c.code}</td>
                       <td className="px-6 py-3 text-red-600 font-bold">${c.discount_amount}</td>
                       <td className="px-6 py-3 text-gray-600">
                         {mem ? `${mem.name} (${mem.company})` : '-'}
                       </td>
                       <td className="px-6 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${c.is_used ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                           {c.is_used ? '已使用' : '未使用'}
                         </span>
                       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
};


const MemberManager: React.FC<{ 
  members: Member[], 
  onAddMember: (m: Member) => void, 
  onAddMembers?: (m: Member[]) => void, // 批次匯入
  onUpdateMember: (m: Member) => void, 
  onDeleteMember: (id: string | number) => void 
}> = ({ members, onAddMember, onAddMembers, onUpdateMember, onDeleteMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData: Member = {
      id: editingMember?.id || '',
      member_no: formData.get('member_no') as string,
      industry_chain: formData.get('industry_chain') as any,
      industry_category: formData.get('industry_category') as string,
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      website: formData.get('website') as string,
      intro: formData.get('intro') as string,
      birthday: formData.get('birthday') as string, // 新增
      status: formData.get('status') as 'active' | 'inactive',
      join_date: formData.get('join_date') as string,
      quit_date: formData.get('quit_date') as string
    };

    if (editingMember) onUpdateMember(memberData);
    else onAddMember(memberData);

    setIsModalOpen(false);
    setEditingMember(null);
  };

  const confirmDelete = (member: Member) => {
    if (window.confirm(`確定要刪除會員「${member.name} (${member.company})」嗎？\n注意：這會永久刪除會員資料。若只是要停止會籍，建議使用「編輯」並將狀態改為「停權/離會」。`)) {
      onDeleteMember(member.id);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = '\uFEFF會員編號,產業鏈(美食/工程/健康/幸福/工商),行業別,姓名,公司名稱,會員簡介,網站連結,狀態(active/inactive),入會日,離會日,生日(YYYY-MM-DD)\n001,工商,網站設計,王小明,長展科技,專注於高質感網站設計...,https://example.com,active,2024-01-01,,1990-01-01';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '會員匯入範本.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          alert('檔案內容為空');
          return;
        }
        
        // 優化：同時支援 \r\n, \n, \r (解決 Excel/Mac 格式問題)
        const lines = text.split(/\r\n|\n|\r/);
        const newMembers: Member[] = [];
        
        // 判斷是否有標題列 (檢查第一行是否包含 "會員" 或 "編號")
        let startIndex = 0;
        if (lines.length > 0 && (lines[0].includes('會員') || lines[0].includes('編號'))) {
          startIndex = 1;
        }
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // 簡易 CSV 解析
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          
          // 寬鬆檢查：只要有前 4 個欄位 (編號, 產業, 行業, 姓名) 就算有效
          if (cols.length < 4) {
             console.warn(`Line ${i+1} skipped due to insufficient columns:`, line);
             continue;
          }

          // 處理 "-" 符號，轉為空字串
          const cleanVal = (val: string) => (val === '-' || !val) ? '' : val;

          newMembers.push({
            id: Date.now() + i, // 暫時 ID，資料庫會重產
            member_no: cleanVal(cols[0]),
            industry_chain: (['美食', '工程', '健康', '幸福', '工商'].includes(cols[1]) ? cols[1] : '工商') as any,
            industry_category: cleanVal(cols[2]),
            name: cleanVal(cols[3]),
            company: cleanVal(cols[4]),
            intro: cleanVal(cols[5]),
            website: cleanVal(cols[6]),
            status: cols[7] === 'inactive' ? 'inactive' : 'active',
            join_date: cleanVal(cols[8]),
            quit_date: cleanVal(cols[9]),
            birthday: cleanVal(cols[10])
          });
        }

        if (newMembers.length > 0) {
          if (window.confirm(`解析成功！共發現 ${newMembers.length} 筆資料。\n確定要匯入嗎？`)) {
            if (onAddMembers) {
              onAddMembers(newMembers);
            } else {
              alert('系統錯誤：找不到匯入函式 (onAddMembers is undefined)');
            }
          }
        } else {
          alert(`解析失敗。讀取到 ${lines.length} 行，但無法識別有效資料。\n原因可能是：\n1. 檔案格式不正確 (需為逗號分隔 CSV)\n2. 沒有有效資料行\n3. 編碼問題 (請嘗試另存為 UTF-8 編碼)`);
        }
      } catch (err) {
        console.error(err);
        alert('讀取檔案發生錯誤，請檢查檔案是否損毀。');
      } finally {
        // 清空 input 讓同一檔案可以再次選取
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 排序顯示：依照會員編號 (修正：安全轉換為字串後比較)
  const sortedMembers = [...members].sort((a, b) => {
    const valA = a.member_no !== undefined && a.member_no !== null ? String(a.member_no) : '';
    const valB = b.member_no !== undefined && b.member_no !== null ? String(b.member_no) : '';
    
    // 如果兩者都沒有編號，保持原順序或用 ID 排
    if (!valA && !valB) return 0;
    if (!valA) return 1;
    if (!valB) return -1;
    
    return valA.localeCompare(valB, undefined, { numeric: true });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">會員資料管理</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadTemplate} 
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            title="下載 CSV 範本"
          >
            <Download size={18} /> <span className="hidden sm:inline">下載範本</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FileUp size={18} /> 匯入 CSV
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleImportCSV} 
            />
          </div>
          <button onClick={() => { setEditingMember(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            <UserPlus size={18} /> 新增會員
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">編號</th>
              <th className="px-6 py-4">產業鏈</th>
              <th className="px-6 py-4">狀態</th>
              <th className="px-6 py-4">品牌/公司</th>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">生日</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedMembers.map(member => (
              <tr key={member.id} className={`hover:bg-gray-50/50 transition-colors ${member.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''}`}>
                <td className="px-6 py-4 font-mono text-gray-400 font-bold">{member.member_no}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    member.industry_chain === '美食' ? 'bg-orange-100 text-orange-600' :
                    member.industry_chain === '工程' ? 'bg-blue-100 text-blue-600' :
                    member.industry_chain === '健康' ? 'bg-green-100 text-green-600' :
                    member.industry_chain === '幸福' ? 'bg-pink-100 text-pink-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {member.industry_chain}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    member.status === 'inactive' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {member.status === 'inactive' ? <EyeOff size={12}/> : <Eye size={12}/>}
                    {member.status === 'inactive' ? '停權/離會' : '活躍'}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {member.company || <span className="text-gray-300 font-normal">-</span>}
                  {member.website && (
                    <a href={member.website} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block text-gray-400 hover:text-red-600">
                      <Globe size={14} />
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">{member.name}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{member.birthday || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => confirmDelete(member)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="p-10 text-center text-gray-400">目前尚無會員資料</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editingMember ? '修改會員資料' : '新增會員'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-red-600"/>
                  <h3 className="font-bold text-gray-700">會籍管理</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">目前狀態</label>
                      <select 
                        name="status" 
                        defaultValue={editingMember?.status || 'active'} 
                        className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      >
                        <option value="active">活躍 (Active)</option>
                        <option value="inactive">停權/離會 (Inactive)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">入會日期</label>
                      <input name="join_date" type="date" defaultValue={editingMember?.join_date} className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">離會日期</label>
                      <input name="quit_date" type="date" defaultValue={editingMember?.quit_date} className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500" />
                   </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">※ 設定為「停權/離會」後，該會員將不會出現在前台列表與點名表中，但資料會保留。</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">會員編號</label>
                  <input name="member_no" required defaultValue={editingMember?.member_no} className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500 font-mono" placeholder="001" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">產業鏈</label>
                  <select name="industry_chain" defaultValue={editingMember?.industry_chain || '工商'} className="w-full border rounded-lg px-3 py-3 bg-white outline-none focus:ring-2 focus:ring-red-500">
                    <option value="美食">美食產業鏈</option>
                    <option value="工程">工程產業鏈</option>
                    <option value="健康">健康產業鏈</option>
                    <option value="幸福">幸福產業鏈</option>
                    <option value="工商">工商產業鏈</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">行業別</label>
                   <input name="industry_category" required defaultValue={editingMember?.industry_category} className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="例如：網站設計" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">大名</label>
                   <input name="name" required defaultValue={editingMember?.name} className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="姓名" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">生日 (新增)</label>
                   <input 
                     name="birthday" 
                     type="date"
                     defaultValue={editingMember?.birthday} 
                     className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" 
                   />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">品牌 / 公司名稱</label>
                    <input name="company" required defaultValue={editingMember?.company} className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="公司名稱" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">會員簡介 (選填)</label>
                <textarea 
                  name="intro" 
                  rows={3} 
                  defaultValue={editingMember?.intro} 
                  className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500 resize-none" 
                  placeholder="請輸入簡短的服務介紹或個人簡介..." 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">網站連結 (選填)</label>
                <input name="website" type="url" defaultValue={editingMember?.website} className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="https://..." />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors">取消</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all">確認儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UserManager: React.FC<{ 
  users: AdminUser[], 
  onAddUser: (u: AdminUser) => void, 
  onDeleteUser: (id: string) => void,
  currentUser: AdminUser
}> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: AdminUser = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as UserRole
    };
    onAddUser(newUser);
    setIsModalOpen(false);
  };

  const confirmDelete = (user: AdminUser) => {
    if (user.id === currentUser.id) {
        alert('無法刪除自己');
        return;
    }
    if (window.confirm(`確定要刪除管理員「${user.name}」嗎？`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">人員權限管理</h1>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                <UserPlus size={18} /> 新增人員
            </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-4">姓名</th>
                        <th className="px-6 py-4">電話</th>
                        <th className="px-6 py-4">權限角色</th>
                        <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">
                                {user.name} 
                                {user.id === currentUser.id && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">You</span>}
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-500">{user.phone}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-600' :
                                    user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {user.role !== UserRole.SUPER_ADMIN && user.id !== currentUser.id && (
                                    <button onClick={() => confirmDelete(user)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6">新增管理人員</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                            <input name="name" required className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="姓名" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">手機號碼 (登入帳號)</label>
                            <input name="phone" required className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="09xx-xxx-xxx" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">密碼</label>
                            <input name="password" type="password" required className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="設定密碼" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">權限角色</label>
                            <select name="role" className="w-full border rounded-lg px-3 py-3 bg-white outline-none focus:ring-2 focus:ring-red-500">
                                <option value={UserRole.STAFF}>工作人員 (僅查看報到)</option>
                                <option value={UserRole.MANAGER}>管理員 (可管理活動與會員)</option>
                                <option value={UserRole.SUPER_ADMIN}>總管理員 (完全權限)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors">取消</button>
                            <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all">確認新增</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const canAccessActivities = props.currentUser.role === UserRole.MANAGER || props.currentUser.role === UserRole.SUPER_ADMIN;
  const canAccessUsers = props.currentUser.role === UserRole.SUPER_ADMIN;
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar user={props.currentUser} onLogout={props.onLogout} />
      <div className="flex-grow p-8">
        <Routes>
          <Route path="/" element={<DashboardHome activities={props.activities} registrations={props.registrations} />} />
          <Route path="/check-in" element={<CheckInManager activities={props.activities} registrations={props.registrations} onUpdateRegistration={props.onUpdateRegistration} onDeleteRegistration={props.onDeleteRegistration} />} />
          {/* 加入新的路由，所有管理員等級皆可訪問 */}
          <Route path="/attendance" element={<MemberAttendanceManager activities={props.activities} members={props.members} attendance={props.attendance} onUpdateAttendance={props.onUpdateAttendance} onDeleteAttendance={props.onDeleteAttendance} />} />
          
          {canAccessActivities && (
            <>
              <Route path="/activities" element={<ActivityManager activities={props.activities} onAddActivity={props.onAddActivity} onUpdateActivity={props.onUpdateActivity} onDeleteActivity={props.onDeleteActivity} onUploadImage={props.onUploadImage} />} />
              <Route path="/members" element={
                <MemberManager 
                  members={props.members} 
                  onAddMember={props.onAddMember} 
                  onAddMembers={props.onAddMembers} // 傳遞批次匯入
                  onUpdateMember={props.onUpdateMember} 
                  onDeleteMember={props.onDeleteMember} 
                />
              } />
              <Route path="/coupons" element={
                <CouponManager 
                  activities={props.activities}
                  members={props.members}
                  coupons={props.coupons}
                  onGenerateCoupons={props.onGenerateCoupons}
                />
              } />
            </>
          )}
          {canAccessUsers && <Route path="/users" element={<UserManager users={props.users} onAddUser={props.onAddUser} onDeleteUser={props.onDeleteUser} currentUser={props.currentUser} />} />}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
