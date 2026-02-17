
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, Loader2, Database, AlertTriangle, Save, Key, Globe, UserPlus, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MemberList from './pages/MemberList';
import MemberJoin from './pages/MemberJoin'; // Import MemberJoin
import PaymentResult from './pages/PaymentResult'; // Import PaymentResult
import { Activity, MemberActivity, Registration, MemberRegistration, AdminUser, Member, AttendanceRecord, AttendanceStatus, Coupon, MemberApplication } from './types';
import { INITIAL_ACTIVITIES, INITIAL_ADMINS, INITIAL_MEMBERS, EMAIL_CONFIG } from './constants';

// Supabase 設定
const DEFAULT_URL = 'https://kpltydyspvzozgxfiwra.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbHR5ZHlzcHZ6b3pneGZpd3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjI0MTUsImV4cCI6MjA4NjEzODQxNX0.1jraR6m6sKWSUJxek2noJi0YqyO3Ak4kPZ-X2qdwtGA';

const getConfig = (envKey: string, storageKey: string, defaultValue: string): string => {
  try {
    const envVal = (import.meta as any)?.env?.[envKey];
    if (envVal) return envVal;
  } catch (e) {}
  const storageVal = localStorage.getItem(storageKey);
  if (storageVal) return storageVal;
  return defaultValue;
};

