import React, { useState, useMemo } from 'react';
import { FinanceRecord } from '../types';
import { Plus, Search, Trash2, Download, FileText, TrendingUp, TrendingDown, DollarSign, Calendar, User, Tag, Upload, X, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FinanceManagerProps {
  records: FinanceRecord[];
  onAdd: (record: FinanceRecord) => void;
  onDelete: (id: string | number) => void;
  onUploadImage: (file: File) => Promise<string>;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ records, onAdd, onDelete, onUploadImage }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [formData, setFormData] = useState<Partial<FinanceRecord>>({
    date: new Date().toISOString().slice(0, 10),
    type: 'income',
    category: '',
    amount: 0,
    target: '',
    invoice_no: '',
    document_url: '',
    handler_name: '',
    note: ''
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.invoice_no && r.invoice_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.handler_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || r.type === filterType;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [records, searchTerm, filterType]);

  const stats = useMemo(() => {
    const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expense, balance: income - expense };
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.target || !formData.handler_name) {
      alert('請填寫必填欄位');
      return;
    }

    const newRecord: FinanceRecord = {
      id: Date.now().toString(),
      date: formData.date!,
      type: formData.type as 'income' | 'expense',
      category: formData.category!,
      amount: Number(formData.amount),
      target: formData.target!,
      invoice_no: formData.invoice_no,
      document_url: formData.document_url,
      handler_name: formData.handler_name!,
      note: formData.note,
      created_at: new Date().toISOString()
    };

    onAdd(newRecord);
    setShowAddModal(false);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      type: 'income',
      category: '',
      amount: 0,
      target: '',
      invoice_no: '',
      document_url: '',
      handler_name: '',
      note: ''
    });
  };

  const exportToExcel = () => {
    const data = filteredRecords.map(r => ({
      '日期': r.date,
      '類型': r.type === 'income' ? '收入' : '支出',
      '類別': r.category,
      '金額': r.amount,
      '收支對象': r.target,
      '發票號碼': r.invoice_no || '',
      '經手人': r.handler_name,
      '備註': r.note || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '收支紀錄');
    XLSX.writeFile(wb, `財務收支紀錄_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-red-600" />
            收支管理
          </h2>
          <p className="text-gray-500 mt-1">管理俱樂部的日常營運收支與單據</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            匯出報表
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Plus size={18} />
            新增收支
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">總收入</p>
              <p className="text-2xl font-bold text-green-600">NT$ {stats.income.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">總支出</p>
              <p className="text-2xl font-bold text-red-600">NT$ {stats.expense.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">結餘</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                NT$ {stats.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 列表與搜尋 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="搜尋對象、類別、發票號碼、經手人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? '全部' : type === 'income' ? '收入' : '支出'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold">日期</th>
                <th className="p-4 font-bold">類型</th>
                <th className="p-4 font-bold">收支對象</th>
                <th className="p-4 font-bold">類別</th>
                <th className="p-4 font-bold">金額</th>
                <th className="p-4 font-bold">發票號碼</th>
                <th className="p-4 font-bold">單據</th>
                <th className="p-4 font-bold">經手人</th>
                <th className="p-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-mono">{record.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.type === 'income' ? '收入' : '支出'}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{record.target}</td>
                    <td className="p-4 text-gray-600">{record.category}</td>
                    <td className={`p-4 font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'income' ? '+' : '-'} NT$ {record.amount.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-gray-500">{record.invoice_no || '-'}</td>
                    <td className="p-4">
                      {record.document_url ? (
                        <a 
                          href={record.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} />
                          查看
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-gray-600">{record.handler_name}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => { if(confirm('確定刪除此筆紀錄？')) onDelete(record.id) }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                    暫無收支紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-red-600" />
                新增收支紀錄
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">日期 *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">類型 *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'income'})}
                      className={`flex-grow py-2 rounded-lg font-bold transition-all ${
                        formData.type === 'income' 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      收入
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'expense'})}
                      className={`flex-grow py-2 rounded-lg font-bold transition-all ${
                        formData.type === 'expense' 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      支出
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">收支對象 *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="例如：廠商名稱、會員姓名"
                      value={formData.target}
                      onChange={e => setFormData({...formData, target: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">類別 *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="例如：餐飲費、場地費、會費收入"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">金額 *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      required
                      placeholder="0"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">發票號碼 (選填)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="例如：AB12345678"
                      value={formData.invoice_no}
                      onChange={e => setFormData({...formData, invoice_no: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">經手人 *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="填寫經手人員姓名"
                      value={formData.handler_name}
                      onChange={e => setFormData({...formData, handler_name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">單據上傳</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="單據圖片連結"
                        value={formData.document_url}
                        onChange={e => setFormData({...formData, document_url: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <label className={`cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        disabled={isUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            try {
                              const url = await onUploadImage(file);
                              setFormData({...formData, document_url: url});
                            } catch (err) {
                              alert('上傳失敗');
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      />
                      {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">備註 (選填)</label>
                <textarea 
                  placeholder="其他補充說明..."
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-grow py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-grow py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                >
                  儲存紀錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
