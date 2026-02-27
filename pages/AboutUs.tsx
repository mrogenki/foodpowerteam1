import React from 'react';
import { motion } from 'motion/react';
import { History, Users, Briefcase, ChevronRight, Award, Globe, Heart, Target } from 'lucide-react';

const AboutUs: React.FC = () => {
  const sections = [
    {
      id: 'history',
      title: '發展歷程',
      icon: <History className="text-red-600" />,
      content: '食在力量致力於推動食品產業的創新與交流，從創立至今，我們不斷擴展服務範圍，連結品牌與通路，創造共贏價值。',
    },
    {
      id: 'board',
      title: '理監事會',
      icon: <Award className="text-red-600" />,
      subsections: [
        { name: '理事長、秘書長', description: '領導協會發展方向，統籌各項事務。' },
        { name: '理事、監事', description: '監督協會運作，提供專業建議。' },
        { name: '顧問團', description: '邀請產業資深前輩，提供策略指導。' },
      ],
    },
    {
      id: 'team',
      title: '營運團隊',
      icon: <Briefcase className="text-red-600" />,
      groups: [
        { name: '活動組', description: '策劃各類產業小聚、參訪與課程。' },
        { name: '資訊組', description: '維護系統運作，推動數位轉型。' },
        { name: '行政組', description: '處理協會日常庶務與會員服務。' },
        { 
          name: '通路組', 
          items: ['企業福委', '國際市場'],
          description: '對接企業採購與拓展海外市場。'
        },
        { 
          name: '品牌組', 
          items: ['餐飲人俱樂部', '食品人俱樂部'],
          description: '深度經營品牌社群，促進同業交流。'
        },
        { name: '會員委員會', description: '招募新會員，維護會員權益。' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-red-600 py-20 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            關於我們
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-red-100 max-w-2xl"
          >
            連結食品產業力量，打造共創、共享、共贏的專業社群。
          </motion.p>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 發展歷程 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 lg:col-span-3"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-xl">
                <History className="text-red-600" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">發展歷程</h2>
            </div>
            <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
              <p className="text-lg">
                「食在力量」起源於對台灣餐飲/食品產業的熱愛與使命感。我們發現許多優秀的餐飲/食品品牌在成長過程中，常面臨通路對接困難、資訊不對稱等挑戰。
              </p>
              <p className="text-lg mt-4">
                因此，我們建立了一個專業的交流平台，透過「產業小聚」、「企業參訪」與「專業課程」，讓業者能互相學習、資源共享。從最初的小型聚會，發展至今已成為連結數百家品牌的指標性協會。
              </p>
            </div>
          </motion.div>

          {/* 理監事 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-50 rounded-xl">
                <Award className="text-red-600" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">理監事會</h2>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-bold text-gray-900">理事長、秘書長</h3>
                <p className="text-sm text-gray-500 mt-1">核心領導團隊，統籌協會發展策略與資源對接。</p>
              </div>
              <div className="border-l-4 border-gray-200 pl-4">
                <h3 className="font-bold text-gray-900">理事、監事</h3>
                <p className="text-sm text-gray-500 mt-1">由產業精英組成，監督協會運作並提供專業諮詢。</p>
              </div>
              <div className="border-l-4 border-gray-200 pl-4">
                <h3 className="font-bold text-gray-900">顧問團</h3>
                <p className="text-sm text-gray-500 mt-1">邀請資深前輩與專家，為協會提供長期的智慧指導。</p>
              </div>
            </div>
          </motion.div>

          {/* 營運團隊 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-50 rounded-xl">
                <Users className="text-red-600" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">營運團隊</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <Target size={18} className="text-red-600" /> 活動組
                </h3>
                <p className="text-sm text-gray-500">策劃產業小聚、企業參訪、交流餐敘與專業課程。</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-red-600" /> 資訊組
                </h3>
                <p className="text-sm text-gray-500">負責系統開發、數位工具導入與線上平台維運。</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <Briefcase size={18} className="text-red-600" /> 行政組
                </h3>
                <p className="text-sm text-gray-500">處理協會日常行政、財務管理與會員入會服務。</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <Users size={18} className="text-red-600" /> 會員委員會
                </h3>
                <p className="text-sm text-gray-500">經營會員關係，招募新血並維護現有會員權益。</p>
              </div>
              
              {/* 通路組 */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 md:col-span-1">
                <h3 className="font-bold text-red-900 flex items-center gap-2 mb-3">
                  <Globe size={18} className="text-red-600" /> 通路組
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-red-700 border border-red-100 shadow-sm">企業福委</span>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-red-700 border border-red-100 shadow-sm">國際市場</span>
                </div>
                <p className="text-xs text-red-600/70 mt-3">專注於企業採購對接與全球市場拓展。</p>
              </div>

              {/* 品牌組 */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 md:col-span-1">
                <h3 className="font-bold text-red-900 flex items-center gap-2 mb-3">
                  <Heart size={18} className="text-red-600" /> 品牌組
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-red-700 border border-red-100 shadow-sm">餐飲人俱樂部</span>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-red-700 border border-red-100 shadow-sm">食品人俱樂部</span>
                </div>
                <p className="text-xs text-red-600/70 mt-3">深度經營垂直領域社群，促進品牌間的強強聯手。</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
