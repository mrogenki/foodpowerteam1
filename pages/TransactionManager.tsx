import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown, FileText, Download, X, Filter, ArrowUpCircle, ArrowDownCircle, PieChart, Upload, User, Hash, ImageIcon } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Transaction } from '../types';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const TransactionManager: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTx, setCurrentTx] = useState<Partial<Transaction>>({});
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expenditure'>('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.category.toLowerCase().includes(search.toLowerCase()) || 
        (tx.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (tx.entity?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (tx.invoice_number?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesMonth = tx.date.startsWith(selectedMonth);
      const matchesType = filterType === 'all' || tx.type === filterType;
      return matchesSearch && matchesMonth && matchesType;
    });
  }, [transactions, search, selectedMonth, filterType]);

  const stats = useMemo(() => {
    const monthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth));
    const income = monthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expenditure = monthTxs.filter(tx => tx.type === 'expenditure').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const profit = income - expenditure;
    
    // Group by category for income and expenditure
    const incomeByCategory: Record<string, number> = {};
    const expenditureByCategory: Record<string, number> = {};
    
    monthTxs.forEach(tx => {
      if (tx.type === 'income') {
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + Number(tx.amount);
      } else {
        expenditureByCategory[tx.category] = (expenditureByCategory[tx.category] || 0) + Number(tx.amount);
      }
    });

    return { income, expenditure, profit, incomeByCategory, expenditureByCategory };
  }, [transactions, selectedMonth]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `transactions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath);

      setCurrentTx({ ...currentTx, document_url: publicUrl });
    } catch (err: any) {
      alert('上傳失敗: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTx.date || !currentTx.type || !currentTx.category || !currentTx.amount) {
      alert('請填寫完整資訊');
      return;
    }

    try {
      if (currentTx.id) {
        const { error } = await supabase
          .from('transactions')
          .update(currentTx)
          .eq('id', currentTx.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([currentTx]);
        if (error) throw error;
      }
      
      setIsEditing(false);
      setCurrentTx({});
      fetchTransactions();
    } catch (err: any) {
      alert('儲存失敗: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此筆記錄嗎？')) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchTransactions();
    } catch (err: any) {
      alert('刪除失敗: ' + err.message);
    }
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map(tx => ({
      '日期': tx.date,
      '類型': tx.type === 'income' ? '收入' : '支出',
      '類別': tx.category,
      '金額': tx.amount,
      '收支對象': tx.entity || '',
      '說明': tx.description || '',
      '發票號碼': tx.invoice_number || '',
      '備註': tx.note || '',
      '單據連結': tx.document_url || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "收支明細");
    XLSX.writeFile(wb, `協會收支明細_${selectedMonth}.xlsx`);
  };

  const generatePDF = () => {
    const element = document.getElementById('pnl-report');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `協會損益表_${selectedMonth}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">收支管理</h1>
          <p className="text-gray-500">管理協會的收入與支出，並生成損益報表。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Calendar size={18} className="text-gray-500" />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-none focus:ring-0 text-gray-700 font-medium outline-none bg-transparent"
            />
          </div>
          <button 
            onClick={() => { setCurrentTx({ date: new Date().toISOString().slice(0, 10), type: 'income', amount: 0 }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100"
          >
            <Plus size={18} /> 新增記錄
          </button>
        </div>
      </div>

      {/* 損益概況 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{selectedMonth}</span>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">本月總收入</p>
          <p className="text-3xl font-bold text-green-600 mt-1">NT$ {stats.income.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><TrendingDown size={20} /></div>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{selectedMonth}</span>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">本月總支出</p>
          <p className="text-3xl font-bold text-red-600 mt-1">NT$ {stats.expenditure.toLocaleString()}</p>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${stats.profit >= 0 ? 'bg-gray-900 text-white border-gray-800' : 'bg-red-900 text-white border-red-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.profit >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/20 text-white'}`}><DollarSign size={20} /></div>
            <span className="text-xs font-bold bg-white/10 text-white/80 px-2 py-1 rounded">{selectedMonth}</span>
          </div>
          <p className="text-sm text-white/60 font-bold uppercase tracking-wider">本月淨損益</p>
          <p className="text-3xl font-bold mt-1">NT$ {stats.profit.toLocaleString()}</p>
        </div>
      </div>

      {/* 損益表 (P&L) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-red-600" />
            {selectedMonth} 損益表
          </h3>
          <div className="flex items-center gap-4">
            <button onClick={exportToExcel} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors">
              <Download size={16} /> 匯出 Excel
            </button>
            <button onClick={generatePDF} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors">
              <FileText size={16} /> 下載 PDF
            </button>
          </div>
        </div>
        <div id="pnl-report">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* 收入明細 */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ArrowUpCircle size={16} className="text-green-500" /> 收入項目
              </h4>
              <div className="space-y-3">
                {Object.entries(stats.incomeByCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-700">{cat}</span>
                    <span className="font-mono font-bold text-gray-900">NT$ {amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(stats.incomeByCategory).length === 0 && <p className="text-gray-400 text-sm italic">本月無收入記錄</p>}
                <div className="flex justify-between items-center pt-4 text-lg font-bold text-green-600">
                  <span>收入合計</span>
                  <span>NT$ {stats.income.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 支出明細 */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ArrowDownCircle size={16} className="text-red-500" /> 支出項目
              </h4>
              <div className="space-y-3">
                {Object.entries(stats.expenditureByCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-700">{cat}</span>
                    <span className="font-mono font-bold text-gray-900">NT$ {amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(stats.expenditureByCategory).length === 0 && <p className="text-gray-400 text-sm italic">本月無支出記錄</p>}
                <div className="flex justify-between items-center pt-4 text-lg font-bold text-red-600">
                  <span>支出合計</span>
                  <span>NT$ {stats.expenditure.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
            <span className="text-xl font-bold text-gray-900">本月淨利 (Net Profit)</span>
            <span className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              NT$ {stats.profit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 明細列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">收支明細</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="搜尋類別或說明..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">全部類型</option>
              <option value="income">僅收入</option>
              <option value="expenditure">僅支出</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4">日期</th>
                <th className="p-4">類型</th>
                <th className="p-4">對象 / 類別</th>
                <th className="p-4">金額</th>
                <th className="p-4">說明 / 單據</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-mono">{tx.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <User size={12} /> {tx.entity || '未填寫對象'}
                    </div>
                    <div className="font-bold text-gray-900">{tx.category}</div>
                  </td>
                  <td className={`p-4 font-mono font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="text-gray-900">{tx.description || '-'}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {tx.invoice_number && (
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Hash size={10} /> {tx.invoice_number}
                        </div>
                      )}
                      {tx.document_url && (
                        <a 
                          href={tx.document_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <ImageIcon size={10} /> 查看單據
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setCurrentTx(tx); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(tx.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">尚無符合條件的記錄</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 編輯彈窗 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{currentTx.id ? '編輯記錄' : '新增收支記錄'}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">日期</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                    value={currentTx.date || ''} 
                    onChange={(e) => setCurrentTx({ ...currentTx, date: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">類型</label>
                  <select 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                    value={currentTx.type || 'income'} 
                    onChange={(e) => setCurrentTx({ ...currentTx, type: e.target.value as any })}
                  >
                    <option value="income">收入</option>
                    <option value="expenditure">支出</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">類別</label>
                  <input 
                    type="text" 
                    placeholder="例如：會費、活動費..."
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                    value={currentTx.category || ''} 
                    onChange={(e) => setCurrentTx({ ...currentTx, category: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">收支對象</label>
                  <input 
                    type="text" 
                    placeholder="例如：廠商名稱、會員姓名..."
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                    value={currentTx.entity || ''} 
                    onChange={(e) => setCurrentTx({ ...currentTx, entity: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">金額</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">NT$</span>
                  <input 
                    type="number" 
                    className="w-full p-3 pl-14 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold" 
                    value={currentTx.amount || 0} 
                    onChange={(e) => setCurrentTx({ ...currentTx, amount: Number(e.target.value) })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">說明</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                  value={currentTx.description || ''} 
                  onChange={(e) => setCurrentTx({ ...currentTx, description: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">發票號碼 (選填)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                  value={currentTx.invoice_number || ''} 
                  onChange={(e) => setCurrentTx({ ...currentTx, invoice_number: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">單據上傳 (發票照片)</label>
                <div className="flex items-center gap-4">
                  {currentTx.document_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={currentTx.document_url} alt="單據預覽" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setCurrentTx({ ...currentTx, document_url: '' })}
                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-red-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">{uploading ? '上傳中...' : '點擊或拖曳上傳照片'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-white transition-all">取消</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all">儲存記錄</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
