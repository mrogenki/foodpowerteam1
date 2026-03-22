import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Save, Loader2, Send, Mail } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import html2pdf from 'html2pdf.js';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../constants';

export interface ReceiptData {
  receiptNo?: string;
  issueDate?: string;
  handlerName?: string;
  payerName: string;
  companyName?: string;
  taxId?: string;
  amount: number;
  paymentMethod?: string;
  feeType: 'initiation' | 'annual' | 'donation' | 'goods_donation';
  orderNo?: string;
  remarks?: string;
  email?: string;
  status?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ReceiptData;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, initialData }) => {
  // Convert current date to Gregorian year format (e.g., 2026年03月05日)
  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const [date, setDate] = useState(initialData.issueDate || getFormattedDate());
  const [receiptNo, setReceiptNo] = useState(initialData.receiptNo || '');
  const [payerName, setPayerName] = useState(() => {
    if (initialData.companyName && !initialData.payerName.includes(initialData.companyName)) {
      return `${initialData.payerName}（${initialData.companyName}）`;
    }
    return initialData.payerName;
  });
  const [taxId, setTaxId] = useState(initialData.taxId || '');
  const [amount, setAmount] = useState(initialData.amount);
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || '信用卡');
  
  const [selectedFeeType, setSelectedFeeType] = useState(initialData.feeType);
  
  const [orderNo, setOrderNo] = useState(initialData.orderNo || '');
  const [remarks, setRemarks] = useState(initialData.remarks || '');
  const [handler, setHandler] = useState(() => {
    if (initialData.handlerName === '許暐梃') return '許暐脡';
    return initialData.handlerName || '許暐脡';
  });
  const [email, setEmail] = useState(initialData.email || '');
  const [status, setStatus] = useState(initialData.status || 'issued');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateReceipt, setDuplicateReceipt] = useState<any>(null);
  
  const [sealImage, setSealImage] = useState<string | null>(() => {
    return localStorage.getItem('receipt_seal_image') || null;
  });

  useEffect(() => {
    const checkDuplicate = async () => {
      // If we are editing an existing receipt, don't show duplicate warning for itself
      if (isOpen && orderNo && (!initialData.receiptNo || orderNo !== initialData.orderNo)) {
        setIsCheckingDuplicate(true);
        try {
          const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('order_no', orderNo)
            .neq('receipt_no', receiptNo || '')
            .maybeSingle();

          if (error) throw error;
          setDuplicateReceipt(data || null);
        } catch (err) {
          console.error('Error checking duplicate receipt:', err);
          setDuplicateReceipt(null);
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setDuplicateReceipt(null);
      }
    };

    const timer = setTimeout(() => {
      checkDuplicate();
    }, 500); // Debounce check

    return () => clearTimeout(timer);
  }, [isOpen, orderNo, initialData.receiptNo, receiptNo, initialData.orderNo]);

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSealImage(base64String);
        localStorage.setItem('receipt_seal_image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !initialData.receiptNo) {
      const generateReceiptNo = async () => {
        try {
          // Get today's date in YYYYMMDD format
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const datePrefix = `${year}${month}${day}`;

          // Query the latest receipt for today
          const { data, error } = await supabase
            .from('receipts')
            .select('receipt_no')
            .like('receipt_no', `${datePrefix}%`)
            .order('receipt_no', { ascending: false })
            .limit(1);

          if (error) throw error;

          let nextSeq = 1;
          if (data && data.length > 0) {
            const lastNo = data[0].receipt_no;
            const lastSeqStr = lastNo.substring(8);
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) {
              nextSeq = lastSeq + 1;
            }
          }

          const newReceiptNo = `${datePrefix}${String(nextSeq).padStart(3, '0')}`;
          setReceiptNo(newReceiptNo);
        } catch (err) {
          console.error('Error generating receipt number:', err);
        }
      };

      generateReceiptNo();
    }
  }, [isOpen, initialData.receiptNo]);

  if (!isOpen) return null;

  const performSave = async (silent = false, newStatus?: string) => {
    const finalStatus = newStatus || status;
    if (!receiptNo) {
      if (!silent) alert('請輸入收據編號');
      return false;
    }

    // Check for duplicate order_no if this is a new receipt or order_no changed
    if (orderNo && (!initialData.receiptNo || orderNo !== initialData.orderNo)) {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('receipt_no')
          .eq('order_no', orderNo)
          .neq('receipt_no', receiptNo || '') // Exclude current receipt if updating
          .maybeSingle();
        
        if (data) {
          if (!silent) alert(`訂單編號 ${orderNo} 已經開立過收據 (編號: ${data.receipt_no})，不可重複開立。`);
          return false;
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }

    try {
      // 轉換為西元年儲存
      const match = date.match(/(\d+)年(\d+)月(\d+)日/);
      let issueDate = new Date().toISOString().split('T')[0];
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        issueDate = `${year}-${month}-${day}`;
      }

      const { error } = await supabase.from('receipts').upsert({
        receipt_no: receiptNo,
        payer_name: payerName,
        tax_id: taxId || null,
        amount: amount,
        payment_method: paymentMethod,
        fee_type: selectedFeeType,
        order_no: orderNo || null,
        issue_date: issueDate,
        handler_name: handler,
        note: remarks || null,
        status: finalStatus,
        email: email || null
      }, { onConflict: 'receipt_no' });

      if (error) throw error;
      if (newStatus) setStatus(newStatus);
      return true;
    } catch (err: any) {
      console.error('Error saving receipt:', err);
      if (!silent) alert('儲存失敗: ' + err.message);
      return false;
    }
  };

  const handleEmailReceipt = async () => {
    if (!email) {
      alert('請輸入收件人信箱');
      return;
    }
    if (!receiptNo) {
      alert('請先輸入收據編號');
      return;
    }

    setIsSending(true);
    try {
      if (!supabase) throw new Error('Supabase 客戶端未初始化');

      // 0. 先檢查是否有重複訂單編號 (如果是新收據或訂單編號已更改)
      if (orderNo && (!initialData.receiptNo || orderNo !== initialData.orderNo)) {
        const { data: dupData } = await supabase
          .from('receipts')
          .select('receipt_no')
          .eq('order_no', orderNo)
          .neq('receipt_no', receiptNo || '')
          .maybeSingle();
        
        if (dupData) {
          throw new Error(`訂單編號 ${orderNo} 已經開立過收據 (編號: ${dupData.receipt_no})，不可重複開立。`);
        }
      }

      // 1. 產生 PDF Blob
      const element = printRef.current;
      if (!element) throw new Error('找不到列印內容');

      const opt = {
        margin:       10,
        filename:     `收據_${receiptNo}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 1.5, // Reduced scale to prevent memory issues and hangs
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc: Document) => {
            // 1. NUCLEAR OPTION: Remove ALL existing style and link tags from the cloned document
            // This completely eliminates Tailwind v4's oklch/oklab variables from the PDF process
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(s => s.remove());

            // 2. Inject a MINIMAL and SAFE style sheet using only standard HEX colors
            const safeStyle = clonedDoc.createElement('style');
            safeStyle.textContent = `
              .receipt-pdf-fix {
                font-family: "Noto Sans TC", sans-serif !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                width: 100% !important;
                padding: 20px !important;
              }
              .receipt-pdf-fix * {
                box-sizing: border-box !important;
                border-color: #000000 !important;
              }
              .receipt-pdf-fix table {
                width: 100% !important;
                border-collapse: collapse !important;
                border: 1px solid #000000 !important;
                margin-bottom: 10px !important;
              }
              .receipt-pdf-fix td, .receipt-pdf-fix th {
                border: 1px solid #000000 !important;
                padding: 12px 8px !important;
                text-align: center !important;
              }
              .receipt-pdf-fix .text-left { text-align: left !important; }
              .receipt-pdf-fix .text-right { text-align: right !important; }
              .receipt-pdf-fix .font-bold { font-weight: bold !important; }
              .receipt-pdf-fix .bg-gray-100 { background-color: #f3f4f6 !important; }
              .receipt-pdf-fix .text-red-600 { color: #dc2626 !important; }
              .receipt-pdf-fix .text-xl { font-size: 20px !important; }
              .receipt-pdf-fix .text-2xl { font-size: 24px !important; }
              .receipt-pdf-fix .text-3xl { font-size: 30px !important; }
              .receipt-pdf-fix .mb-6 { margin-bottom: 24px !important; }
              .receipt-pdf-fix .flex { display: flex !important; }
              .receipt-pdf-fix .justify-between { justify-content: space-between !important; }
              .receipt-pdf-fix .items-center { align-items: center !important; }
              .receipt-pdf-fix .gap-2 { gap: 8px !important; }
              .receipt-pdf-fix .mt-4 { margin-top: 16px !important; }
              .receipt-pdf-fix .tracking-widest { letter-spacing: 0.1em !important; }
              .receipt-pdf-fix img { display: block !important; margin: 0 auto !important; }
            `;
            clonedDoc.head.appendChild(safeStyle);

            const printable = clonedDoc.querySelector('.receipt-pdf-fix') as HTMLElement;
            if (printable) {
              // Ensure the root element is clean
              printable.style.backgroundColor = '#ffffff';
              printable.style.color = '#000000';
              
              // Remove any remaining shadow/filter properties that might use oklch
              const all = printable.getElementsByTagName('*');
              for (let i = 0; i < all.length; i++) {
                const el = all[i] as HTMLElement;
                el.style.boxShadow = 'none';
                el.style.filter = 'none';
                el.style.backdropFilter = 'none';
              }
            }
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };
      
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

      // 2. 上傳到 Supabase Storage
      const fileName = `${Date.now()}_${receiptNo}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

      if (uploadError) throw new Error(`上傳失敗: ${uploadError.message}`);

      // 3. 取得公開連結
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // 4. 透過 EmailJS 寄送
      const templateParams = {
        email: email,        // 對應模板中的 {{email}}
        to_name: payerName,  // 對應模板中的 {{to_name}}
        order_id: receiptNo, // 對應模板中的 {{order_id}}
        amount: amount,      // 對應模板中的 {{amount}}
        receipt_link: publicUrl // 對應模板中的 {{receipt_link}}
      };

      const emailResponse = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.RECEIPT_TEMPLATE_ID,
        templateParams,
        EMAIL_CONFIG.PUBLIC_KEY
      );

      if (emailResponse.status !== 200) {
        throw new Error(`EmailJS 寄送失敗: ${emailResponse.text}`);
      }

      // 自動儲存收據到資料庫，並標記為已寄出
      const saved = await performSave(true, 'sent');

      if (saved) {
        alert('收據已成功寄出並儲存！');
      } else {
        alert('收據已寄出，但儲存到資料庫時失敗 (可能是收據編號重複或網路問題)。');
      }
    } catch (err: any) {
      console.error('Email receipt error:', err);
      let errorMsg = '';
      
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      } else if (err && typeof err === 'object') {
        errorMsg = err.text || err.message || JSON.stringify(err);
      }
      
      if (!errorMsg || errorMsg === 'undefined' || errorMsg === '{}') {
        errorMsg = '請檢查網路連線、EmailJS 模板設定 (template_receipt) 或 Supabase 儲存空間權限。';
      }
      
      // Use setTimeout to prevent UI hang and allow the browser to recover before showing alert
      setTimeout(() => {
        alert('寄送失敗: ' + errorMsg);
      }, 100);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await performSave();
    if (success) {
      alert('收據儲存成功！');
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto print:overflow-visible print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header - Hidden in print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b print:hidden gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">開立收據</h2>
            {isCheckingDuplicate && <Loader2 size={18} className="animate-spin text-blue-500" />}
            {duplicateReceipt && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold animate-pulse">
                警告：此訂單已開立過收據 ({duplicateReceipt.receipt_no})
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border flex-grow md:flex-grow-0">
              <Mail size={18} className="text-gray-400" />
              <input 
                type="email" 
                placeholder="收件人信箱" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full md:w-48"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleSave} 
                disabled={isSaving || !!duplicateReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                儲存
              </button>
              <button 
                onClick={handleEmailReceipt} 
                disabled={isSending || !email || !!duplicateReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                寄送收據
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full ml-2">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 print:p-0 bg-white text-black receipt-pdf-fix" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
          
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-widest mb-2">食在力量美食產業交流協會</h1>
            <h2 className="text-2xl font-bold tracking-[1em] ml-[1em]">收據</h2>
          </div>

          {/* Top Info */}
          <div className="mb-2 text-xl space-y-2">
            <div className="flex justify-between items-center">
              <p>立案字號：台內團字第1130012253號</p>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 min-w-[280px]" style={{ backgroundColor: '#f3f4f6' }}>
                <span>日期：</span>
                <input type="text" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none outline-none flex-grow text-left print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>統一編號：00509918</p>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 min-w-[280px]" style={{ backgroundColor: '#f3f4f6' }}>
                <span>編號：</span>
                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="bg-transparent border-none outline-none flex-grow text-red-600 font-bold print:appearance-none" style={{ backgroundColor: 'transparent', color: '#dc2626' }} placeholder="00000" />
              </div>
            </div>
          </div>

          {/* Main Table */}
          <table className="w-full border-collapse border border-black text-xl text-center" style={{ borderColor: '#000000' }}>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-3 w-[12%]" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>茲收到</td>
                <td className="border border-black py-3 w-[58%] text-left px-4" colSpan={3} style={{ borderColor: '#000000' }}>
                  <input type="text" value={payerName} onChange={e => setPayerName(e.target.value)} className="w-full outline-none print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }} />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-3 w-[15%]" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>統一編號</td>
                <td className="border border-black py-3 w-[15%]" style={{ borderColor: '#000000' }}>
                  <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full outline-none text-center print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }} />
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-3" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>NT$</td>
                <td className="border border-black py-3 text-left px-4" colSpan={3} style={{ borderColor: '#000000' }}>
                  <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full outline-none print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }} />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-3" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>支付方式</td>
                <td className="border border-black py-3" style={{ borderColor: '#000000' }}>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full outline-none text-center bg-transparent print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }}>
                    <option value="信用卡">信用卡</option>
                    <option value="匯款">匯款</option>
                    <option value="現金">現金</option>
                    <option value="其他">其他</option>
                  </select>
                </td>
              </tr>

              {/* Row 3 - Combined Income Types */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-3" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>款項項目</td>
                <td className="border border-black py-3 px-4" colSpan={5} style={{ borderColor: '#000000' }}>
                  <div className="flex flex-wrap items-center justify-around gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFeeType === 'initiation'} onChange={() => setSelectedFeeType('initiation')} className="w-6 h-6 cursor-pointer" />
                      <span>入會費</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFeeType === 'annual'} onChange={() => setSelectedFeeType('annual')} className="w-6 h-6 cursor-pointer" />
                      <span>年費</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFeeType === 'donation'} onChange={() => setSelectedFeeType('donation')} className="w-6 h-6 cursor-pointer" />
                      <span>捐款</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFeeType === 'goods_donation'} onChange={() => setSelectedFeeType('goods_donation')} className="w-6 h-6 cursor-pointer" />
                      <span>捐物</span>
                      <span className="text-gray-400 text-sm font-normal ml-1" style={{ color: '#9ca3af' }}>(若為捐物請於備註說明品項)</span>
                    </label>
                  </div>
                </td>
              </tr>

              {/* Row 5 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-3" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>訂單編號</td>
                <td className="border border-black py-3 text-left px-4" colSpan={3} style={{ borderColor: '#000000' }}>
                  <input type="text" value={orderNo} onChange={e => setOrderNo(e.target.value)} className="w-full outline-none print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }} />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-3" colSpan={2} style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>協會簽章</td>
              </tr>

              {/* Row 6 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-3 h-36 align-top pt-4" style={{ borderColor: '#000000', backgroundColor: '#f3f4f6' }}>備註</td>
                <td className="border border-black py-3 text-left px-4 align-top pt-4" colSpan={3} style={{ borderColor: '#000000' }}>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full h-full outline-none resize-none print:appearance-none font-bold" rows={4} style={{ backgroundColor: 'transparent', color: '#000000' }} />
                </td>
                <td className="border border-black py-3 relative group" colSpan={2} style={{ borderColor: '#000000' }}>
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {sealImage ? (
                      <img 
                        src={sealImage} 
                        alt="協會簽章" 
                        className="max-h-full max-w-full object-contain opacity-90" 
                        style={{ height: '110px' }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xl flex flex-col items-center">
                        <span className="mb-1">尚未設定印章</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden">
                    <span className="text-sm font-bold">{sealImage ? '更換印章' : '上傳印章'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSealUpload} />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Info */}
          <div className="flex justify-between items-center mt-4 text-xl font-bold">
            <div>理事長：<span className="ml-2">許淳凱</span></div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1" style={{ backgroundColor: '#f3f4f6' }}>
              <span>經手人：</span>
              <select value={handler} onChange={e => setHandler(e.target.value)} className="bg-transparent border-none outline-none print:appearance-none font-bold" style={{ backgroundColor: 'transparent', color: '#000000' }}>
                <option value="許暐脡">許暐脡</option>
                <option value="許淳凱">許淳凱</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-red-600 font-bold text-xl flex gap-6" style={{ color: '#dc2626' }}>
            <span>台北富邦-古亭分行</span>
            <span>戶名：食在力量美食產業交流協會</span>
            <span>帳號：82120000168305</span>
          </div>

        </div>
      </div>
      
      {/* Print and PDF Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Fix for html2canvas oklch error in Tailwind v4 */
        .receipt-pdf-fix {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .receipt-pdf-fix .bg-gray-100 { background-color: #f3f4f6 !important; }
        .receipt-pdf-fix .bg-gray-50 { background-color: #f9fafb !important; }
        .receipt-pdf-fix .text-red-600 { color: #dc2626 !important; }
        .receipt-pdf-fix .text-gray-400 { color: #9ca3af !important; }
        .receipt-pdf-fix .text-gray-500 { color: #6b7280 !important; }
        .receipt-pdf-fix .text-gray-900 { color: #111827 !important; }
        .receipt-pdf-fix .bg-gray-200 { background-color: #e5e7eb !important; }
        .receipt-pdf-fix .border-black { border-color: #000000 !important; }
        .receipt-pdf-fix .border { border-color: #000000 !important; }
        .receipt-pdf-fix input, .receipt-pdf-fix textarea, .receipt-pdf-fix select {
          color: #000000 !important;
          background-color: transparent !important;
        }
        .receipt-pdf-fix input.text-red-600 { color: #dc2626 !important; }
        .receipt-pdf-fix .text-red-600 { color: #dc2626 !important; }

        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: transparent;
          }
          .fixed.inset-0 > div {
            box-shadow: none;
            max-width: 100%;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:appearance-none {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border: none;
            background: transparent;
            color: black;
          }
          select.print\\:appearance-none {
            background-image: none;
          }
          input, textarea, select {
            font-family: 'Noto Sans TC', sans-serif !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Make sure the printable area and its children are visible */
          .fixed.inset-0, .fixed.inset-0 * {
            visibility: visible;
          }
          /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}} />
    </div>
  );
};

export default ReceiptModal;
