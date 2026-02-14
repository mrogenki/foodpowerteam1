
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentResult: React.FC = () => {
  const [lastActivityUrl, setLastActivityUrl] = useState<string | null>(null);

  useEffect(() => {
    // 嘗試從 sessionStorage 讀取上一個活動頁面的網址
    const url = sessionStorage.getItem('last_activity_url');
    if (url) {
      setLastActivityUrl(url);
      // 可選擇是否要清除，暫時保留以防使用者重新整理
      // sessionStorage.removeItem('last_activity_url');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">付款程序完成</h1>
        
        <div className="space-y-4 text-gray-600 mb-8">
          <p>
            感謝您的報名與付款！<br/>
            第三方金流平台已接收您的款項。
          </p>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 text-left">
            <p className="font-bold mb-1 flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> 系統自動核銷中：</p>
            <p>
              系統正在背景接收金流通知並自動更新您的報名狀態為「已付款」。<br/>
              這通常在 1~3 分鐘內完成，您無需進行任何操作。
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-600 text-left mt-2">
            <p className="font-bold mb-1 flex items-center gap-1"><Mail size={14}/> 收信提醒：</p>
            <p>
              若您未收到報名確認信，請檢查您的「垃圾郵件夾」或「促銷內容」分頁。
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            <Home size={18} /> 回首頁
          </Link>
          
          {lastActivityUrl && (
            <Link to={lastActivityUrl} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
              <ArrowLeft size={18} /> 返回活動
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
