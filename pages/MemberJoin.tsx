
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { UserPlus, Save, Loader2, Building2, User, Phone, Briefcase, FileText } from 'lucide-react';
import { IndustryCategories } from '../types';
import { EMAIL_CONFIG } from '../constants';

// Supabase 設定 (與 App.tsx 保持一致)
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

const MemberJoin: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // 基本資料
    name: '',
    id_number: '',
    birthday: '',
    referrer: '',
    
    // 聯絡方式
    phone: '',
    email: '',
    home_phone: '',
    address: '',
    
    // 事業資料
    industry_category: IndustryCategories[0],
    brand_name: '',
    company_title: '',
    tax_id: '',
    job_title: '',
    website: '',
    main_service: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendJoinConfirmationEmail = async (memberData: any) => {
    // 檢查 EmailJS 設定是否存在
    if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === 'YOUR_NEW_SERVICE_ID') {
      console.warn('EmailJS 未設定，跳過發送');
      return;
    }

    try {
      // 構建詳細的申請資料內容
      const details = `
        【申請資料明細】
        身分證字號: ${memberData.id_number}
        生日: ${memberData.birthday}
        室內電話: ${memberData.home_phone}
        通訊地址: ${memberData.address}
        產業分類: ${memberData.industry_category}
        統一編號: ${memberData.tax_id}
        主要服務/產品: ${memberData.main_service}
        備註: ${memberData.notes || '無'}
      `;

      // 使用 Email 模板參數進行映射
      // 注意：這裡使用新版 Member Application 模板的變數
      // 為了保險起見，我們保留大部分通用變數名 (如 to_name, message)
      const templateParams = {
        to_name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        company: memberData.brand_name || memberData.company_title,
        job_title: memberData.job_title,
        
        // 專為會員申請設定的標題與資訊
        activity_title: '【食在力量】會員入會申請（審核中）',
        activity_date: new Date().toISOString().slice(0, 10), // 申請日期
        activity_time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        activity_location: '線上申請 (專人將聯繫協助繳費)', 
        activity_price: '待確認 (入會費/年費)',
        
        // 詳細資料區塊
        message: details 
      };

      // 使用新的 MEMBER_JOIN_TEMPLATE_ID
      await emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.MEMBER_JOIN_TEMPLATE_ID, templateParams, EMAIL_CONFIG.PUBLIC_KEY);
    } catch (error) {
      console.error('入會確認信發送失敗:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);

    try {
      // 1. 準備寫入資料 (寫入 member_applications 表)
      const newApplication = {
        id: crypto.randomUUID(),
        // member_no: nextNo, // 暫不產生編號，待核准後產生
        status: 'pending', // 狀態為待審核
        created_at: new Date().toISOString(),
        
        name: formData.name,
        id_number: formData.id_number,
        birthday: formData.birthday,
        referrer: formData.referrer,
        
        phone: formData.phone,
        email: formData.email,
        home_phone: formData.home_phone,
        address: formData.address,
        
        industry_category: formData.industry_category,
        brand_name: formData.brand_name,
        company_title: formData.company_title,
        tax_id: formData.tax_id,
        job_title: formData.job_title,
        website: formData.website,
        main_service: formData.main_service,
        notes: formData.notes
      };

      // 2. 寫入資料庫 (member_applications)
      const { error: insertError } = await supabase.from('member_applications').insert([newApplication]);

      if (insertError) throw insertError;

      // 3. 發送 Email 通知 (使用新模板)
      await sendJoinConfirmationEmail(newApplication);

      // 4. 顯示成功訊息
      alert(`入會申請表已送出！\n\n系統已發送確認信至您的信箱。\n\n您的申請目前正在審核中，後續將有專人與您聯繫，協助完成繳費與正式入會程序。`);
      navigate('/'); // 導向首頁

    } catch (error: any) {
      console.error('Registration failed:', error);
      alert('報名失敗：' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl text-white mb-4 shadow-lg shadow-red-200">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">加入食在力量會員</h1>
          <p className="text-gray-500">填寫以下資料，立即成為我們的一份子，共享產業資源。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 基本資料 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <User className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">基本資料</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">姓名 <span className="text-red-500">*</span></label>
                <input required name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="請輸入真實姓名" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">身分證字號 <span className="text-red-500">*</span></label>
                <input required name="id_number" type="text" value={formData.id_number} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="用於建檔識別" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">生日 <span className="text-red-500">*</span></label>
                <input required name="birthday" type="date" value={formData.birthday} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">引薦人</label>
                <input name="referrer" type="text" value={formData.referrer} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="若是經由會員介紹請填寫" />
              </div>
            </div>
          </div>

          {/* 聯絡方式 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Phone className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">聯絡方式</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">手機 <span className="text-red-500">*</span></label>
                <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="09xx-xxx-xxx" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">電子信箱 <span className="text-red-500">*</span></label>
                <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="example@mail.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">室內電話 <span className="text-red-500">*</span></label>
                <input required name="home_phone" type="tel" value={formData.home_phone} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="02-xxxx-xxxx" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">通訊地址 <span className="text-red-500">*</span></label>
                <input required name="address" type="text" value={formData.address} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="請輸入完整地址" />
              </div>
            </div>
          </div>

          {/* 事業資料 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Briefcase className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">事業資料</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">產業分類 <span className="text-red-500">*</span></label>
                <select required name="industry_category" value={formData.industry_category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white">
                  {IndustryCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">品牌名稱 <span className="text-red-500">*</span></label>
                <input required name="brand_name" type="text" value={formData.brand_name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="店名或品牌名" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">公司抬頭 <span className="text-red-500">*</span></label>
                <input required name="company_title" type="text" value={formData.company_title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="公司登記名稱" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">統一編號 <span className="text-red-500">*</span></label>
                <input required name="tax_id" type="text" value={formData.tax_id} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">職稱 <span className="text-red-500">*</span></label>
                <input required name="job_title" type="text" value={formData.job_title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="例如：負責人、店長" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">公司網站</label>
                <input name="website" type="url" value={formData.website} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">主要服務/產品 <span className="text-red-500">*</span></label>
                <textarea required name="main_service" rows={3} value={formData.main_service} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="請簡述您的主要營業項目或產品"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">備註</label>
                <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="其他補充事項"></textarea>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-red-200"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" /> 處理中...</> : <><Save /> 送出申請，加入會員</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberJoin;
