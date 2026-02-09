
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, Loader2, Database, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MemberList from './pages/MemberList';
import { Activity, Registration, AdminUser, Member, AttendanceRecord, AttendanceStatus } from './types';
import { INITIAL_ACTIVITIES, INITIAL_ADMINS, INITIAL_MEMBERS } from './constants';

const getEnv = (key: string): string | undefined => {
  try {
    return (import.meta as any)?.env?.[key];
  } catch (e) {
    return undefined;
  }
};

// 修正：移除硬編碼的 Key，強制從環境變數讀取。若無環境變數，則為空字串，稍後會顯示設定引導。
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || ''; 
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || '';

// 僅在有 URL 時建立 Client，避免報錯
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
        <p className="text-gray-400 text-xs">&copy; 2026 食在力量活動報名系統. All rights reserved.</p>
      </div>
    </footer>
  );
};

// 新增：設定引導畫面
const SetupGuide: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <Database size={32} />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">歡迎使用食在力量系統</h1>
      <div className="space-y-4 text-gray-600 text-sm">
        <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex gap-3 text-yellow-800 font-medium">
          <AlertTriangle className="flex-shrink-0" size={20} />
          尚未設定資料庫連線
        </p>
        <p>這是一個全新的網站環境。為了開始使用，請完成以下設定：</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>前往 Supabase 建立新專案。</li>
          <li>執行專案中的 <code>supabase_schema.sql</code> 以建立資料表。</li>
          <li>將 Supabase URL 與 Anon Key 設定到環境變數中：
            <pre className="bg-gray-100 p-3 rounded mt-2 text-xs font-mono overflow-x-auto">
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
            </pre>
          </li>
        </ol>
        <div className="mt-6 pt-6 border-t text-center">
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
            已完成設定，重新整理
          </button>
        </div>
      </div>
    </div>
  </div>
);

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

  // 如果沒有設定環境變數，直接顯示設定引導
  if (!supabase) {
    return <SetupGuide />;
  }

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setDbError(null);
    try {
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

  // 資料庫連線錯誤提示
  if (dbError) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
               <AlertTriangle size={32} />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">資料庫連線失敗</h2>
             <p className="text-gray-600 mb-6">{dbError}</p>
             <p className="text-sm text-gray-400 mb-6">請檢查 Supabase URL 與 Key 是否正確，或確認資料表是否已建立 (請參閱 README.md)。</p>
             <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
               重試連線
             </button>
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
