
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, ArrowLeft, CheckCircle2, Share2, CopyCheck, Clock, Loader2, Crown, UserCheck, Ticket, User, Users, Search, ChevronDown, Lock } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Activity, MemberActivity, Registration, MemberRegistration, Member } from '../types';

// TODO: 請替換為您 EmailJS 後台的實際資訊
const EMAILJS_SERVICE_ID: string = 'service_3cvfu3x';
const EMAILJS_TEMPLATE_ID: string = 'template_tsptg0x';
const EMAILJS_PUBLIC_KEY: string = 'ajJknYqtnk3p1_WmI';

interface ActivityDetailProps {
  type: 'general' | 'member';
  activities: (Activity | MemberActivity)[];
  registrations?: Registration[];
  memberRegistrations?: MemberRegistration[];
  members?: Member[];
  onRegister?: (reg: Registration, couponId?: string) => Promise<boolean>;
  onMemberRegister?: (reg: MemberRegistration, couponId?: string) => Promise<boolean>;
  validateCoupon: (code: string, activityId: string) => Promise<{valid: boolean, discount?: number, message: string, couponId?: string}>;
}

const ActivityDetail: React.FC<ActivityDetailProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activity = props.activities.find(a => String(a.id) === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberResults, setShowMemberResults] = useState(false);
  
  // 折扣券相關
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validCouponId, setValidCouponId] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    referrer: '',
    memberId: '' // For member registration
  });

  if (!activity) {
    return <div className="p-20 text-center">活動不存在</div>;
  }

  // 計算已報名人數
  let alreadyRegisteredCount = 0;
  if (props.type === 'general' && props.registrations) {
    alreadyRegisteredCount = props.registrations.filter(r => String(r.activityId) === String(id)).length;
  } else if (props.type === 'member' && props.memberRegistrations) {
    alreadyRegisteredCount = props.memberRegistrations.filter(r => String(r.activityId) === String(id)).length;
  }

  const basePrice = activity.price;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // 搜尋會員邏輯
  const filteredMembers = (props.members && memberSearchTerm.length >= 1)
    ? props.members.filter(m => 
        m.name.includes(memberSearchTerm) || 
        (m.phone && m.phone.includes(memberSearchTerm)) ||
        (m.member_no && m.member_no.includes(memberSearchTerm))
      ).slice(0, 5)
    : [];

  const handleSelectMember = (member: Member) => {
    setFormData({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      company: member.brand_name || member.company_title || '',
      title: member.job_title || '',
      referrer: member.referrer || '',
      memberId: String(member.id)
    });
    setMemberSearchTerm(member.name);
    setShowMemberResults(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `【長展分會活動推薦】\n活動：${activity.title}\n日期：${activity.date}\n時間：${activity.time}\n地點：${activity.location}\n\n立即點擊連結報名：\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: activity.title, text: shareText, url: shareUrl });
      } catch (err) { console.log('Share failed', err); }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShowCopyTooltip(true);
        setTimeout(() => setShowCopyTooltip(false), 2000);
      } catch (err) { alert('無法自動複製，請手動分享連結'); }
    }
  };

  const checkCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus('validating');
    const result = await props.validateCoupon(couponCode, activity.id as string);
    
    if (result.valid) {
      setCouponStatus('valid');
      setDiscountAmount(result.discount || 0);
      setValidCouponId(result.couponId);
      setCouponMessage(`優惠代碼適用！折抵 NT$ ${result.discount}`);
    } else {
      setCouponStatus('invalid');
      setDiscountAmount(0);
      setValidCouponId(undefined);
      setCouponMessage(result.message);
    }
  };

  const sendConfirmationEmail = async (name: string, email: string) => {
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return;
    setIsSendingEmail(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
        {
          to_name: name,
          to_email: email,
          activity_title: activity.title,
          activity_date: activity.date,
          activity_time: activity.time,
          activity_location: activity.location,
          activity_price: finalPrice,
          message: `感謝您報名 ${activity.title}，我們期待您的蒞臨！`
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) { console.error('報名確認信發送失敗:', error); } 
    finally { setIsSendingEmail(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (props.type === 'member' && !formData.memberId) {
       alert('請先查詢並選擇您的會員資料');
       return;
    }

    setIsSubmitting(true);

    try {
      let success = false;
      if (props.type === 'general' && props.onRegister) {
        const newReg: Registration = {
          id: Math.random().toString(36).substr(2, 9), 
          activityId: activity.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          company: formData.company,
          title: formData.title,
          referrer: formData.referrer,
          paid_amount: finalPrice,
          coupon_code: validCouponId ? couponCode : undefined,
          created_at: new Date().toISOString()
        };
        success = await props.onRegister(newReg, validCouponId);
      } else if (props.type === 'member' && props.onMemberRegister) {
        const newMemberReg: MemberRegistration = {
          id: Math.random().toString(36).substr(2, 9),
          activityId: activity.id,
          memberId: formData.memberId,
          member_name: formData.name,
          member_no: '', // Can be fetched from members list if needed
          paid_amount: finalPrice,
          coupon_code: validCouponId ? couponCode : undefined,
          created_at: new Date().toISOString()
        };
        success = await props.onMemberRegister(newMemberReg, validCouponId);
      }

      if (success) {
        if (formData.email) await sendConfirmationEmail(formData.name, formData.email);
        setIsSuccess(true);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6"><CheckCircle2 size={80} className="text-green-500 animate-in zoom-in duration-300" /></div>
        <h2 className="text-3xl font-bold mb-4">報名成功！</h2>
        <p className="text-gray-500 mb-8">感謝您的參與，我們期待在活動現場見到您。</p>
        <button onClick={() => navigate('/')} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg">返回活動列表</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"><ArrowLeft size={20} /> 返回</button>
        <div className="relative">
          <button onClick={handleShare} className="flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-50 transition-all active:scale-95">
            {showCopyTooltip ? <CopyCheck size={18} /> : <Share2 size={18} />}
            {showCopyTooltip ? '已複製資訊' : '一鍵轉發分享'}
          </button>
          {showCopyTooltip && <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white text-xs py-1 px-3 rounded shadow-lg animate-bounce whitespace-nowrap">內容已複製到剪貼簿！</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl overflow-hidden shadow-sm relative">
            <img src={activity.picture} alt={activity.title} className="w-full h-[400px] object-cover" />
            {props.type === 'member' && (
               <div className="absolute top-4 left-4 bg-red-600/90 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 backdrop-blur-sm shadow-lg"><Crown size={20} /> 會員專屬活動</div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-bold">{activity.type}</span>
               <span className="text-gray-400 text-sm">已有 {alreadyRegisteredCount} 人報名</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">{activity.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-gray-100 mb-8">
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><Calendar size={24} /></div><div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">日期時間</p><p className="font-medium">{activity.date}</p><p className="text-sm text-gray-500 font-bold">{activity.time}</p></div></div>
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><MapPin size={24} /></div><div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">地點</p><p className="font-medium">{activity.location}</p></div></div>
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><DollarSign size={24} /></div><div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">活動費用</p><p className="font-medium">NT$ {activity.price.toLocaleString()}</p></div></div>
            </div>

            <div className="prose prose-red max-w-none">
              <h3 className="text-xl font-bold mb-4">活動介紹</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{activity.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl sticky top-24">
            <h3 className="text-2xl font-bold mb-6 text-center">立即報名</h3>
            
            {props.type === 'member' ? (
               <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 text-center">
                  <p className="text-red-800 font-bold flex items-center justify-center gap-2 mb-1"><Crown size={20} /> 會員專屬活動</p>
                  <p className="text-xs text-red-600 opacity-80">請使用您的會員資料進行報名</p>
               </div>
            ) : (
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-center">
                  <p className="text-gray-800 font-bold flex items-center justify-center gap-2 mb-1"><Users size={20} /> 一般公開活動</p>
                  <p className="text-xs text-gray-500">歡迎所有來賓報名參加</p>
               </div>
            )}

            {/* 會員搜尋區塊 - 僅在會員活動顯示 */}
            {props.type === 'member' && (
              <div className="mb-6 relative">
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><UserCheck size={14} /> 請先查詢您的會員資料</p>
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input type="text" value={memberSearchTerm} onChange={(e) => { setMemberSearchTerm(e.target.value); setShowMemberResults(true); }} placeholder="輸入姓名或電話搜尋..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                       {showMemberResults && filteredMembers.length > 0 && (
                         <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                           {filteredMembers.map(m => (
                             <button key={m.id} type="button" onClick={() => handleSelectMember(m)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center group">
                               <div><div className="font-bold text-gray-800 group-hover:text-red-600">{m.name}</div><div className="text-xs text-gray-400">{m.member_no} | {m.brand_name || m.company}</div></div>
                               <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                             </button>
                           ))}
                         </div>
                       )}
                       {showMemberResults && memberSearchTerm.length > 0 && filteredMembers.length === 0 && <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-center text-xs text-gray-400">無相符會員資料</div>}
                    </div>
                 </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">姓名</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="請輸入真實姓名" readOnly={props.type === 'member'} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">手機號碼</label><input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="09xx-xxx-xxx" readOnly={props.type === 'member'} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">電子郵件</label><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="example@email.com" readOnly={props.type === 'member'} /></div>
              
              <div><label className="block text-sm font-bold text-gray-700 mb-2">公司/品牌名稱</label><input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="您的公司名稱" readOnly={props.type === 'member'} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">職務</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="您的目前職位" readOnly={props.type === 'member'} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">引薦人 (選填)</label><input type="text" value={formData.referrer} onChange={e => setFormData({...formData, referrer: e.target.value})} className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${props.type === 'member' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500'}`} placeholder="引薦您的分會成員姓名" readOnly={props.type === 'member'} /></div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Ticket size={16} /> 活動折扣券</label>
                <div className="flex gap-2">
                   <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus('idle'); setCouponMessage(''); }} className="flex-grow px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none uppercase font-mono placeholder:text-gray-300" placeholder="輸入代碼" disabled={couponStatus === 'valid'} />
                   {couponStatus !== 'valid' ? (
                     <button type="button" onClick={checkCoupon} disabled={!couponCode || couponStatus === 'validating'} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-gray-900 disabled:opacity-50 transition-colors">{couponStatus === 'validating' ? '檢查中...' : '使用'}</button>
                   ) : (
                     <button type="button" onClick={() => { setCouponStatus('idle'); setCouponCode(''); setDiscountAmount(0); setValidCouponId(undefined); setCouponMessage(''); }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">取消</button>
                   )}
                </div>
                {couponMessage && <p className={`text-xs font-bold mt-2 ${couponStatus === 'valid' ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>}
              </div>
              
              <button type="submit" disabled={isSubmitting || (props.type === 'member' && !formData.name)} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> 處理中...</> : <><span>{props.type === 'member' ? '確認會員資料並報名' : '前往報名'}</span><span className="bg-red-800/30 px-2 py-0.5 rounded text-sm">NT$ {finalPrice.toLocaleString()}</span></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
