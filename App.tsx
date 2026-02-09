
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, Loader2, Database, AlertTriangle, Save, Key, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MemberList from './pages/MemberList';
import { Activity, Registration, AdminUser, Member, AttendanceRecord, AttendanceStatus } from './types';
import { INITIAL_ACTIVITIES, INITIAL_ADMINS, INITIAL_MEMBERS } from './constants';

// 您提供的 Supabase 連線資訊 (預設值)
const DEFAULT_URL = 'https://kpltydyspvzozgxfiwra.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbHR5ZHlzcHZ6b3pneGZpd3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjI0MTUsImV4cCI6MjA4NjEzODQxNX0.1jraR6m6sKWSUJxek2noJi0YqyO3Ak4kPZ-X2qdwtGA';

// 優先順序：環境變數 > LocalStorage > 預設硬編碼值
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

// 僅在有 URL 時建立 Client
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center text-white text-xs font-bold">食</div>
          <span className="font-bold text-gray-800 tracking-wider">食在力量</span>
        </div>
        <p className="text-gray-400 text-xs">&copy; 2026 食在力量活動報名系統 v2.0. All rights reserved.</p>
      </div>
    </footer>
  );
};

// 改良版設定引導：允許直接輸入 Key
const SetupGuide: React.FC = () => {
  const [url, setUrl] = useState(SUPABASE_URL);
  const [key, setKey] = useState(SUPABASE_ANON_KEY);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!url || !key) {
      alert('請輸入完整的 URL 和 Key');
      return;
    }
    setIsSaving(true);
    // 儲存到 LocalStorage
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_key', key.trim());
    
    // 重新整理頁面以套用設定
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
            <Database size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">歡迎使用食在力量系統</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">請輸入您的資料庫連線資訊以啟動網站</p>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-xs text-yellow-800 space-y-2">
            <p className="flex items-center gap-2 font-bold">
              <AlertTriangle size={14} /> 注意：
            </p>
            <p>1. 這是快速設定模式，資訊將儲存在您的瀏覽器中。</p>
            <p>2. 若要讓所有訪客都能正常瀏覽，請務必將這些資訊設定在 <span className="font-bold">Vercel Environment Variables</span> 並重新部署。</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Globe size={14} /> Supabase URL
            </label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="https://your-project.supabase.co"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Key size={14} /> Supabase Anon Key
            </label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? '正在啟動...' : '儲存設定並啟動'}
          </button>
          
          <div className="text-center pt-4 border-t mt-4">
            <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
              去哪裡找這些資訊？ (Supabase Dashboard)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 如果沒有設定環境變數且 LocalStorage 也沒有，顯示設定引導
  if (!supabase) {
    return <SetupGuide />;
  }

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setDbError(null);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      // 1. 獲取活動
      const { data: actData, error: actError } = await supabase.from('activities').select('*').order('date', { ascending: true }).order('time', { ascending: true });
      if (actError) throw actError;

      if (actData && actData.length > 0) {
        const mappedActs = actData.map((a: any) => ({
          ...a,
          status: a.status || 'active'
        }));
        setActivities(mappedActs);
      } else if (actData && actData.length === 0) {
        // 資料庫無資料時初始化
        const initActs = INITIAL_ACTIVITIES.map(({ id, status, ...rest }) => rest);
        const { data: inserted, error: insertError } = await supabase.from('activities').insert(initActs).select();
        if (insertError) throw insertError;
        if (inserted) {
          const mappedInserted = inserted.map((a: any) => ({
            ...a,
            status: a.status || 'active'
          }));
          setActivities(mappedInserted);
        }
      }

      // 2. 獲取報名
      const { data: regData } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (regData) setRegistrations(regData);
      
      // 3. 獲取管理員
      const { data: userData, error: userError } = await supabase.from('admins').select('*');
      if (userData && userData.length > 0) {
        setUsers(userData);
      } else if (!userError && userData && userData.length === 0) {
        const initAdmins = INITIAL_ADMINS.map(({ id, ...rest }) => rest);
        const { data: inserted } = await supabase.from('admins').insert(initAdmins).select();
        if (inserted) setUsers(inserted);
      }

      // 4. 獲取會員
      const { data: memberData, error: memberError } = await supabase.from('members').select('*');
      if (memberData && memberData.length > 0) {
        setMembers(memberData);
      } else if (!memberError && memberData && memberData.length === 0) {
        // 資料庫無資料時初始化
        const initMembers = INITIAL_MEMBERS.map(({ id, ...rest }) => rest);
        const { data: inserted } = await supabase.from('members').insert(initMembers).select();
        if (inserted) setMembers(inserted);
      }

      // 5. 獲取出席紀錄
      const { data: attendanceData } = await supabase.from('attendance').select('*');
      if (attendanceData) {
        setAttendance(attendanceData as AttendanceRecord[]);
      }

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

  // 處理圖片上傳
  const handleUploadImage = async (file: File): Promise<string> => {
    if (!supabase) return '';
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `activity-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('Supabase Storage 上傳失敗，嘗試轉為壓縮 Base64', uploadError.message);
        throw uploadError; 
      }

      const { data } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error: any) {
      // Fallback: Client-side resize and base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('瀏覽器不支援 Canvas 處理'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          };
          img.onerror = () => reject(new Error('圖片處理失敗'));
        };
        reader.onerror = () => reject(new Error('檔案讀取失敗'));
      });
    }
  };

  const handleRegister = async (newReg: Registration): Promise<boolean> => {
    if (!supabase) return false;
    const { id, ...regData } = newReg as any;
    const { error } = await supabase.from('registrations').insert([regData]);
    if (error) {
      alert('報名失敗：' + error.message);
      return false;
    } else {
      await fetchData(); 
      return true;
    }
  };

  const handleUpdateActivity = async (updated: Activity) => {
    if (!supabase) return;
    const { status, ...updateData } = updated as any;
    const { error } = await supabase.from('activities').update(updateData).eq('id', updated.id);
    if (error) alert('更新失敗：' + error.message);
    else fetchData();
  };

  const handleAddActivity = async (newAct: Activity) => {
    if (!supabase) return;
    const { id, status, ...actData } = newAct as any;
    const { error } = await supabase.from('activities').insert([actData]);
    if (error) alert('新增活動失敗：' + error.message);
    else fetchData();
  };

  const handleDeleteActivity = async (id: string | number) => {
    if (!supabase) return;
    await supabase.from('registrations').delete().eq('activityId', id);
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) alert('刪除失敗：' + error.message);
    else fetchData();
  };

  const handleDeleteRegistration = async (id: string | number) => {
    if (!supabase) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) alert('刪除報名紀錄失敗：' + error.message);
    else fetchData();
  };

  const handleUpdateRegistration = async (updated: Registration) => {
    if (!supabase) return;
    const { error } = await supabase.from('registrations').update(updated).eq('id', updated.id);
    if (error) alert('更新報名狀態失敗：' + error.message);
    else fetchData();
  };

  const handleAddUser = async (newUser: AdminUser) => {
    if (!supabase) return;
    const { id, ...userData } = newUser as any;
    const { error } = await supabase.from('admins').insert([userData]);
    if (error) alert('新增管理員失敗：' + error.message);
    else fetchData();
  };

  const handleDeleteUser = async (id: string | number) => {
    if (!supabase) return;
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) {
      alert('刪除人員失敗：' + error.message);
    } else {
      fetchData();
    }
  };

  const handleAddMember = async (newMember: Member) => {
    if (!supabase) return;
    const { id, ...memberData } = newMember as any;
    const { error } = await supabase.from('members').insert([memberData]);
    if (error) alert('新增會員失敗：' + error.message);
    else fetchData();
  };

  const handleAddMembers = async (newMembers: Member[]) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const membersData = newMembers.map(({ id, ...rest }) => rest);
      const { error } = await supabase.from('members').insert(membersData);
      if (error) {
        alert('批次匯入失敗：' + error.message);
      } else {
        alert(`成功匯入 ${newMembers.length} 筆會員資料！`);
        await fetchData();
      }
    } catch (err: any) {
      console.error(err);
      alert('發生錯誤：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (updated: Member) => {
    if (!supabase) return;
    const { error } = await supabase.from('members').update(updated).eq('id', updated.id);
    if (error) alert('更新會員失敗：' + error.message);
    else fetchData();
  };

  const handleDeleteMember = async (id: string | number) => {
    if (!supabase) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) alert('刪除會員失敗：' + error.message);
    else fetchData();
  };

  const handleUpdateAttendance = async (activityId: string, memberId: string, status: AttendanceStatus) => {
    if (!supabase) return;
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;
    
    setAttendance(prev => {
      const existingIndex = prev.findIndex(r => String(r.activity_id) === String(activityId) && String(r.member_id) === String(memberId));
      if (existingIndex >= 0) {
        const newArr = [...prev];
        newArr[existingIndex] = { ...newArr[existingIndex], status, updated_at: now };
        return newArr;
      } else {
        return [...prev, { id: tempId, activity_id: activityId, member_id: memberId, status, updated_at: now }];
      }
    });

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          { activity_id: String(activityId), member_id: String(memberId), status, updated_at: now },
          { onConflict: 'activity_id,member_id' }
        )
        .select();

      if (error) {
        console.error('Attendance update failed:', error);
        fetchData(); 
      } 
    } catch (err) {
      console.error('API error:', err);
      fetchData();
    }
  };

  const handleDeleteAttendance = async (activityId: string, memberId: string) => {
    if (!supabase) return;
    setAttendance(prev => prev.filter(r => !(String(r.activity_id) === String(activityId) && String(r.member_id) === String(memberId))));

    try {
       const { error } = await supabase
         .from('attendance')
         .delete()
         .match({ activity_id: String(activityId), member_id: String(memberId) });

       if (error) {
         console.error('Delete attendance failed:', error);
         fetchData(); 
       }
    } catch (err) {
       console.error('API error:', err);
       fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-red-600" size={56} />
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Connecting Database</p>
        </div>
      </div>
    );
  }

  // 資料庫連線錯誤提示 (但允許重設)
  if (dbError) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
               <AlertTriangle size={32} />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">資料庫連線失敗</h2>
             <p className="text-gray-600 mb-6">{dbError}</p>
             <div className="flex flex-col gap-3">
               <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                 重試連線
               </button>
               <button 
                onClick={() => {
                  localStorage.removeItem('supabase_url');
                  localStorage.removeItem('supabase_key');
                  window.location.reload();
                }}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
               >
                 重新輸入連線資訊
               </button>
             </div>
          </div>
        </div>
     );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50/30">
          <Routes>
            <Route path="/" element={<Home activities={activities} />} />
            <Route path="/members" element={<MemberList members={members} />} />
            <Route path="/activity/:id" element={<ActivityDetail activities={activities} onRegister={handleRegister} registrations={registrations} />} />
            <Route path="/admin/login" element={currentUser ? <Navigate to="/admin" /> : <LoginPage users={users} onLogin={handleLogin} />} />
            <Route path="/admin/*" element={
              currentUser ? (
                <AdminDashboard 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  activities={activities} 
                  registrations={registrations}
                  users={users}
                  members={members}
                  attendance={attendance}
                  onUpdateActivity={handleUpdateActivity}
                  onAddActivity={handleAddActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onUpdateRegistration={handleUpdateRegistration}
                  onDeleteRegistration={handleDeleteRegistration}
                  onAddUser={handleAddUser}
                  onDeleteUser={handleDeleteUser}
                  onAddMember={handleAddMember}
                  onAddMembers={handleAddMembers}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  onUpdateAttendance={handleUpdateAttendance}
                  onDeleteAttendance={handleDeleteAttendance}
                  onUploadImage={handleUploadImage} 
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
