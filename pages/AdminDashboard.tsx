
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
  coupons: Coupon[];
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
  onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => void;
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

  const filteredActivities = activities.filter(activity => {
    if (startDate && activity.date < startDate) return false;
    if (endDate && activity.date > endDate) return false;
    return true;
  });

  const filteredActivityIds = new Set(filteredActivities.map(a => String(a.id)));
  const filteredRegistrations = registrations.filter(r => filteredActivityIds.has(String(r.activityId)));

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

const CheckInManager: React.FC<{
  activities: Activity[];
  registrations: Registration[];
  onUpdateRegistration: (reg: Registration) => void;
  onDeleteRegistration: (id: string | number) => void;
}> = ({ activities, registrations, onUpdateRegistration, onDeleteRegistration }) => {
  const location = useLocation();
  const stateActivityId = location.state?.activityId;
  const [selectedActivityId, setSelectedActivityId] = useState<string>(stateActivityId ? String(stateActivityId) : (activities.length > 0 ? String(activities[0].id) : ''));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (stateActivityId) {
      setSelectedActivityId(String(stateActivityId));
    } else if (!selectedActivityId && activities.length > 0) {
      setSelectedActivityId(String(activities[0].id));
    }
  }, [activities, stateActivityId]);

  const currentActivity = activities.find(a => String(a.id) === selectedActivityId);
  const currentRegistrations = registrations.filter(r => String(r.activityId) === selectedActivityId);

  const filteredRegistrations = currentRegistrations.filter(r => 
    r.name.includes(searchTerm) || 
    r.phone.includes(searchTerm) || 
    (r.company && r.company.includes(searchTerm))
  );

  const checkedInCount = currentRegistrations.filter(r => r.check_in_status).length;
  const totalCount = currentRegistrations.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">報到管理 (來賓/訪客)</h1>
          <p className="text-gray-500">管理活動報名人員，執行報到與繳費確認。</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <select 
             value={selectedActivityId} 
             onChange={e => setSelectedActivityId(e.target.value)}
             className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 py-1 px-2 cursor-pointer w-64"
           >
             {activities.map(a => (
               <option key={a.id} value={a.id}>{a.date} {a.title}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-400">總報名</span>
           <span className="text-2xl font-bold text-gray-800">{totalCount}</span>
        </div>
        <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-400">已報到</span>
           <span className="text-2xl font-bold text-green-600">{checkedInCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="搜尋姓名、電話或公司..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold">
                  <tr>
                     <th className="px-6 py-4">狀態</th>
                     <th className="px-6 py-4">姓名 / 公司</th>
                     <th className="px-6 py-4">聯絡資訊</th>
                     <th className="px-6 py-4">引薦人</th>
                     <th className="px-6 py-4">繳費金額</th>
                     <th className="px-6 py-4 text-right">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredRegistrations.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">無相關報名資料</td></tr>
                  ) : (
                    filteredRegistrations.map(reg => (
                       <tr key={reg.id} className={reg.check_in_status ? 'bg-green-50/30' : ''}>
                          <td className="px-6 py-4">
                             <button 
                               onClick={() => onUpdateRegistration({ ...reg, check_in_status: !reg.check_in_status })}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                 reg.check_in_status 
                                 ? 'bg-green-100 text-green-700 ring-2 ring-green-200' 
                                 : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                               }`}
                             >
                                {reg.check_in_status ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />}
                                {reg.check_in_status ? '已報到' : '未報到'}
                             </button>
                          </td>
                          <td className="px-6 py-4">
                             <div className="font-bold text-gray-900 text-base">{reg.name}</div>
                             <div className="text-gray-500">{reg.company} {reg.title ? `- ${reg.title}` : ''}</div>
                             {reg.coupon_code && <div className="text-xs text-red-500 mt-1">優惠碼: {reg.coupon_code}</div>}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                             <div>{reg.phone}</div>
                             <div className="text-xs text-gray-400">{reg.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                             {reg.referrer || '-'}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-xs">$</span>
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
                               className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </td>
                       </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const MemberAttendanceManager: React.FC<{
  activities: Activity[];
  members: Member[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (activityId: string, memberId: string, status: AttendanceStatus) => void;
}> = ({ activities, members, attendance, onUpdateAttendance }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities.length > 0 ? String(activities[0].id) : '');
  const [searchTerm, setSearchTerm] = useState('');

  // 僅顯示活躍會員
  const activeMembers = members.filter(m => m.status === 'active' || !m.status);

  useEffect(() => {
    if (!selectedActivityId && activities.length > 0) {
      setSelectedActivityId(String(activities[0].id));
    }
  }, [activities]);

  const filteredMembers = activeMembers.filter(m => 
    m.name.includes(searchTerm) || 
    m.company.includes(searchTerm) ||
    String(m.member_no).includes(searchTerm)
  );

  const getStatus = (memberId: string) => {
    const record = attendance.find(r => String(r.activity_id) === String(selectedActivityId) && String(r.member_id) === String(memberId));
    return record?.status || AttendanceStatus.ABSENT;
  };

  const presentCount = activeMembers.filter(m => getStatus(String(m.id)) === AttendanceStatus.PRESENT).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">會員出席管理</h1>
          <p className="text-gray-500">紀錄分會成員的活動出席狀況。</p>
        </div>
        <select 
          value={selectedActivityId} 
          onChange={e => setSelectedActivityId(e.target.value)}
          className="bg-white border rounded-lg py-2 px-3 text-sm font-bold text-gray-700 shadow-sm w-full md:w-64"
        >
          {activities.map(a => (
            <option key={a.id} value={a.id}>{a.date} {a.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-sm font-bold text-gray-400">會員出席率</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">{presentCount}</span>
            <span className="text-sm text-gray-400">/ {activeMembers.length}</span>
          </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="搜尋會員..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                   <th className="px-6 py-4 w-24">編號</th>
                   <th className="px-6 py-4">會員姓名</th>
                   <th className="px-6 py-4">公司/品牌</th>
                   <th className="px-6 py-4 text-right">出席狀態</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {filteredMembers.map(member => {
                 const status = getStatus(String(member.id));
                 const isPresent = status === AttendanceStatus.PRESENT;
                 return (
                   <tr key={member.id} className={isPresent ? 'bg-green-50/30' : ''}>
                      <td className="px-6 py-4 text-gray-400 font-mono">{member.member_no}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 text-gray-600">{member.company}</td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => onUpdateAttendance(selectedActivityId, String(member.id), isPresent ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT)}
                           className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                             isPresent 
                             ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700' 
                             : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                           }`}
                         >
                            {isPresent ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                            {isPresent ? '已出席' : '缺席'}
                         </button>
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
  members: Member[];
  onAddMember: (m: Member) => void;
  onUpdateMember: (m: Member) => void;
  onDeleteMember: (id: string | number) => void;
  onAddMembers?: (ms: Member[]) => void;
}> = ({ members, onAddMember, onUpdateMember, onDeleteMember, onAddMembers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // 匯入相關
  const [importText, setImportText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const openModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData({ status: 'active', industry_chain: '工商' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: editingMember?.id || Date.now().toString(),
      member_no: formData.member_no || '',
      industry_chain: formData.industry_chain as any || '工商',
      industry_category: formData.industry_category || '',
      name: formData.name || '',
      company: formData.company || '',
      website: formData.website || '',
      intro: formData.intro || '',
      status: formData.status as any || 'active'
    };

    if (editingMember) {
      onUpdateMember(newMember);
    } else {
      onAddMember(newMember);
    }
    setIsModalOpen(false);
  };

  const handleImport = () => {
    if (!onAddMembers) return;
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        onAddMembers(parsed);
        setIsImportModalOpen(false);
        setImportText('');
      } else {
        alert('匯入格式錯誤：必須是陣列');
      }
    } catch (e) {
      alert('JSON 解析失敗');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || 
    m.company.includes(searchTerm) || 
    String(m.member_no).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">會員管理</h1>
         <div className="flex gap-2">
            {onAddMembers && (
               <button onClick={() => setIsImportModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900">
                  匯入會員
               </button>
            )}
            <button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2">
               <Plus size={18} /> 新增會員
            </button>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="搜尋會員..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold">
                  <tr>
                     <th className="px-6 py-4">No.</th>
                     <th className="px-6 py-4">姓名 / 公司</th>
                     <th className="px-6 py-4">產業分類</th>
                     <th className="px-6 py-4">狀態</th>
                     <th className="px-6 py-4 text-right">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredMembers.map(m => (
                     <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-gray-400">{m.member_no}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900">{m.name}</div>
                           <div className="text-gray-500">{m.company}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-bold text-gray-600 mr-2">{m.industry_chain}</span>
                           <span className="text-gray-500">{m.industry_category}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              (m.status === 'active' || !m.status) ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                           }`}>
                              {(m.status === 'active' || !m.status) ? '活躍' : '停權'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={() => openModal(m)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Edit size={16} /></button>
                              <button onClick={() => { if(window.confirm('確定刪除？')) onDeleteMember(m.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">{editingMember ? '編輯會員' : '新增會員'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">會員編號</label>
                         <input value={formData.member_no || ''} onChange={e => setFormData({...formData, member_no: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                         <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">公司/品牌</label>
                      <input required value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">產業鏈</label>
                         <select value={formData.industry_chain} onChange={e => setFormData({...formData, industry_chain: e.target.value as any})} className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500">
                            {['美食','工程','健康','幸福','工商'].map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">行業別</label>
                         <input value={formData.industry_category || ''} onChange={e => setFormData({...formData, industry_category: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">網站 (選填)</label>
                      <input value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">簡介 (選填)</label>
                      <textarea value={formData.intro || ''} onChange={e => setFormData({...formData, intro: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">狀態</label>
                      <select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500">
                         <option value="active">活躍</option>
                         <option value="inactive">停權/隱藏</option>
                      </select>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-50">取消</button>
                      <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">儲存</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">大量匯入會員</h2>
                <p className="text-sm text-gray-500 mb-2">請貼上符合格式的 JSON 陣列。</p>
                <textarea 
                   className="w-full h-64 border rounded-lg p-3 font-mono text-xs mb-4" 
                   value={importText} 
                   onChange={e => setImportText(e.target.value)}
                   placeholder='[{"member_no": "1", "name": "...", ...}]'
                />
                <div className="flex gap-4">
                   <button onClick={() => setIsImportModalOpen(false)} className="flex-1 border py-2 rounded-lg font-bold text-gray-500">取消</button>
                   <button onClick={handleImport} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">匯入</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

const UserManager: React.FC<{
    users: AdminUser[];
    onAddUser: (u: AdminUser) => void;
    onDeleteUser: (id: string) => void;
    currentUser: AdminUser;
}> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
   const [formData, setFormData] = useState<Partial<AdminUser>>({ role: UserRole.STAFF });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!formData.name || !formData.phone || !formData.password) return;
      onAddUser({
         id: Date.now().toString(),
         name: formData.name,
         phone: formData.phone,
         password: formData.password,
         role: formData.role || UserRole.STAFF
      });
      setFormData({ role: UserRole.STAFF, name: '', phone: '', password: '' });
   };

   return (
      <div className="space-y-6">
         <h1 className="text-2xl font-bold text-gray-900">權限管理</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg mb-4">新增管理員</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                     <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">手機 (帳號)</label>
                     <input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">密碼</label>
                     <input required type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">角色</label>
                     <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500">
                        <option value={UserRole.STAFF}>工作人員</option>
                        <option value={UserRole.MANAGER}>管理員</option>
                        <option value={UserRole.SUPER_ADMIN}>總管理員</option>
                     </select>
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 mt-2">新增</button>
               </form>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg mb-4">現有管理員</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 text-gray-500">
                        <tr>
                           <th className="px-4 py-2">姓名</th>
                           <th className="px-4 py-2">手機</th>
                           <th className="px-4 py-2">角色</th>
                           <th className="px-4 py-2 text-right">操作</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                           <tr key={u.id}>
                              <td className="px-4 py-3 font-bold">{u.name}</td>
                              <td className="px-4 py-3">{u.phone}</td>
                              <td className="px-4 py-3">
                                 <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{u.role}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                 {u.id !== currentUser.id && (
                                    <button onClick={() => { if(window.confirm('確定刪除？')) onDeleteUser(u.id); }} className="text-red-500 hover:text-red-700">
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
};

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

  const defaultFormState: Partial<Activity> = {
    type: ActivityType.GATHERING,
    title: '',
    date: '',
    time: '',
    location: '',
    price: 0,
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
                 <th className="px-6 py-4">報名費用</th>
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

const CouponManager: React.FC<{
  activities: Activity[],
  members: Member[],
  coupons: Coupon[],
  onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => void
}> = ({ activities, members, coupons, onGenerateCoupons }) => {
  const [selectedActivityId, setSelectedActivityId] = useState(activities.length > 0 ? activities[0].id : '');
  const [amount, setAmount] = useState(500);
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  
  const activeMembers = members.filter(m => m.status === 'active' || !m.status);
  
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
    
    const targetName = targetType === 'all' ? `全體活躍會員 (${activeMembers.length}人)` : '指定會員';
    const emailConfirm = sendEmail ? '並寄送 Email 通知' : '不寄送通知';

    if (window.confirm(`確定要產生折扣券嗎？\n金額: ${amount}\n對象: ${targetName}\n設定: ${emailConfirm}`)) {
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
      
      onGenerateCoupons(String(selectedActivityId), amount, targets, sendEmail);
    }
  };

  const handleExportCoupons = () => {
     let csvContent = '\uFEFF';
     const headers = ['活動名稱', '折扣碼', '金額', '會員編號', '會員姓名', '公司', '使用狀態', '產生時間'];
     csvContent += headers.join(',') + '\n';
     
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
             
             <div className="flex items-center gap-2 pb-3">
                <input 
                  type="checkbox" 
                  id="sendEmail" 
                  checked={sendEmail} 
                  onChange={e => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="sendEmail" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                   同步寄送 Email 通知
                </label>
             </div>

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

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={props.currentUser} onLogout={props.onLogout} />
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome activities={props.activities} registrations={props.registrations} />} />
          <Route path="/activities" element={
             <ActivityManager 
               activities={props.activities} 
               onAddActivity={props.onAddActivity} 
               onUpdateActivity={props.onUpdateActivity} 
               onDeleteActivity={props.onDeleteActivity} 
               onUploadImage={props.onUploadImage}
             />
          } />
          <Route path="/members" element={
             <MemberManager 
               members={props.members}
               onAddMember={props.onAddMember}
               onUpdateMember={props.onUpdateMember}
               onDeleteMember={props.onDeleteMember}
               onAddMembers={props.onAddMembers}
             />
          } />
          <Route path="/check-in" element={
             <CheckInManager 
               activities={props.activities} 
               registrations={props.registrations} 
               onUpdateRegistration={props.onUpdateRegistration}
               onDeleteRegistration={props.onDeleteRegistration}
             />
          } />
          <Route path="/attendance" element={
             <MemberAttendanceManager
               activities={props.activities}
               members={props.members}
               attendance={props.attendance}
               onUpdateAttendance={props.onUpdateAttendance}
             />
          } />
          <Route path="/users" element={
             <UserManager 
               users={props.users} 
               onAddUser={props.onAddUser} 
               onDeleteUser={props.onDeleteUser}
               currentUser={props.currentUser}
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
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
