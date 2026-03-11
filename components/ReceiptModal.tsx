import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Save, Loader2, Download, Send, Mail } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import html2pdf from 'html2pdf.js';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../constants';

export interface ReceiptData {
  receiptNo?: string;
  issueDate?: string;
  handlerName?: string;
  payerName: string;
  taxId?: string;
  amount: number;
  paymentMethod?: string;
  feeType: 'initiation' | 'annual' | 'activity' | 'donation' | 'sponsorship' | 'other';
  orderNo?: string;
  remarks?: string;
  email?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ReceiptData;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, initialData }) => {
  // Convert current date to Taiwan year format (e.g., 115年03月05日)
  const getTaiwanDate = () => {
    const date = new Date();
    const twYear = date.getFullYear() - 1911;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${twYear}年${month}月${day}日`;
  };

  const [date, setDate] = useState(initialData.issueDate || getTaiwanDate());
  const [receiptNo, setReceiptNo] = useState(initialData.receiptNo || '');
  const [payerName, setPayerName] = useState(initialData.payerName);
  const [taxId, setTaxId] = useState(initialData.taxId || '');
  const [amount, setAmount] = useState(initialData.amount);
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || '信用卡');
  
  const [initiationFee, setInitiationFee] = useState(initialData.feeType === 'initiation' ? initialData.amount : '');
  const [annualFee, setAnnualFee] = useState(initialData.feeType === 'annual' ? initialData.amount : '');
  const [activityFee, setActivityFee] = useState(initialData.feeType === 'activity' ? initialData.amount : '');
  const [donation, setDonation] = useState(initialData.feeType === 'donation' ? initialData.amount : '');
  const [sponsorship, setSponsorship] = useState(initialData.feeType === 'sponsorship' ? initialData.amount : '');
  const [otherFee, setOtherFee] = useState(initialData.feeType === 'other' ? initialData.amount : '');
  
  const [orderNo, setOrderNo] = useState(initialData.orderNo || '');
  const [remarks, setRemarks] = useState(initialData.remarks || '');
  const [handler, setHandler] = useState(initialData.handlerName || '許暐梃');
  const [email, setEmail] = useState(initialData.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [sealImage, setSealImage] = useState<string | null>(() => {
    return localStorage.getItem('receipt_seal_image') || null;
  });

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

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      const element = printRef.current;
      const opt = {
        margin:       10,
        filename:     `收據_${receiptNo || '未命名'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('下載 PDF 失敗');
    } finally {
      setIsDownloading(false);
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
      // 1. 產生 PDF Blob
      const element = printRef.current;
      const opt = {
        margin:       10,
        filename:     `收據_${receiptNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

      // 2. 上傳到 Supabase Storage
      const fileName = `${Date.now()}_${receiptNo}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      // 3. 取得公開連結
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // 4. 透過 EmailJS 寄送
      const templateParams = {
        to_email: email,
        to_name: payerName,
        receipt_no: receiptNo,
        amount: amount,
        receipt_link: publicUrl
      };

      await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.RECEIPT_TEMPLATE_ID,
        templateParams,
        EMAIL_CONFIG.PUBLIC_KEY
      );

      alert('收據已成功寄出！');
    } catch (err: any) {
      console.error('Email receipt error:', err);
      alert('寄送失敗: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    if (!receiptNo) {
      alert('請輸入收據編號');
      return;
    }

    setIsSaving(true);
    try {
      // 轉換民國年為西元年儲存
      const match = date.match(/(\d+)年(\d+)月(\d+)日/);
      let issueDate = new Date().toISOString().split('T')[0];
      if (match) {
        const year = parseInt(match[1]) + 1911;
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
        fee_type: initialData.feeType,
        order_no: orderNo || null,
        issue_date: issueDate,
        handler_name: handler,
        note: remarks || null
      }, { onConflict: 'receipt_no' });

      if (error) {
        throw error;
      }

      alert('收據儲存成功！');
    } catch (err: any) {
      console.error('Error saving receipt:', err);
      alert('儲存失敗: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto print:overflow-visible print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header - Hidden in print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b print:hidden gap-4">
          <h2 className="text-2xl font-bold">開立收據</h2>
          
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
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                儲存
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                下載 PDF
              </button>
              <button 
                onClick={handleEmailReceipt} 
                disabled={isSending || !email}
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
        <div ref={printRef} className="p-8 print:p-0 bg-white text-black" style={{ fontFamily: '"MingLiU", "PMingLiU", serif' }}>
          
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-widest mb-2">食在力量美食產業交流協會</h1>
            <h2 className="text-2xl font-bold tracking-[1em] ml-[1em]">收據</h2>
          </div>

          {/* Top Info */}
          <div className="flex justify-between items-end mb-2 text-sm">
            <div>
              <p>立案字號：台內團字第1130012253號</p>
              <p>扣繳單位統一編號：00509918</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1">
                <span>日期：</span>
                <input type="text" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none outline-none w-28 text-right print:appearance-none" />
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1">
                <span>收據編號：</span>
                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="bg-transparent border-none outline-none w-20 text-red-600 font-bold print:appearance-none" placeholder="00000" />
              </div>
            </div>
          </div>

          {/* Main Table */}
          <table className="w-full border-collapse border border-black text-sm text-center">
            <tbody>
              {/* Row 1 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2 w-[15%] text-lg">茲收到</td>
                <td className="border border-black py-2 w-[55%] text-left px-4 text-lg" colSpan={3}>
                  <input type="text" value={payerName} onChange={e => setPayerName(e.target.value)} className="w-full outline-none print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2 w-[15%]">統一編號：</td>
                <td className="border border-black py-2 w-[15%]">
                  <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2 text-lg">NT$</td>
                <td className="border border-black py-2 text-left px-4 text-lg" colSpan={3}>
                  <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full outline-none print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2">支付方式：</td>
                <td className="border border-black py-2">
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full outline-none text-center bg-transparent print:appearance-none">
                    <option value="信用卡">信用卡</option>
                    <option value="匯款">匯款</option>
                    <option value="現金">現金</option>
                    <option value="其他">其他</option>
                  </select>
                </td>
              </tr>

              {/* Row 3 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2">入會費：</td>
                <td className="border border-black py-2 w-[18.33%]">
                  <input type="text" value={initiationFee} onChange={e => setInitiationFee(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2 w-[15%]">活動費：</td>
                <td className="border border-black py-2 w-[18.33%]">
                  <input type="text" value={activityFee} onChange={e => setActivityFee(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2">捐款：</td>
                <td className="border border-black py-2">
                  <input type="text" value={donation} onChange={e => setDonation(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
              </tr>

              {/* Row 4 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2">年費：</td>
                <td className="border border-black py-2">
                  <input type="text" value={annualFee} onChange={e => setAnnualFee(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2">贊助費：</td>
                <td className="border border-black py-2">
                  <input type="text" value={sponsorship} onChange={e => setSponsorship(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2">其他：</td>
                <td className="border border-black py-2">
                  <input type="text" value={otherFee} onChange={e => setOtherFee(e.target.value)} className="w-full outline-none text-center print:appearance-none" />
                </td>
              </tr>

              {/* Row 5 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2">訂單編號：</td>
                <td className="border border-black py-2 text-left px-4" colSpan={3}>
                  <input type="text" value={orderNo} onChange={e => setOrderNo(e.target.value)} className="w-full outline-none print:appearance-none" />
                </td>
                <td className="border border-black bg-gray-100 font-bold py-2" colSpan={2}>協會簽章</td>
              </tr>

              {/* Row 6 */}
              <tr>
                <td className="border border-black bg-gray-100 font-bold py-2 h-32 align-top pt-4">備註：</td>
                <td className="border border-black py-2 text-left px-4 align-top pt-4" colSpan={3}>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full h-full outline-none resize-none print:appearance-none" rows={4} />
                </td>
                <td className="border border-black py-2 relative group" colSpan={2}>
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {sealImage ? (
                      <img 
                        src={sealImage} 
                        alt="協會簽章" 
                        className="max-h-full max-w-full object-contain opacity-90" 
                        style={{ height: '100px' }}
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex flex-col items-center">
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
          <div className="flex justify-between items-center mt-4 text-sm font-bold">
            <div>理事長：<span className="ml-2">許淳凱</span></div>
            <div>會計：<span className="ml-2">張曉萍</span></div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1">
              <span>經手人：</span>
              <select value={handler} onChange={e => setHandler(e.target.value)} className="bg-transparent border-none outline-none print:appearance-none">
                <option value="許暐梃">許暐梃</option>
                <option value="許淳凱">許淳凱</option>
                <option value="張曉萍">張曉萍</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-red-600 font-bold text-sm flex gap-6">
            <span>台北富邦-古亭分行</span>
            <span>戶名：食在力量美食產業交流協會</span>
            <span>帳號：82120000168305</span>
          </div>

        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
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
