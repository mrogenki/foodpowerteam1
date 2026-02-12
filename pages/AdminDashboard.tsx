
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, ChevronRight, Search, FileDown, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, UserPlus, DollarSign, TrendingUp, BarChart3, Mail, User, Clock, Image as ImageIcon, UploadCloud, Loader2, Smartphone, Building2, Briefcase, Globe, FileUp, Download, ClipboardList, CheckSquare, AlertCircle, RotateCcw, MapPin, Filter, X, Eye, EyeOff, Ticket, Cake, CreditCard, Home, Hash, Crown } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { Activity, MemberActivity, Registration, MemberRegistration, ActivityType, AdminUser, UserRole, Member, AttendanceRecord, AttendanceStatus, Coupon, IndustryCategories } from '../types';

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
        <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><LayoutDashboard size={20} /><span>儀表板</span></Link>
        
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-600 uppercase">一般業務</div>
        <Link to="/admin/check-in" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin/check-in') ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}><Users size={20} /><span>一般活動報到</span></Link>
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

// 儀表板首頁元件
interface DashboardHomeProps {
  members: Member[];
  activities: Activity[];
  memberActivities: MemberActivity[];
  registrations: Registration[];
  memberRegistrations: MemberRegistration[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ members, activities, memberActivities, registrations, memberRegistrations }) => {
  // Stats Calculation
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
    activities.filter(a => a.status !== 'closed').length + 
    memberActivities.filter(a => a.status !== 'closed').length;

  // Combine and sort registrations
  const recentRegs = [
    ...registrations.map(r => ({ ...r, type: 'general', display_name: r.name })),
    ...memberRegistrations.map(r => ({ ...r, type: 'member', display_name: r.member_name }))
  ]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">儀表板概覽</h1>
        <p className="text-gray-500">歡迎回到管理系統，以下是目前的營運狀況。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">總會員數</p>
              <h3 className="text-2xl font-bold text-gray-900">{members.length}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">活躍 {activeMembers}</span>
            <span className="text-gray-400">失效 {members.length - activeMembers}</span>
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">進行中活動</p>
               <h3 className="text-2xl font-bold text-gray-900">{upcomingActivitiesCount}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
             <span>一般 {activities.filter(a => a.status!=='closed').length}</span>
             <span>會員 {memberActivities.filter(a => a.status!=='closed').length}</span>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">總報名數</p>
               <h3 className="text-2xl font-bold text-gray-900">{registrations.length + memberRegistrations.length}</h3>
            </div>
          </div>
           <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
             累積人次 (含歷史資料)
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">累積營收</p>
               <h3 className="text-2xl font-bold text-gray-900">NT$ {totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
             包含所有活動款項
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Clock size={20} className="text-gray-400"/> 最新報名動態</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentRegs.map((reg, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${reg.type === 'member' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                       {reg.display_name ? reg.display_name[0] : 'U'}
                    </div>
                    <div>
                       <p className="font-bold text-gray-900 text-sm">{reg.display_name}</p>
                       <p className="text-xs text-gray-500">{new Date(reg.created_at).toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${reg.type === 'member' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                       {reg.type === 'member' ? '會員報名' : '一般報名'}
                    </span>
                 </div>
              </div>
          ))}
          {recentRegs.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">尚無報名資料</div>}
        </div>
      </div>
    </div>
  );
};

// 通用活動編輯器 (共用於一般與會員活動)
const ActivityEditor: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | MemberActivity | null;
  onSave: (data: any) => void;
  onUploadImage: (file: File) => Promise<string>;
  title: string;
}> = ({ isOpen, onClose, activity, onSave, onUploadImage, title }) => {
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activity) setFormData(activity);
    else setFormData({ type: ActivityType.GATHERING, status: 'active' });
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: activity ? activity.id : Date.now().toString() });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setFormData((prev: any) => ({ ...prev, picture: url }));
    } catch { alert('上傳失敗'); } finally { setUploading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">{activity ? '編輯' : '新增'}{title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold mb-1">活動類型</label><select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ActivityType})}>{Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-bold mb-1">狀態</label><select className="w-full border rounded p-2" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="active">進行中</option><option value="closed">已結束</option></select></div>
          </div>
          <div><label className="block text-sm font-bold mb-1">活動標題</label><input required className="w-full border rounded p-2" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold mb-1">日期</label><input type="date" required className="w-full border rounded p-2" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div><label className="block text-sm font-bold mb-1">時間</label><input type="time" required className="w-full border rounded p-2" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-bold mb-1">地點</label><input required className="w-full border rounded p-2" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
          <div><label className="block text-sm font-bold mb-1">價格</label><input type="number" required className="w-full border rounded p-2" value={formData.price || 0} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} /></div>
          <div><label className="block text-sm font-bold mb-1">封面圖片</label><input type="file" onChange={handleFileChange} className="mb-2" />{uploading && <span className="text-sm text-red-500">上傳中...</span>}{formData.picture && <img src={formData.picture} alt="Preview" className="h-20 rounded" />}</div>
          <div><label className="block text-sm font-bold mb-1">活動描述</label><textarea required className="w-full border rounded p-2 h-24" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-500">取消</button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded font-bold">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const GeneralActivityManager: React.FC<{
  activities: Activity[];
  onAdd: (act: Activity) => void;
  onUpdate: (act: Activity) => void;
  onDelete: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
}> = ({ activities, onAdd, onUpdate, onDelete, onUploadImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">一般活動管理</h1><button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={18} /> 新增活動</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(act => (
          <div key={act.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group">
            <div className="relative h-48"><img src={act.picture} alt={act.title} className="w-full h-full object-cover" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">{act.status === 'closed' ? '已結束' : '進行中'}</div></div>
            <div className="p-4"><h3 className="font-bold text-lg mb-2 truncate">{act.title}</h3><div className="text-sm text-gray-500 space-y-1 mb-4"><p>{act.date} {act.time}</p><p className="truncate">{act.location}</p></div><div className="flex justify-end gap-2 border-t pt-3"><button onClick={() => { setEditing(act); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Edit size={18} /></button><button onClick={() => { if(window.confirm('確定刪除？')) onDelete(act.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div></div>
          </div>
        ))}
      </div>
      <ActivityEditor isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} activity={editing} onSave={(data) => editing ? onUpdate(data) : onAdd(data)} onUploadImage={onUploadImage} title="一般活動" />
    </div>
  );
};

const MemberActivityManager: React.FC<{
  activities: MemberActivity[];
  onAdd: (act: MemberActivity) => void;
  onUpdate: (act: MemberActivity) => void;
  onDelete: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
}> = ({ activities, onAdd, onUpdate, onDelete, onUploadImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<MemberActivity | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">會員活動管理</h1><button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={18} /> 新增活動</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(act => (
          <div key={act.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group">
            <div className="relative h-48"><img src={act.picture} alt={act.title} className="w-full h-full object-cover" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">{act.status === 'closed' ? '已結束' : '進行中'}</div><div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Crown size={12} /> 會員限定</div></div>
            <div className="p-4"><h3 className="font-bold text-lg mb-2 truncate">{act.title}</h3><div className="text-sm text-gray-500 space-y-1 mb-4"><p>{act.date} {act.time}</p><p className="truncate">{act.location}</p></div><div className="flex justify-end gap-2 border-t pt-3"><button onClick={() => { setEditing(act); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Edit size={18} /></button><button onClick={() => { if(window.confirm('確定刪除？')) onDelete(act.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div></div>
          </div>
        ))}
      </div>
      <ActivityEditor isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} activity={editing} onSave={(data) => editing ? onUpdate(data) : onAdd(data)} onUploadImage={onUploadImage} title="會員活動" />
    </div>
  );
};

const GeneralCheckInManager: React.FC<{
  activities: Activity[];
  registrations: Registration[];
  onUpdateRegistration: (reg: Registration) => void;
  onDeleteRegistration: (id: string | number) => void;
}> = ({ activities, registrations, onUpdateRegistration, onDeleteRegistration }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  useEffect(() => { if (activities.length > 0 && !selectedActivityId) setSelectedActivityId(String(activities[0].id)); }, [activities]);
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = registrations.filter(r => String(r.activityId) === selectedActivityId && (r.name.includes(searchTerm) || r.phone.includes(searchTerm)));
  const stats = { total: filtered.length, checkedIn: filtered.filter(r => r.check_in_status).length, paid: filtered.reduce((acc, r) => acc + (r.paid_amount || 0), 0) };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">一般活動報到</h1></div>
        <select value={selectedActivityId} onChange={e => setSelectedActivityId(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 bg-white font-bold text-gray-700 min-w-[200px]">{activities.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}</select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase">報到進度</p><div className="flex items-end gap-2 mt-1"><span className="text-2xl font-bold text-gray-800">{stats.checkedIn}</span><span className="text-sm text-gray-400 mb-1">/ {stats.total} 人</span></div></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase">已收金額</p><p className="text-2xl font-bold text-red-600 mt-1">NT$ {stats.paid.toLocaleString()}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4"><div className="relative flex-grow max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="搜尋姓名或電話..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none" /></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 font-bold"><tr><th className="px-6 py-4">姓名</th><th className="px-6 py-4">聯絡資訊</th><th className="px-6 py-4">公司職稱</th><th className="px-6 py-4">繳費金額</th><th className="px-6 py-4">報到狀態</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody className="divide-y divide-gray-50">{filtered.map(reg => (<tr key={reg.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold text-gray-900">{reg.name}</td><td className="px-6 py-4 text-gray-500"><div>{reg.phone}</div><div className="text-xs">{reg.email}</div></td><td className="px-6 py-4 text-gray-500"><div>{reg.company}</div><div className="text-xs">{reg.title}</div></td><td className="px-6 py-4"><PaidAmountInput value={reg.paid_amount} onSave={(val) => onUpdateRegistration({...reg, paid_amount: val})} /></td><td className="px-6 py-4"><button onClick={() => onUpdateRegistration({...reg, check_in_status: !reg.check_in_status})} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${reg.check_in_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{reg.check_in_status ? '已報到' : '未報到'}</button></td><td className="px-6 py-4 text-right"><button onClick={() => { if(window.confirm('確定刪除此報名紀錄？')) onDeleteRegistration(reg.id); }} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
};

const MemberCheckInManager: React.FC<{
  activities: MemberActivity[];
  registrations: MemberRegistration[];
  members: Member[];
  onUpdateRegistration: (reg: MemberRegistration) => void;
  onDeleteRegistration: (id: string | number) => void;
}> = ({ activities, registrations, members, onUpdateRegistration, onDeleteRegistration }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  useEffect(() => { if (activities.length > 0 && !selectedActivityId) setSelectedActivityId(String(activities[0].id)); }, [activities]);
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = registrations.filter(r => String(r.activityId) === selectedActivityId && (r.member_name.includes(searchTerm)));
  const stats = { total: filtered.length, checkedIn: filtered.filter(r => r.check_in_status).length, paid: filtered.reduce((acc, r) => acc + (r.paid_amount || 0), 0) };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">會員活動報到</h1></div>
        <select value={selectedActivityId} onChange={e => setSelectedActivityId(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 bg-white font-bold text-gray-700 min-w-[200px]">{activities.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}</select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase">會員出席</p><div className="flex items-end gap-2 mt-1"><span className="text-2xl font-bold text-gray-800">{stats.checkedIn}</span><span className="text-sm text-gray-400 mb-1">/ {stats.total} 人</span></div></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase">已收金額</p><p className="text-2xl font-bold text-red-600 mt-1">NT$ {stats.paid.toLocaleString()}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4"><div className="relative flex-grow max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="搜尋會員姓名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none" /></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 font-bold"><tr><th className="px-6 py-4">姓名 / 品牌</th><th className="px-6 py-4">職稱</th><th className="px-6 py-4">繳費金額</th><th className="px-6 py-4">出席狀態</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody className="divide-y divide-gray-50">{filtered.map(reg => {
          const member = members.find(m => String(m.id) === String(reg.memberId));
          return (
            <tr key={reg.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="font-bold text-gray-900">{reg.member_name}</div><div className="text-gray-500 text-xs">{member?.brand_name || member?.company}</div></td><td className="px-6 py-4 text-gray-600">{member?.job_title || '-'}</td><td className="px-6 py-4"><PaidAmountInput value={reg.paid_amount} onSave={(val) => onUpdateRegistration({...reg, paid_amount: val})} /></td><td className="px-6 py-4"><button onClick={() => onUpdateRegistration({...reg, check_in_status: !reg.check_in_status})} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${reg.check_in_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{reg.check_in_status ? '已出席' : '未出席'}</button></td><td className="px-6 py-4 text-right"><button onClick={() => { if(window.confirm('確定刪除此報名紀錄？')) onDeleteRegistration(reg.id); }} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16} /></button></td></tr>
          );
        })}</tbody></table></div>
      </div>
    </div>
  );
};

const UserManager: React.FC<{ users: AdminUser[]; onAddUser: (user: AdminUser) => void; onDeleteUser: (id: string) => void; currentUser: AdminUser; }> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminUser>>({ role: UserRole.STAFF });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAddUser({ id: Date.now().toString(), name: formData.name!, phone: formData.phone!, password: formData.password!, role: formData.role! }); setIsModalOpen(false); setFormData({ role: UserRole.STAFF }); };
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">權限管理</h1><button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><UserPlus size={18} /> 新增人員</button></div>
       <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left"><thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-bold"><tr><th className="px-6 py-4">姓名</th><th className="px-6 py-4">電話</th><th className="px-6 py-4">角色</th><th className="px-6 py-4 text-right">操作</th></tr></thead>
             <tbody className="divide-y divide-gray-50">{users.map(user => (<tr key={user.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold">{user.name}</td><td className="px-6 py-4 text-gray-500">{user.phone}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-600' : user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span></td><td className="px-6 py-4 text-right">{user.id !== currentUser.id && user.role !== UserRole.SUPER_ADMIN && (<button onClick={() => { if(window.confirm('確定刪除？')) onDeleteUser(user.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>)}</td></tr>))}</tbody>
          </table>
       </div>
       {isModalOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"><h2 className="text-xl font-bold mb-4">新增管理人員</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-bold mb-1">姓名</label><input required className="w-full border rounded p-2" onChange={e => setFormData({...formData, name: e.target.value})} /></div><div><label className="block text-sm font-bold mb-1">電話 (帳號)</label><input required className="w-full border rounded p-2" onChange={e => setFormData({...formData, phone: e.target.value})} /></div><div><label className="block text-sm font-bold mb-1">密碼</label><input required type="password" className="w-full border rounded p-2" onChange={e => setFormData({...formData, password: e.target.value})} /></div><div><label className="block text-sm font-bold mb-1">權限角色</label><select className="w-full border rounded p-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}><option value={UserRole.STAFF}>{UserRole.STAFF}</option><option value={UserRole.MANAGER}>{UserRole.MANAGER}</option></select></div><div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded text-gray-500 font-bold">取消</button><button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded font-bold">新增</button></div></form></div></div>)}
    </div>
  );
};

const CouponManager: React.FC<{ activities: Activity[]; members: Member[]; coupons: Coupon[]; onGenerateCoupons?: (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => void; }> = ({ activities, members, coupons, onGenerateCoupons }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id as string || '');
  const [amount, setAmount] = useState(100);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const currentActivity = activities.find(a => String(a.id) === selectedActivityId);
  const handleGenerate = () => { if (!currentActivity || !onGenerateCoupons) return; if (selectedMemberIds.length === 0) { alert('請至少選擇一位會員'); return; } if (window.confirm(`確定發送給 ${selectedMemberIds.length} 位會員？`)) { onGenerateCoupons(selectedActivityId, amount, selectedMemberIds, sendEmail); setSelectedMemberIds([]); } };
  const toggleAllMembers = () => { if (selectedMemberIds.length === members.length) setSelectedMemberIds([]); else setSelectedMemberIds(members.map(m => String(m.id))); };
  const filteredCoupons = coupons.filter(c => String(c.activity_id) === selectedActivityId);
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">折扣券派發 (僅一般活動)</h1><select value={selectedActivityId} onChange={e => setSelectedActivityId(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 bg-white font-bold text-gray-700 min-w-[200px]">{activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
       {currentActivity ? (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="space-y-6"><div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Ticket size={20} className="text-red-600"/> 設定折扣內容</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">折扣金額</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full pl-8 pr-4 py-2 border rounded-lg font-bold text-lg" /></div></div><div className="flex items-center gap-2"><input type="checkbox" id="emailChk" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="w-4 h-4 text-red-600 rounded" /><label htmlFor="emailChk" className="text-sm font-bold text-gray-700 select-none">同時寄送 Email 通知</label></div><button onClick={handleGenerate} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">產生並發送 ({selectedMemberIds.length} 人)</button></div></div><div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">發送紀錄 ({filteredCoupons.length})</h3><button onClick={() => setShowHistory(!showHistory)} className="text-sm text-blue-600 font-bold hover:underline">{showHistory ? '收起' : '展開詳細'}</button></div>{showHistory && (<div className="max-h-60 overflow-y-auto space-y-2">{filteredCoupons.map(c => { const m = members.find(mem => String(mem.id) === String(c.member_id)); return (<div key={c.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"><span>{m?.name || '未知會員'}</span><span className="font-mono text-gray-500">{c.code}</span><span className={`text-xs px-1.5 py-0.5 rounded ${c.is_used ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{c.is_used ? '已使用' : '未使用'}</span></div>); })}</div>)}</div></div><div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col max-h-[600px]"><div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold">選擇發送對象</h3><button onClick={toggleAllMembers} className="text-xs font-bold text-red-600 border border-red-200 bg-white px-3 py-1 rounded-full hover:bg-red-50">{selectedMemberIds.length === members.length ? '取消全選' : '全選'}</button></div><div className="overflow-y-auto p-2 flex-grow">{members.map(m => { const isSelected = selectedMemberIds.includes(String(m.id)); return (<div key={m.id} onClick={() => { if (isSelected) setSelectedMemberIds(ids => ids.filter(id => id !== String(m.id))); else setSelectedMemberIds(ids => [...ids, String(m.id)]); }} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${isSelected ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-50 border border-transparent'}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300 bg-white'}`}>{isSelected && <CheckCircle size={14} className="text-white" />}</div><div><div className="font-bold text-sm text-gray-900">{m.name}</div><div className="text-xs text-gray-400">{m.brand_name || m.company}</div></div></div>); })}</div></div></div>) : (<div className="text-center py-20 text-gray-400">請先建立活動</div>)}
    </div>
  );
};

const MemberManager: React.FC<{ members: Member[]; onAddMember: (m: Member) => void; onUpdateMember: (m: Member) => void; onDeleteMember: (id: string | number) => void; onAddMembers?: (ms: Member[]) => void; }> = ({ members, onAddMember, onUpdateMember, onDeleteMember, onAddMembers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'membership' | 'personal' | 'business'>('membership');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateMemberNo = () => { const today = new Date(); const dateStr = today.toISOString().slice(0,10).replace(/-/g, ''); const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); return `M${dateStr}${random}`; };
  const openModal = (member?: Member) => { if (member) { setEditingMember(member); setFormData(member); } else { setEditingMember(null); setFormData({ status: 'active', industry_category: '餐飲服務', member_no: generateMemberNo() }); } setActiveTab('membership'); setIsModalOpen(true); };
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    let finalStatus = formData.status || 'active'; 
    
    // 修正邏輯：如果設定了未來的到期日，強制將狀態改為 active
    // 避免使用者只改了日期但忘記改狀態，導致會員仍顯示失效
    if (formData.membership_expiry_date) { 
      const today = new Date().toISOString().slice(0, 10); 
      if (formData.membership_expiry_date < today) { 
        finalStatus = 'inactive'; 
      } else {
        // 日期有效，強制設為 active (除非有特殊需求要手動 ban，但為了方便操作先設為 active)
        finalStatus = 'active';
      }
    } 

    const newMember: Member = { id: editingMember?.id || Date.now().toString(), status: finalStatus as any, membership_expiry_date: formData.membership_expiry_date, notes: formData.notes, payment_records: formData.payment_records, member_no: formData.member_no || generateMemberNo(), name: formData.name || '', id_number: formData.id_number, birthday: formData.birthday, phone: formData.phone, email: formData.email, address: formData.address, home_phone: formData.home_phone, referrer: formData.referrer, industry_category: formData.industry_category || '其他', brand_name: formData.brand_name, company_title: formData.company_title, tax_id: formData.tax_id, job_title: formData.job_title, main_service: formData.main_service, website: formData.website, company: formData.brand_name || formData.company_title || '', intro: formData.main_service || '', }; if (editingMember) { onUpdateMember(newMember); } else { onAddMember(newMember); } setIsModalOpen(false); 
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!onAddMembers) return; const file = e.target.files?.[0]; if (!file) return; try { const data = await file.arrayBuffer(); const workbook = XLSX.read(data); const sheetName = workbook.SheetNames[0]; const sheet = workbook.Sheets[sheetName]; const jsonData = XLSX.utils.sheet_to_json(sheet); const fieldMap: Record<string, keyof Member> = { '會員編號': 'member_no', '姓名': 'name', '中文姓名': 'name', '狀態': 'status', '會籍到期日': 'membership_expiry_date', '備註': 'notes', '會籍繳費記錄': 'payment_records', '身分證': 'id_number', '身分證字號': 'id_number', '生日': 'birthday', '手機': 'phone', '信箱': 'email', 'Email': 'email', '地址': 'address', '通訊地址': 'address', '室內電話': 'home_phone', '引薦人': 'referrer', '產業分類': 'industry_category', '品牌名稱': 'brand_name', '公司抬頭': 'company_title', '統編': 'tax_id', '統一編號': 'tax_id', '職稱': 'job_title', '主要服務': 'main_service', '主要服務/產品': 'main_service', '網站': 'website' }; const normalizeIndustryCategory = (input: any): string => { const s = String(input || '').trim(); if (s.includes('餐飲服務')) return '餐飲服務'; if (s.includes('美食產品')) return '美食產品'; if (s.includes('通路行銷')) return '通路行銷'; if (s.includes('營運協作') || s.includes('營運寫作')) return '營運協作'; if (s.includes('原物料')) return '原物料'; if (s.includes('加工製造')) return '加工製造'; if (IndustryCategories.includes(s as any)) return s; return '其他'; }; const importedMembers: Member[] = jsonData.map((row: any) => { const member: any = { id: crypto.randomUUID(), status: 'active', industry_category: '其他' }; Object.keys(row).forEach(key => { const mappedKey = fieldMap[key] || fieldMap[key.trim()]; if (mappedKey) { member[mappedKey] = row[key]; } }); if (member.industry_category) { member.industry_category = normalizeIndustryCategory(member.industry_category); } if (!member.member_no) member.member_no = `TMP${Math.floor(Math.random()*10000)}`; if (!member.name) member.name = '未命名匯入'; member.company = member.brand_name || member.company_title || ''; member.intro = member.main_service || ''; return member as Member; }); if (importedMembers.length > 0) { if (window.confirm(`解析成功！共 ${importedMembers.length} 筆資料。\n確定要匯入嗎？`)) { onAddMembers(importedMembers); setIsImportModalOpen(false); } } else { alert('檔案中沒有資料或格式無法辨識'); } } catch (err) { console.error(err); alert('檔案解析失敗'); } finally { if (fileInputRef.current) fileInputRef.current.value = ''; } };
  const handleExportExcel = () => { const dataToExport = members.map(m => ({ '會員編號': m.member_no, '姓名': m.name, '狀態': m.status === 'active' ? '活躍' : '失效', '會籍到期日': m.membership_expiry_date || '', '產業分類': m.industry_category, '品牌名稱': m.brand_name || '', '公司抬頭': m.company_title || '', '統編': m.tax_id || '', '職稱': m.job_title || '', '手機': m.phone || '', 'Email': m.email || '', '地址': m.address || '', '身分證字號': m.id_number || '', '生日': m.birthday || '', '室內電話': m.home_phone || '', '引薦人': m.referrer || '', '網站': m.website || '', '主要服務': m.main_service || '', '備註': m.notes || '', '繳費紀錄': m.payment_records || '' })); const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "會員名單"); XLSX.writeFile(wb, `會員名單匯出_${new Date().toISOString().slice(0,10)}.xlsx`); };
  const filteredMembers = members.filter(m => m.name.includes(searchTerm) || (m.brand_name && m.brand_name.includes(searchTerm)) || (m.company && m.company.includes(searchTerm)) || (m.member_no && String(m.member_no).includes(searchTerm)));
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900">會員資料管理</h1><div className="flex gap-2"><button onClick={handleExportExcel} className="bg-green-600 text-white border border-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"><FileDown size={18} /> 匯出 Excel</button>{onAddMembers && (<button onClick={() => setIsImportModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 flex items-center gap-2"><UploadCloud size={18} /> 匯入 Excel/CSV</button>)}<button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={18} /> 新增會員</button></div></div>
       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-100 bg-gray-50/50"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="搜尋編號、姓名、品牌..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none" /></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 font-bold"><tr><th className="px-6 py-4">No.</th><th className="px-6 py-4">姓名 / 品牌</th><th className="px-6 py-4">產業分類</th><th className="px-6 py-4">狀態</th><th className="px-6 py-4">到期日</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody className="divide-y divide-gray-50">{filteredMembers.map(m => { 
         // 顯示邏輯修正：如果有到期日且大於等於今天，視為有效，不再單純看 status
         const hasValidDate = m.membership_expiry_date && m.membership_expiry_date >= new Date().toISOString().slice(0, 10);
         const isEffectivelyActive = hasValidDate || (m.status === 'active' && !m.membership_expiry_date);
         
         return (<tr key={m.id} className={`hover:bg-gray-50 ${!isEffectivelyActive ? 'bg-gray-50 opacity-60' : ''}`}><td className="px-6 py-4 font-mono text-gray-400">{m.member_no}</td><td className="px-6 py-4"><div className="font-bold text-gray-900">{m.name}</div><div className="text-gray-500 text-xs">{m.brand_name || m.company}</div></td><td className="px-6 py-4"><span className="px-2 py-1 rounded bg-gray-100 text-xs font-bold text-gray-600">{m.industry_category}</span></td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${isEffectivelyActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{isEffectivelyActive ? '活躍' : '失效'}</span></td><td className="px-6 py-4 text-gray-500 font-mono">{m.membership_expiry_date || '-'}</td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openModal(m)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Edit size={16} /></button><button onClick={() => { if(window.confirm('確定刪除此會員資料？')) onDeleteMember(m.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td></tr>)})}</tbody></table></div></div>
       {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h2 className="text-xl font-bold text-gray-800">{editingMember ? '編輯會員資料卡' : '新增會員資料卡'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                   <button 
                     onClick={() => setActiveTab('membership')}
                     className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'membership' ? 'border-b-2 border-red-600 text-red-600 bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                   >
                     <CreditCard size={18} /> 會籍管理
                   </button>
                   <button 
                     onClick={() => setActiveTab('personal')}
                     className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'personal' ? 'border-b-2 border-red-600 text-red-600 bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                   >
                     <User size={18} /> 個人資料
                   </button>
                   <button 
                     onClick={() => setActiveTab('business')}
                     className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'business' ? 'border-b-2 border-red-600 text-red-600 bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                   >
                     <Building2 size={18} /> 事業資料
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                   <form id="memberForm" onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* 會籍管理 Tab */}
                      {activeTab === 'membership' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                                <CreditCard size={18} className="text-red-600"/> 會籍狀態
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">會籍狀態</label>
                                    <select 
                                      value={formData.status} 
                                      onChange={e => setFormData({...formData, status: e.target.value as any})} 
                                      className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                       <option value="active">活躍 (Active)</option>
                                       <option value="inactive">失效/停權 (Inactive)</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">* 系統將依據「到期日」自動判斷，若日期有效則視為活躍。</p>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">會籍到期日</label>
                                    <input 
                                      type="date" 
                                      value={formData.membership_expiry_date || ''} 
                                      onChange={e => setFormData({...formData, membership_expiry_date: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">會籍繳費記錄</label>
                                 <textarea 
                                   value={formData.payment_records || ''} 
                                   onChange={e => setFormData({...formData, payment_records: e.target.value})} 
                                   className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                                   placeholder="例如：2024/01/01 繳交年費 $3000..."
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">備註</label>
                                 <textarea 
                                   value={formData.notes || ''} 
                                   onChange={e => setFormData({...formData, notes: e.target.value})} 
                                   className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                                 />
                              </div>
                           </div>
                        </div>
                      )}

                      {/* 個人資料 Tab */}
                      {activeTab === 'personal' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                                <User size={18} className="text-red-600"/> 基本資料
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">會員編號 (系統產生)</label>
                                    <input 
                                      value={formData.member_no || ''} 
                                      readOnly
                                      className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 font-mono cursor-not-allowed" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">中文姓名 <span className="text-red-500">*</span></label>
                                    <input 
                                      required 
                                      value={formData.name || ''} 
                                      onChange={e => setFormData({...formData, name: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">身分證字號</label>
                                    <input 
                                      value={formData.id_number || ''} 
                                      onChange={e => setFormData({...formData, id_number: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 uppercase" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">生日</label>
                                    <input 
                                      type="date"
                                      value={formData.birthday || ''} 
                                      onChange={e => setFormData({...formData, birthday: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                                <Smartphone size={18} className="text-red-600"/> 聯絡方式
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">手機</label>
                                    <input 
                                      type="tel"
                                      value={formData.phone || ''} 
                                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">信箱 (接收優惠券)</label>
                                    <input 
                                      type="email"
                                      value={formData.email || ''} 
                                      onChange={e => setFormData({...formData, email: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">室內電話</label>
                                    <input 
                                      value={formData.home_phone || ''} 
                                      onChange={e => setFormData({...formData, home_phone: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">引薦人</label>
                                    <input 
                                      value={formData.referrer || ''} 
                                      onChange={e => setFormData({...formData, referrer: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">通訊地址</label>
                                    <input 
                                      value={formData.address || ''} 
                                      onChange={e => setFormData({...formData, address: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}

                      {/* 事業資料 Tab */}
                      {activeTab === 'business' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                                <Building2 size={18} className="text-red-600"/> 公司資訊
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">產業分類 <span className="text-red-500">*</span></label>
                                    <select 
                                      value={formData.industry_category} 
                                      onChange={e => setFormData({...formData, industry_category: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                       {IndustryCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">品牌名稱</label>
                                    <input 
                                      value={formData.brand_name || ''} 
                                      onChange={e => setFormData({...formData, brand_name: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">公司抬頭</label>
                                    <input 
                                      value={formData.company_title || ''} 
                                      onChange={e => setFormData({...formData, company_title: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">統一編號</label>
                                    <input 
                                      value={formData.tax_id || ''} 
                                      onChange={e => setFormData({...formData, tax_id: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 font-mono" 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">職稱</label>
                                    <input 
                                      value={formData.job_title || ''} 
                                      onChange={e => setFormData({...formData, job_title: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                    />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">主要服務/產品</label>
                                    <textarea 
                                      value={formData.main_service || ''} 
                                      onChange={e => setFormData({...formData, main_service: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                                    />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">網站</label>
                                    <input 
                                      value={formData.website || ''} 
                                      onChange={e => setFormData({...formData, website: e.target.value})} 
                                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" 
                                      placeholder="https://..."
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                   </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors">取消</button>
                   <button type="submit" form="memberForm" className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all">確認儲存</button>
                </div>
             </div>
          </div>
       )}
       {isImportModalOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl"><h2 className="text-xl font-bold mb-4">大量匯入會員</h2><div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 cursor-pointer group"><input ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><UploadCloud size={24} className="mx-auto mb-2 text-gray-400" /><p className="font-bold text-gray-700">點擊或拖曳檔案至此</p></div><div className="flex justify-end mt-6"><button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 border rounded-lg font-bold text-gray-500 hover:bg-gray-50">取消</button></div></div></div>)}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={props.currentUser} onLogout={props.onLogout} />
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome 
             members={props.members} 
             activities={props.activities} 
             memberActivities={props.memberActivities} 
             registrations={props.registrations} 
             memberRegistrations={props.memberRegistrations}
          />} />
          <Route path="/activities" element={<GeneralActivityManager activities={props.activities} onAdd={props.onAddActivity} onUpdate={props.onUpdateActivity} onDelete={props.onDeleteActivity} onUploadImage={props.onUploadImage} />} />
          <Route path="/check-in" element={<GeneralCheckInManager activities={props.activities} registrations={props.registrations} onUpdateRegistration={props.onUpdateRegistration} onDeleteRegistration={props.onDeleteRegistration} />} />
          <Route path="/member-activities" element={<MemberActivityManager activities={props.memberActivities} onAdd={props.onAddMemberActivity} onUpdate={props.onUpdateMemberActivity} onDelete={props.onDeleteMemberActivity} onUploadImage={props.onUploadImage} />} />
          <Route path="/member-check-in" element={<MemberCheckInManager activities={props.memberActivities} registrations={props.memberRegistrations} members={props.members} onUpdateRegistration={props.onUpdateMemberRegistration} onDeleteRegistration={props.onDeleteMemberRegistration} />} />
          <Route path="/members" element={<MemberManager members={props.members} onAddMember={props.onAddMember} onUpdateMember={props.onUpdateMember} onDeleteMember={props.onDeleteMember} onAddMembers={props.onAddMembers} />} />
          <Route path="/users" element={<UserManager users={props.users} onAddUser={props.onAddUser} onDeleteUser={props.onDeleteUser} currentUser={props.currentUser} />} />
          <Route path="/coupons" element={<CouponManager activities={props.activities} members={props.members} coupons={props.coupons} onGenerateCoupons={props.onGenerateCoupons} />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
