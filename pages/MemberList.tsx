
import React, { useState } from 'react';
import { Globe, Building2, User, Tag, Briefcase } from 'lucide-react';
import { Member, IndustryCategories } from '../types';

interface MemberListProps {
  members: Member[];
}

const MemberList: React.FC<MemberListProps> = ({ members }) => {
  const [filter, setFilter] = useState<string>('all');

  // 自動判斷會籍是否有效 (前端顯示邏輯)
  const isMemberActive = (m: Member) => {
    // 1. 檢查 status 欄位
    if (m.status === 'inactive') return false;
    // 2. 檢查到期日
    if (m.membership_expiry_date) {
      const today = new Date().toISOString().slice(0, 10);
      if (m.membership_expiry_date < today) return false;
    }
    return true;
  };

  const activeMembers = members.filter(isMemberActive);

  // 排序邏輯：Member No 小到大 (支援數字與文字混合，例如 M1, M2, M10 排序)
  const sortedMembers = [...activeMembers].sort((a, b) => {
    const valA = String(a.member_no || '');
    const valB = String(b.member_no || '');
    if (!valA && !valB) return 0;
    if (!valA) return 1;
    if (!valB) return -1;
    return valA.localeCompare(valB, undefined, { numeric: true });
  });

  const filteredMembers = filter === 'all' 
    ? sortedMembers 
    : sortedMembers.filter(m => m.industry_category === filter);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b py-16 px-4 mb-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">分會成員介紹</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">匯聚各產業菁英，打造最強商務連結。點擊下方分類快速尋找合作夥伴。</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button 
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full font-bold transition-all ${filter === 'all' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              全部
            </button>
            {IndustryCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full font-bold transition-all ${filter === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                {/* 裝飾背景 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[60px] -z-0"></div>
                
                <div className="mb-4 relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                      {member.industry_category}
                    </span>
                    <span className="font-mono text-xs text-gray-300 font-bold">#{member.member_no}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                    {member.brand_name || member.company || '未填寫品牌'}
                  </h3>
                  {member.company_title && member.company_title !== member.brand_name && (
                    <p className="text-xs text-gray-400">{member.company_title}</p>
                  )}
                </div>
                
                <div className="flex-grow space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-gray-700 font-medium border-b border-gray-50 pb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                       <User size={16} />
                    </div>
                    <div>
                       <div className="text-sm">{member.name}</div>
                       <div className="text-xs text-gray-400">{member.job_title || '會員'}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex gap-2 mb-1">
                       <Briefcase size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                       <span className="text-gray-800 font-bold">主要服務</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed pl-6">
                      {member.main_service || member.intro || '暫無介紹'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 relative z-10">
                  {member.website ? (
                    <a 
                      href={member.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Globe size={16} />
                      參觀網站
                    </a>
                  ) : (
                    <button disabled className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 text-gray-300 text-sm font-bold cursor-not-allowed">
                      <Globe size={16} />
                      暫無網站
                    </button>
                  )}
                </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <User size={32} />
            </div>
            <p className="text-gray-400 font-bold">此分類目前尚無成員資料</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;
