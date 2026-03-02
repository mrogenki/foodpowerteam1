import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Member, PaymentStatus } from '../types';
import { Loader2, Search, CheckCircle, XCircle, Send, RefreshCcw, Ban, CreditCard } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../constants';

interface MemberRenewal {
  id: string;
  member_id: string;
  member_name: string; // Joined
  member_no: string;   // Joined
  renewal_date: string;
  amount: number;
  payment_status: string;
  merchant_order_no: string;
  created_at: string;
  payment_method?: string;
}

const translatePaymentMethod = (method?: string) => {
  if (!method) return '-';
  const map: Record<string, string> = {
    'CREDIT': '信用卡',
    'VACC': 'ATM轉帳',
    'WEBATM': 'WebATM',
    'CVS': '超商代碼',
    'BARCODE': '超商條碼',
    'LINEPAY': 'Line Pay',
    'manual_admin': '手動標記',
    'ALIPAY': '支付寶',
    'WECHATPAY': '微信支付'
  };
  return map[method] || method;
};

const MemberRenewalManager: React.FC = () => {
  const [renewals, setRenewals] = useState<MemberRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string[]>([]);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('member_renewals')
        .select(`
          *,
          member:members (
            name,
            member_no,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((item: any) => ({
        ...item,
        member_name: item.member?.name || '未知會員',
        member_no: item.member?.member_no || '---',
        member_email: item.member?.email
      }));

      setRenewals(formattedData);
    } catch (err) {
      console.error('Error fetching renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleMarkAsPaid = async (renewal: MemberRenewal) => {
    if (!confirm(`確定將 ${renewal.member_name} 的續約標記為已付款？\n這將會自動更新會員的會籍到期日。`)) return;

    try {
      // 1. Update renewal status
      const { error: updateError } = await supabase
        .from('member_renewals')
        .update({ 
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: 'manual_admin'
        })
        .eq('id', renewal.id);

      if (updateError) throw updateError;

      // 2. Update member expiry date
      // Fetch current member data first to get current expiry and payment records
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('membership_expiry_date, payment_records')
        .eq('id', renewal.member_id)
        .single();
        
      if (memberError) throw memberError;

      let newExpiryDate;
      const currentExpiry = new Date(memberData.membership_expiry_date);
      const today = new Date();
      
      // Logic: If not expired, add 1 year to current expiry. If expired, add 1 year to today.
      if (currentExpiry > today) {
        newExpiryDate = new Date(currentExpiry.setFullYear(currentExpiry.getFullYear() + 1));
      } else {
        newExpiryDate = new Date(today.setFullYear(today.getFullYear() + 1));
      }

      // Append payment record
      let currentRecords = [];
      try {
        if (memberData.payment_records) {
          currentRecords = JSON.parse(memberData.payment_records);
        }
      } catch (e) {
        currentRecords = [];
      }

      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        amount: renewal.amount || 0,
        note: `會籍續約 (手動標記) - 訂單編號: ${renewal.merchant_order_no || '無'}`
      };

      currentRecords.push(newRecord);

      const { error: extendError } = await supabase
        .from('members')
        .update({
          membership_expiry_date: newExpiryDate.toISOString().split('T')[0],
          status: 'active',
          payment_records: JSON.stringify(currentRecords)
        })
        .eq('id', renewal.member_id);

      if (extendError) throw extendError;

      alert('更新成功！會籍已延長。');
      fetchRenewals();

    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('更新失敗: ' + err.message);
    }
  };

  const handleResendLink = async (renewal: any) => {
    if (!renewal.member_email) {
      alert('此會員無 Email 資料');
      return;
    }
    
    if (!confirm(`確定重寄付款連結給 ${renewal.member_name}?`)) return;

    setSendingEmail(prev => [...prev, renewal.id]);
    
    const renewalPaymentLink = `${window.location.origin}/#/pay-renewal/${renewal.id}`;

    try {
      await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.MEMBER_JOIN_TEMPLATE_ID,
        {
          to_name: renewal.member_name,
          email: renewal.member_email,
          payment_link: renewalPaymentLink,
          message: `您的會員續約訂單 (單號: ${renewal.merchant_order_no}) 尚未完成付款，請點擊連結完成繳費。`
        },
        EMAIL_CONFIG.PUBLIC_KEY
      );
      
      // Copy to clipboard for manual sharing
      await navigator.clipboard.writeText(renewalPaymentLink);
      alert('已發送 Email 連結，且付款連結已複製到剪貼簿，您可以直接貼上傳送給會員。');
    } catch (e: any) {
      console.error(e);
      alert('發送失敗');
    } finally {
      setSendingEmail(prev => prev.filter(id => id !== renewal.id));
    }
  };

  const handleMarkAsProcessed = async (renewal: MemberRenewal) => {
    if (!confirm(`確定將 ${renewal.member_name} 的續約標記為「已處理」？\n(這表示您已經開立收據並完成相關人工確認)`)) return;

    try {
      const { error: updateError } = await supabase
        .from('member_renewals')
        .update({ 
          payment_status: 'processed'
        })
        .eq('id', renewal.id);

      if (updateError) throw updateError;

      alert('已標記為已處理！');
      fetchRenewals();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('更新失敗: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要永久刪除這筆續約紀錄嗎？此操作無法復原。')) return;

    try {
      const { data, error } = await supabase
        .from('member_renewals')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('權限不足或找不到該筆資料 (請確認資料庫 RLS 刪除權限已開啟)');
      }
      
      alert('已刪除紀錄');
      fetchRenewals();
    } catch (err: any) {
      console.error('Error deleting renewal:', err);
      alert('刪除失敗: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  const pendingRenewals = renewals.filter(r => r.payment_status !== 'processed');
  const processedRenewals = renewals.filter(r => r.payment_status === 'processed');

  const renderTable = (items: MemberRenewal[], isProcessed: boolean) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800">{isProcessed ? '已處理續約' : '待處理續約'} <span className="text-sm font-normal text-gray-500 ml-2">共 {items.length} 筆</span></h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4">申請日期</th>
              <th className="p-4">會員</th>
              <th className="p-4">金額</th>
              <th className="p-4">狀態</th>
              <th className="p-4">付款方式</th>
              <th className="p-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(renewal => (
              <tr key={renewal.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-500">{renewal.renewal_date}</td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{renewal.member_name}</div>
                  <div className="text-xs text-gray-400">{renewal.member_no}</div>
                  {renewal.merchant_order_no && <div className="text-[10px] text-gray-400 font-mono">#{renewal.merchant_order_no}</div>}
                </td>
                <td className="p-4 font-mono">NT$ {renewal.amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    renewal.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                    renewal.payment_status === 'processed' ? 'bg-gray-100 text-gray-700' :
                    renewal.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {renewal.payment_status === 'paid' ? '已付款' : 
                     renewal.payment_status === 'processed' ? '已處理' :
                     renewal.payment_status === 'failed' ? '失敗' : '待付款'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {translatePaymentMethod(renewal.payment_method)}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {!isProcessed && renewal.payment_status !== 'paid' && (
                    <>
                      <button 
                        onClick={() => handleMarkAsPaid(renewal)}
                        className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 font-bold"
                      >
                        標記已付
                      </button>
                      <button 
                        onClick={() => handleResendLink(renewal)}
                        disabled={sendingEmail.includes(renewal.id)}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold flex items-center gap-1"
                      >
                        {sendingEmail.includes(renewal.id) ? <Loader2 size={10} className="animate-spin"/> : <Send size={10}/>}
                        重寄
                      </button>
                    </>
                  )}
                  {!isProcessed && renewal.payment_status === 'paid' && (
                    <button 
                      onClick={() => handleMarkAsProcessed(renewal)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle size={12}/> 確認已處理
                    </button>
                  )}
                  {isProcessed && (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle size={12}/> 完成</span>
                  )}
                  <button 
                    onClick={() => handleDelete(renewal.id)}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors ml-auto flex items-center gap-1"
                    title="刪除紀錄"
                  >
                    <XCircle size={14} /> 刪除
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">目前無{isProcessed ? '已處理' : '待處理'}續約申請</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">會員續約管理</h2>
          <p className="text-gray-500 text-sm mt-1">此處顯示會員的續約紀錄，確認款項與開立收據後，可標記為「已處理」。</p>
        </div>
        <button onClick={fetchRenewals} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
          <RefreshCcw size={18} /> 重新整理
        </button>
      </div>

      {renderTable(pendingRenewals, false)}
      {renderTable(processedRenewals, true)}
    </div>
  );
};

export default MemberRenewalManager;
