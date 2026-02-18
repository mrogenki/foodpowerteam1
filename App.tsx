
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, Loader2, UserPlus, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MemberList from './pages/MemberList';
import MemberJoin from './pages/MemberJoin';
import PaymentResult from './pages/PaymentResult';
import { Activity, MemberActivity, Registration, MemberRegistration, AdminUser, Member, Coupon, MemberApplication, UserRole } from './types';
import { INITIAL_ACTIVITIES, INITIAL_MEMBERS, EMAIL_CONFIG } from './constants';

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

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// 定義系統擁有者 (白名單)，確保即使資料庫設定錯誤也能登入
const SYSTEM_OWNERS = ['mr.ogenki@gmail.com'];

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
  const [memberApplications, setMemberApplications] = useState<MemberApplication[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Supabase Auth Session
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  if (!supabase) {
    return <SetupGuide />;
  }

  // 1. 監聽 Supabase Auth 狀態
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 當 Session 存在時，查詢 admins 表格確認權限
  useEffect(() => {
    const fetchAdminRole = async () => {
      if (session?.user?.email) {
        try {
          const { data: adminData, error } = await supabase!
            .from('admins')
            .select('*')
            .ilike('email', session.user.email) // 使用 ilike 忽略大小寫
            .single();

          if (adminData) {
            setCurrentUser({
              id: adminData.id,
              name: adminData.name,
              role: adminData.role as UserRole, // 嚴格使用資料庫中的角色
              phone: adminData.phone,
              password: ''
            });
          } else {
            // [Rescue Logic] 救援機制：如果資料庫查不到，但 Email 在系統擁有者名單中，強制給予總管理員權限
            const isSystemOwner = SYSTEM_OWNERS.some(email => 
              email.toLowerCase() === session.user.email.toLowerCase()
            );

            if (isSystemOwner) {
               console.warn('System Owner recognized via whitelist (DB record missing or mismatched)');
               setCurrentUser({
                 id: session.user.id,
                 name: '總管理員 (System)',
                 role: UserRole.SUPER_ADMIN,
                 phone: '',
               });
            } else {
               console.warn('User logged in but not found in admins table');
               // 雖然登入 Supabase Auth，但不在 admins 名單中，視為無權限
               setCurrentUser(null);
            }
          }
        } catch (err) {
          console.error('Error fetching admin role:', err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchAdminRole();
  }, [session]);

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setDbError(null);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      // Promise.all 並行載入
      const [
        { data: actData },
        { data: memActData },
        { data: regData },
        { data: memRegData },
        { data: userData },
        { data: memberData },
        { data: couponData },
        { data: applicationData }
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

      if (actData && actData.length > 0) {
        setActivities(actData.map((a: any) => ({ ...a, status: a.status || 'active' })));
      } else {
         const { data: hasAny } = await supabase.from('activities').select('id').limit(1);
         if (!hasAny || hasAny.length === 0) {
            await supabase.from('activities').insert(INITIAL_ACTIVITIES);
            const { data: reload } = await supabase.from('activities').select('*');
            if (reload) setActivities(reload);
         }
      }

      if (memActData) setMemberActivities(memActData.map((a: any) => ({ ...a, status: a.status || 'active' })));
      
      // 注意：由於 RLS 限制，匿名使用者讀取 registrations 可能會是空的，這是正常的
      if (regData) setRegistrations(regData);
      if (memRegData) setMemberRegistrations(memRegData);
      
      // 注意：admins table 只作為唯讀參考，不再用於登入
      if (userData && userData.length > 0) setUsers(userData);
      
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

      if (couponData) setCoupons(couponData as Coupon[]);
      if (applicationData) setMemberApplications(applicationData as MemberApplication[]);

    } catch (err: any) {
      console.error('Fetch error:', err);
      // RLS 錯誤不應顯示給一般使用者，除非是管理員
      if (isInitialLoad) {
        // 如果是初始化且沒資料，可能是因為 RLS 阻擋了 Anon 讀取某些表 (正常)
        // 這裡不設定錯誤，讓頁面繼續渲染
      }
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [currentUser]); // 當使用者登入狀態改變時，重新抓取資料 (確保取得管理員可見的資料)

  const handleLogout = async () => {
    if (supabase) {
       await supabase.auth.signOut();
       setCurrentUser(null);
       setSession(null);
    }
  };

  // 圖片上傳
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

  // CRUD Functions ... (保持與原邏輯相同，Supabase Auth 會自動處理 RLS)
  const handleUpdateActivity = async (updated: Activity) => {
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (!supabase) return;
    const { error } = await supabase.from('activities').update(updated).eq('id', updated.id);
    if (error) { console.error(error); fetchData(); }
  };
  const handleAddActivity = async (newAct: Activity) => {
    if (!supabase) return;
    const activityToInsert = { ...newAct, id: newAct.id || crypto.randomUUID() };
    const { error } = await supabase.from('activities').insert([activityToInsert]);
    if (!error) fetchData(); else alert('新增活動失敗: ' + error.message);
  };
  const handleDeleteActivity = async (id: string | number) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    if (!supabase) return;
    await supabase.from('registrations').delete().eq('activityId', id);
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) fetchData();
  };

  const handleUpdateMemberActivity = async (updated: MemberActivity) => {
    setMemberActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (!supabase) return;
    const { error } = await supabase.from('member_activities').update(updated).eq('id', updated.id);
    if (error) fetchData();
  };
  const handleAddMemberActivity = async (newAct: MemberActivity) => {
    if (!supabase) return;
    const activityToInsert = { ...newAct, id: newAct.id || crypto.randomUUID() };
    const { error } = await supabase.from('member_activities').insert([activityToInsert]);
    if (!error) fetchData(); else alert('新增會員活動失敗: ' + error.message);
  };
  const handleDeleteMemberActivity = async (id: string | number) => {
    setMemberActivities(prev => prev.filter(a => a.id !== id));
    if (!supabase) return;
    await supabase.from('member_registrations').delete().eq('activityId', id);
    const { error } = await supabase.from('member_activities').delete().eq('id', id);
    if (error) fetchData();
  };

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

  const handleUpdateRegistration = async (updated: Registration) => {
    setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (!supabase) return;
    const { error } = await supabase.from('registrations').update(updated).eq('id', updated.id);
    if (error) { console.error(error); fetchData(); alert('更新失敗'); }
  };
  const handleDeleteRegistration = async (id: string | number) => {
    setRegistrations(prev => prev.filter(r => r.id !== id));
    if (!supabase) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) { console.error(error); fetchData(); }
  };

  const handleUpdateMemberRegistration = async (updated: MemberRegistration) => {
    setMemberRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (!supabase) return;
    const { error } = await supabase.from('member_registrations').update(updated).eq('id', updated.id);
    if (error) { console.error(error); fetchData(); alert('更新失敗'); }
  };
  const handleDeleteMemberRegistration = async (id: string | number) => {
    setMemberRegistrations(prev => prev.filter(r => r.id !== id));
    if (!supabase) return;
    const { error } = await supabase.from('member_registrations').delete().eq('id', id);
    if (error) { console.error(error); fetchData(); }
  };

  // User management (only for recording, not auth)
  const handleAddUser = async (newUser: AdminUser) => { if (!supabase) return; await supabase.from('admins').insert([newUser]); fetchData(); };
  const handleDeleteUser = async (id: string) => { if (!supabase) return; await supabase.from('admins').delete().eq('id', id); fetchData(); };
  
  const handleAddMember = async (newMember: Member) => { 
    if (!supabase) return; 
    const memberToInsert = { ...newMember, id: newMember.id || crypto.randomUUID() };
    const { error } = await supabase.from('members').insert([memberToInsert]); 
    if (error) alert('新增會員失敗：' + error.message); else fetchData(); 
  };
  const handleUpdateMember = async (updated: Member) => { 
    if (!supabase) return; 
    const { error } = await supabase.from('members').update(updated).eq('id', updated.id); 
    if (error) alert('更新會員失敗：' + error.message); else fetchData(); 
  };
  const handleDeleteMember = async (id: string | number) => { 
    if (!supabase) return; 
    const { error } = await supabase.from('members').delete().eq('id', id); 
    if (error) alert('刪除會員失敗：' + error.message); else fetchData(); 
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
      alert(`成功產生 ${coupons.length} 張折扣券`);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleApproveMemberApplication = async (application: MemberApplication) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: members, error: fetchError } = await supabase.from('members').select('member_no');
      if (fetchError) throw fetchError;
      const maxNo = members?.reduce((max, m) => {
        const num = parseInt(m.member_no);
        return !isNaN(num) && num > max ? num : max;
      }, 0) || 0;
      const nextNo = (maxNo + 1).toString().padStart(5, '0');

      const newMember = {
        id: crypto.randomUUID(),
        member_no: nextNo,
        status: 'active',
        membership_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
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

      const { error: insertError } = await supabase.from('members').insert([newMember]);
      if (insertError) throw insertError;
      const { error: deleteError } = await supabase.from('member_applications').delete().eq('id', application.id);
      if (deleteError) throw deleteError;

      alert(`核准成功！\n會員編號：${nextNo}`);
      await fetchData();
    } catch (error: any) { console.error(error); alert('核准失敗：' + error.message); } finally { setLoading(false); }
  };

  const handleDeleteMemberApplication = async (id: string | number) => {
    if (!supabase) return;
    if (!confirm('確定刪除此申請？')) return;
    setLoading(true);
    try {
       const { error } = await supabase.from('member_applications').delete().eq('id', id);
       if (error) throw error;
       await fetchData();
    } catch (error: any) { alert('刪除失敗：' + error.message); } finally { setLoading(false); }
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
            <Route path="/join" element={<MemberJoin />} />
            <Route path="/activity/:id" element={<ActivityDetail type="general" activities={activities} onRegister={handleRegister} registrations={registrations} validateCoupon={validateCoupon} />} />
            <Route path="/member-activity/:id" element={<ActivityDetail type="member" activities={memberActivities} members={members} onMemberRegister={handleMemberRegister} memberRegistrations={memberRegistrations} validateCoupon={validateCoupon} />} />
            <Route path="/payment-result" element={<PaymentResult />} />

            <Route path="/admin/login" element={currentUser ? <Navigate to="/admin" /> : <LoginPage />} />
            
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
                  memberApplications={memberApplications}
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
                  onApproveMemberApplication={handleApproveMemberApplication}
                  onDeleteMemberApplication={handleDeleteMemberApplication}
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
