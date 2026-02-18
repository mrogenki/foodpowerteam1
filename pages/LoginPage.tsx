
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../App';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!supabase) {
        setError('系統錯誤：無法連接至伺服器');
        setLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
        
        // 登入成功後，App.tsx 的 onAuthStateChange 會自動捕捉並導航
    } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message === 'Invalid login credentials' ? '帳號或密碼錯誤' : err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl text-white mb-4 shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">管理員登入</h1>
          <p className="text-gray-400 mt-2 font-medium">食在力量活動管理系統</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in fade-in zoom-in duration-500">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-widest text-[10px]">Email 帳號</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-gray-700 font-medium"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-widest text-[10px]">登入密碼</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-gray-700 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[13px] font-bold py-3.5 rounded-xl text-center border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : '進入管理後台'}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-10">
          <Link to="/" className="text-gray-400 hover:text-red-600 text-sm font-bold transition-colors">
            ← 返回活動網站首頁
          </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default LoginPage;