const SUPABASE_URL = getConfig('VITE_SUPABASE_URL', 'supabase_url', DEFAULT_URL);
const SUPABASE_ANON_KEY = getConfig('VITE_SUPABASE_ANON_KEY', 'supabase_key', DEFAULT_KEY);

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold">食</div>
              <span className="text-xl font-bold tracking-tight">食在力量活動&會員</span>
            </Link>
          </div>
          <div className="hidden sm:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium">活動首頁</Link>
            <Link to="/members" className="text-gray-700 hover:text-red-600 transition-colors font-medium">會員列表</Link>
            <Link to="/join" className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-red-700 shadow-md shadow-red-100 transition-all"><UserPlus size={16} /> 加入會員</Link>
            <Link to="/admin" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-full text-sm font-bold">後台管理</Link>
          </div>
          <div className="sm:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-red-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden bg-white border-t px-4 py-3 space-y-3 shadow-lg">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 font-bold">活動首頁</Link>
          <Link to="/members" onClick={() => setIsOpen(false)} className="block text-gray-700 font-bold">會員列表</Link>
          <Link to="/join" onClick={() => setIsOpen(false)} className="block text-red-600 font-bold">加入會員</Link>
          <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-gray-500 text-sm font-bold">後台管理</Link>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return (
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold">食</div>
              <span className="font-bold text-gray-800 tracking-wider text-lg">食在力量</span>
            </div>
            <p className="text-gray-400 text-sm">&copy; 2026 食在力量活動報名系統 v2.0.<br/>All rights reserved.</p>
          </div>

          {/* LINE Join Section */}
          <div className="flex flex-col items-center md:items-end">
             <div className="bg-[#06C755]/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-[#06C755]/20 hover:bg-[#06C755]/10 transition-colors">
                <div className="text-center sm:text-left">
                   <h3 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2 mb-2">
                     <MessageCircle className="text-[#06C755]" />
                     <span className="text-[#06C755]">官方 LINE 帳號</span>
                   </h3>
                   <p className="text-sm text-gray-600 mb-4">加入好友，掌握最新活動資訊<br/>與產業動態！</p>
                   <a 
                     href="https://lin.ee/oIeFIMO" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b64d] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-100 hover:shadow-green-200"
                   >
                     <MessageCircle size={18} fill="currentColor" className="text-white/20" />
                     加入好友
                   </a>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm">
                   <img src="https://qr-official.line.me/gs/M_736bgkpm_BW.png?oat__id=6378179&oat_content=qr" alt="LINE QR Code" className="w-24 h-24" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SetupGuide: React.FC = () => {
  return <div>Setup Guide</div>; 
};

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [memberActivities, setMemberActivities] = useState<MemberActivity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [memberRegistrations, setMemberRegistrations] = useState<MemberRegistration[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberApplications, setMemberApplications] = useState<MemberApplication[]>([]); // 新增：會員申請
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  if (!supabase) {
    return <SetupGuide />;
  }

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setDbError(null);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      // 使用 Promise.all 平行載入所有資料，大幅減少等待時間
      const [
        { data: actData },
        { data: memActData },
        { data: regData },
        { data: memRegData },
        { data: userData },
        { data: memberData },
        { data: couponData },
        { data: applicationData } // 讀取申請資料
      ] = await Promise.all([
        supabase.from('activities').select('*').order('date', { ascending: true }),
        supabase.from('member_activities').select('*').order('date', { ascending: true }),
        supabase.from('registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('member_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('admins').select('*'),
        supabase.from('members').select('*'),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('member_applications').select('*').order('created_at', { ascending: false })
      ]);

      // 1. 一般活動
      if (actData && actData.length > 0) {
        setActivities(actData.map((a: any) => ({ ...a, status: a.status || 'active' })));
      } else {
         // Init if empty
         const { data: hasAny } = await supabase.from('activities').select('id').limit(1);
         if (!hasAny || hasAny.length === 0) {
            await supabase.from('activities').insert(INITIAL_ACTIVITIES);
            const { data: reload } = await supabase.from('activities').select('*');
            if (reload) setActivities(reload);
         }
      }

      // 2. 會員活動
      if (memActData) setMemberActivities(memActData.map((a: any) => ({ ...a, status: a.status || 'active' })));

      // 3. 一般報名
      if (regData) setRegistrations(regData);

      // 4. 會員報名
      if (memRegData) setMemberRegistrations(memRegData);
      
      // 5. 管理員
      if (userData && userData.length > 0) setUsers(userData);
      else {
         const { data: inserted } = await supabase.from('admins').insert(INITIAL_ADMINS).select();
         if (inserted) setUsers(inserted);
      }

      // 6. 會員
      if (memberData && memberData.length > 0) {
        const sortedMembers = memberData.sort((a: any, b: any) => {
          const valA = String(a.member_no || '');
          const valB = String(b.member_no || '');
          if (!valA && !valB) return 0;
          if (!valA) return 1;
          if (!valB) return -1;
          return valA.localeCompare(valB, undefined, { numeric: true });
        });
        setMembers(sortedMembers);
      } else {
         const { data: inserted } = await supabase.from('members').insert(INITIAL_MEMBERS).select();
         if (inserted) setMembers(inserted);
      }

      // 7. 折扣券
      if (couponData) setCoupons(couponData as Coupon[]);

      // 8. 會員申請
      if (applicationData) setMemberApplications(applicationData as MemberApplication[]);

    } catch (err: any) {
      console.error('Fetch error:', err);
      setDbError(err.message || '資料庫連線失敗');
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    sessionStorage.setItem('current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('current_user');
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!supabase) return '';
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `activity-covers/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('activity-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('activity-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error('File load failed'));
      });
    }
  };

  const validateCoupon = async (code: string, activityId: string): Promise<{valid: boolean, discount?: number, message: string, couponId?: string}> => {
    if (!supabase) return { valid: false, message: '系統連線錯誤' };
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).single();
    if (error || !data) return { valid: false, message: '無效的折扣碼' };
    if (String(data.activity_id) !== String(activityId)) return { valid: false, message: '此折扣碼不適用於本活動' };
    if (data.is_used) return { valid: false, message: '此折扣碼已被使用' };
    return { valid: true, discount: data.discount_amount, message: '折扣碼適用', couponId: data.id };
  };

  // CRUD Functions (General Activities)
  const handleUpdateActivity = async (updated: Activity) => {
    // Optimistic Update
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (!supabase) return;
    // 修正：包含 status 在內的完整資料更新，確保狀態變更寫入資料庫
    const { error } = await supabase.from('activities').update(updated).eq('id', updated.id);
    if (error) { 
      console.error(error); 
      fetchData(); // Revert on error
    }
  };
  const handleAddActivity = async (newAct: Activity) => {
    if (!supabase) return;
    
    // 自動產生 ID (若前端沒傳)
    const activityToInsert = {
      ...newAct,
      id: newAct.id || crypto.randomUUID()
    };

    const { error } = await supabase.from('activities').insert([activityToInsert]);
    if (!error) {
       fetchData();
    } else {
       console.error('新增活動失敗:', error);
       alert('新增活動失敗: ' + error.message);
    }
  };
  const handleDeleteActivity = async (id: string | number) => {
    // Optimistic Update
    setActivities(prev => prev.filter(a => a.id !== id));
    if (!supabase) return;
    await supabase.from('registrations').delete().eq('activityId', id);
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) fetchData();
  };

  // CRUD Functions (Member Activities)
  const handleUpdateMemberActivity = async (updated: MemberActivity) => {
    // Optimistic Update
    setMemberActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (!supabase) return;
    // 修正：包含 status 在內的完整資料更新，確保狀態變更寫入資料庫
    const { error } = await supabase.from('member_activities').update(updated).eq('id', updated.id);
    if (error) fetchData();
  };
  const handleAddMemberActivity = async (newAct: MemberActivity) => {
    if (!supabase) return;

    // 自動產生 ID
    const activityToInsert = {
      ...newAct,
      id: newAct.id || crypto.randomUUID()
    };

    const { error } = await supabase.from('member_activities').insert([activityToInsert]);
    if (!error) {
       fetchData();
    } else {
       console.error('新增會員活動失敗:', error);
       alert('新增會員活動失敗: ' + error.message);
    }
  };
  const handleDeleteMemberActivity = async (id: string | number) => {
    // Optimistic Update
    setMemberActivities(prev => prev.filter(a => a.id !== id));
    if (!supabase) return;
    await supabase.from('member_registrations').delete().eq('activityId', id);
    const { error } = await supabase.from('member_activities').delete().eq('id', id);
    if (error) fetchData();
  };

  // Registration Functions
  const handleRegister = async (newReg: Registration, couponId?: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('registrations').insert([newReg]);
    if (error) { alert('報名失敗：' + error.message); return false; }
    if (couponId) await supabase.from('coupons').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', couponId);
    await fetchData(); return true;
  };

  const handleMemberRegister = async (newReg: MemberRegistration, couponId?: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('member_registrations').insert([newReg]);
    if (error) { alert('會員報名失敗：' + error.message); return false; }
    if (couponId) await supabase.from('coupons').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', couponId);
    await fetchData(); return true;
  };

  // --- 優化重點：樂觀更新 (Optimistic UI) ---
  const handleUpdateRegistration = async (updated: Registration) => {
    // 1. 立即更新本地 UI (無延遲)
    setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));

    if (!supabase) return;
    // 2. 背景發送請求
    const { error } = await supabase.from('registrations').update(updated).eq('id', updated.id);
    
    // 3. 僅在錯誤時才回滾或重抓
    if (error) {
      console.error('Update registration failed:', error);
      fetchData(); 
      alert('更新失敗，請檢查網路連線');
    }
  };

  const handleDeleteRegistration = async (id: string | number) => {
    // 1. 立即從列表中移除 (無延遲)
    setRegistrations(prev => prev.filter(r => r.id !== id));

    if (!supabase) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      console.error('Delete registration failed:', error);
      fetchData();
    }
  };

  const handleUpdateMemberRegistration = async (updated: MemberRegistration) => {
    // 1. 立即更新本地 UI (無延遲)
    setMemberRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));

    if (!supabase) return;
    const { error } = await supabase.from('member_registrations').update(updated).eq('id', updated.id);
    if (error) {
      console.error('Update member registration failed:', error);
      fetchData();
      alert('更新失敗，請檢查網路連線');
    }
  };

  const handleDeleteMemberRegistration = async (id: string | number) => {
    // 1. 立即從列表中移除 (無延遲)
    setMemberRegistrations(prev => prev.filter(r => r.id !== id));

    if (!supabase) return;
    const { error } = await supabase.from('member_registrations').delete().eq('id', id);
    if (error) {
      console.error('Delete member registration failed:', error);
      fetchData();
    }
  };

  // User/Member Functions
  const handleAddUser = async (newUser: AdminUser) => { if (!supabase) return; await supabase.from('admins').insert([newUser]); fetchData(); };
  const handleDeleteUser = async (id: string) => { if (!supabase) return; await supabase.from('admins').delete().eq('id', id); fetchData(); };
  
  const handleAddMember = async (newMember: Member) => { 
    if (!supabase) return; 
    
    // 自動產生 UUID (若前端沒傳 ID)
    const memberToInsert = {
      ...newMember,
      id: newMember.id || crypto.randomUUID()
    };

    const { error } = await supabase.from('members').insert([memberToInsert]); 
    
    if (error) {
      console.error('Add member error:', error);
      alert('新增會員失敗：' + error.message);
    } else {
      fetchData(); 
    }
  };

  const handleUpdateMember = async (updated: Member) => { 
    if (!supabase) return; 
    const { error } = await supabase.from('members').update(updated).eq('id', updated.id); 
    if (error) {
       console.error('Update member error:', error);
       alert('更新會員失敗：' + error.message);
    } else {
       fetchData(); 
    }
  };

  const handleDeleteMember = async (id: string | number) => { 
    if (!supabase) return; 
    const { error } = await supabase.from('members').delete().eq('id', id); 
    if (error) {
       console.error('Delete member error:', error);
       alert('刪除會員失敗：' + error.message);
    } else {
       fetchData(); 
    }
  };

  const handleAddMembers = async (newMembers: Member[]) => {
    if (!supabase) return;
    setLoading(true);
    const ms = newMembers.map(m => ({ ...m, id: m.id ? String(m.id) : crypto.randomUUID() }));
    const { error } = await supabase.from('members').insert(ms);
    if (!error) { alert(`成功匯入 ${ms.length} 筆`); await fetchData(); } else alert(error.message);
    setLoading(false);
  };

  const handleGenerateCoupons = async (activityId: string, amount: number, memberIds: string[], sendEmail: boolean) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const coupons = memberIds.map(mid => ({
        activity_id: activityId,
        member_id: mid,
        discount_amount: amount,
        is_used: false,
        code: `ACT${activityId.slice(-3)}-M${mid.slice(-3)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      }));
      await supabase.from('coupons').insert(coupons);
      
      if (sendEmail && EMAIL_CONFIG.SERVICE_ID !== 'YOUR_NEW_SERVICE_ID') {
         // Email sending logic
      }

      alert(`成功產生 ${coupons.length} 張折扣券`);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // 處理核准會員申請
  const handleApproveMemberApplication = async (application: MemberApplication) => {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. 產生新的會員編號
      const { data: members, error: fetchError } = await supabase
        .from('members')
        .select('member_no');

      if (fetchError) throw fetchError;

      const maxNo = members?.reduce((max, m) => {
        const num = parseInt(m.member_no);
        return !isNaN(num) && num > max ? num : max;
      }, 0) || 0;
      const nextNo = (maxNo + 1).toString().padStart(5, '0');

      // 2. 轉換為正式會員資料
      const newMember = {
        id: crypto.randomUUID(), // 全新 ID
        member_no: nextNo,
        status: 'active',
        membership_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), // 預設一年
        join_date: new Date().toISOString().slice(0, 10),
        
        name: application.name,
        id_number: application.id_number,
        birthday: application.birthday,
        referrer: application.referrer,
        phone: application.phone,
        email: application.email,
        home_phone: application.home_phone,
        address: application.address,
        industry_category: application.industry_category,
        brand_name: application.brand_name,
        company_title: application.company_title,
        tax_id: application.tax_id,
        job_title: application.job_title,
        website: application.website,
        main_service: application.main_service,
        notes: application.notes
      };

      // 3. 寫入 Members 表
      const { error: insertError } = await supabase.from('members').insert([newMember]);
      if (insertError) throw insertError;

      // 4. 刪除申請資料 (或可選擇更新狀態為 approved)
      const { error: deleteError } = await supabase.from('member_applications').delete().eq('id', application.id);
      if (deleteError) throw deleteError;

      alert(`核准成功！\n已將 ${newMember.name} 加入會員資料庫。\n會員編號：${nextNo}`);
      await fetchData();

    } catch (error: any) {
      console.error('Approve failed:', error);
      alert('核准失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 處理刪除/拒絕會員申請
  const handleDeleteMemberApplication = async (id: string | number) => {
    if (!supabase) return;
    if (!confirm('確定要拒絕並刪除此申請資料？此動作無法復原。')) return;

    setLoading(true);
    try {
       const { error } = await supabase.from('member_applications').delete().eq('id', id);
       if (error) throw error;
       await fetchData();
    } catch (error: any) {
       console.error('Delete application failed:', error);
       alert('刪除失敗：' + error.message);
    } finally {
       setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-red-600" size={56} /></div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50/30">
          <Routes>
            <Route path="/" element={<Home activities={activities} memberActivities={memberActivities} />} />
            <Route path="/members" element={<MemberList members={members} />} />
            <Route path="/join" element={<MemberJoin />} /> {/* 新增加入會員路由 */}
            
            {/* 兩種活動詳情路由 */}
            <Route path="/activity/:id" element={<ActivityDetail type="general" activities={activities} onRegister={handleRegister} registrations={registrations} validateCoupon={validateCoupon} />} />
            <Route path="/member-activity/:id" element={<ActivityDetail type="member" activities={memberActivities} members={members} onMemberRegister={handleMemberRegister} memberRegistrations={memberRegistrations} validateCoupon={validateCoupon} />} />
            
            {/* Payment Result Route */}
            <Route path="/payment-result" element={<PaymentResult />} />

            <Route path="/admin/login" element={currentUser ? <Navigate to="/admin" /> : <LoginPage users={users} onLogin={handleLogin} />} />
            <Route path="/admin/*" element={
              currentUser ? (
                <AdminDashboard 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  activities={activities} 
                  memberActivities={memberActivities}
                  registrations={registrations}
                  memberRegistrations={memberRegistrations}
                  users={users}
                  members={members}
                  memberApplications={memberApplications} // Pass applications
                  coupons={coupons}
                  onUpdateActivity={handleUpdateActivity}
                  onAddActivity={handleAddActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onUpdateMemberActivity={handleUpdateMemberActivity}
                  onAddMemberActivity={handleAddMemberActivity}
                  onDeleteMemberActivity={handleDeleteMemberActivity}
                  onUpdateRegistration={handleUpdateRegistration}
                  onDeleteRegistration={handleDeleteRegistration}
                  onUpdateMemberRegistration={handleUpdateMemberRegistration}
                  onDeleteMemberRegistration={handleDeleteMemberRegistration}
                  onAddUser={handleAddUser}
                  onDeleteUser={handleDeleteUser}
                  onAddMember={handleAddMember}
                  onAddMembers={handleAddMembers}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  onUploadImage={handleUploadImage}
                  onGenerateCoupons={handleGenerateCoupons}
                  onApproveMemberApplication={handleApproveMemberApplication} // Pass approve fn
                  onDeleteMemberApplication={handleDeleteMemberApplication} // Pass delete fn
                />
              ) : (
                <Navigate to="/admin/login" />
              )
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
