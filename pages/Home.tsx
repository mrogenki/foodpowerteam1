
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, UserPlus, Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Activity, MemberActivity, ClubActivity } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  activities: Activity[];
  memberActivities: MemberActivity[];
}

const Home: React.FC<HomeProps> = ({ activities, memberActivities }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const now = new Date();

  const optimizeImageUrl = (url: string, width = 1200) => {
    if (!url) return '';
    if (url.includes('unsplash.com')) {
      // Remove existing width/quality params if any
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=${width}&q=80&auto=format&fit=crop`;
    }
    return url;
  };

  // 篩選出即將到來的活動，並排序取前 5 筆
  const isUpcoming = (a: Activity | MemberActivity) => {
    const activityFullDate = new Date(`${a.date.replace(/-/g, '/')} ${a.time}`);
    return activityFullDate > now;
  };

  const allUpcomingActivities = React.useMemo(() => [
    ...activities.map(a => ({ ...a, isMemberActivity: false })),
    ...memberActivities.map(a => ({ ...a, isMemberActivity: true }))
  ].filter(isUpcoming).sort((a, b) => {
    const dateA = new Date(`${a.date.replace(/-/g, '/')} ${a.time}`).getTime();
    const dateB = new Date(`${b.date.replace(/-/g, '/')} ${b.time}`).getTime();
    return dateA - dateB; // 越近的排越前面
  }).slice(0, 5), [activities, memberActivities, now]);

  // 輪播自動播放邏輯
  useEffect(() => {
    if (allUpcomingActivities.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % allUpcomingActivities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [allUpcomingActivities.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % allUpcomingActivities.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + allUpcomingActivities.length) % allUpcomingActivities.length);

  const getTypeColor = (type: string) => {
    switch(type) {
      case '講座論壇': return 'bg-orange-600';
      case '企業參訪': return 'bg-blue-600';
      case '專業課程': return 'bg-green-600';
      case '交流餐敘': return 'bg-pink-600';
      case '專案活動': return 'bg-purple-600';
      default: return 'bg-gray-800';
    }
  };

  useEffect(() => {
    document.title = `食在力量 - 連結產業，創造共好`;
    
    const updateMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (el) el.setAttribute('content', content);
    };
    
    updateMeta('og:title', '食在力量');
    updateMeta('og:description', '食在力量 - 連結產業，創造共好。匯聚各產業菁英，提供講座論壇、企業參訪、專業課程等活動報名與會員管理服務。');
    updateMeta('og:image', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop');
    updateMeta('og:url', 'https://www.foodpowerteam.com/');
  }, []);

  // JSON-LD for Organization
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "食在力量",
    "url": "https://www.foodpowerteam.com/",
    "logo": "https://www.foodpowerteam.com/logo.svg",
    "description": "連結產業，創造共好。匯聚各產業菁英，提供講座論壇、企業參訪、專業課程等活動報名與會員管理服務。"
  };

  return (
    <div className="pb-20">
      <script type="application/ld+json">
        {JSON.stringify(orgJsonLd)}
      </script>
      {/* Hero Section / Carousel */}
      {allUpcomingActivities.length > 0 ? (
        <div className="relative w-full aspect-video overflow-hidden bg-gray-900">
          {allUpcomingActivities.map((activity, index) => (
            <div 
              key={`${activity.isMemberActivity ? 'm' : 'g'}-${activity.id}`} 
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-black/50 z-10"></div>
              <img 
                src={optimizeImageUrl(activity.picture)} 
                alt={activity.title} 
                className="w-full h-full object-cover" 
                loading={index === 0 ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
                width="1920"
                height="1080"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                <div className="flex items-center gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
                  <span className={`${getTypeColor(activity.type)} text-white px-3 py-1 md:px-5 md:py-1.5 lg:px-6 lg:py-2 rounded-full text-sm md:text-lg lg:text-xl font-bold flex items-center gap-1`}>
                    {activity.type}
                  </span>
                  {activity.isMemberActivity && (
                    <span className="bg-red-600 text-white px-3 py-1 md:px-5 md:py-1.5 lg:px-6 lg:py-2 rounded-full text-sm md:text-lg lg:text-xl font-bold flex items-center gap-1 md:gap-2">
                      <Crown className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
                      會員專屬
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 drop-shadow-lg max-w-5xl leading-tight">{activity.title}</h2>
                <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-sm md:text-xl lg:text-2xl text-gray-200 mb-8 md:mb-10 drop-shadow-md">
                  <span className="flex items-center gap-1.5 md:gap-2"><Calendar className="w-4 h-4 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" /> {activity.date}</span>
                  <span className="flex items-center gap-1.5 md:gap-2"><MapPin className="w-4 h-4 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" /> {activity.location}</span>
                </div>
                <Link 
                  to={activity.isMemberActivity ? `/member-activity/${activity.id}` : `/activity/${activity.id}`} 
                  className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-full font-bold text-base md:text-xl lg:text-2xl transition-colors shadow-lg"
                >
                  查看活動詳情
                </Link>
              </div>
            </div>
          ))}
          
          {allUpcomingActivities.length > 1 && (
            <>
              <button 
                onClick={prevSlide} 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all"
                aria-label="上一個活動"
              >
                <ChevronLeft size={32} aria-hidden="true" />
              </button>
              <button 
                onClick={nextSlide} 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all"
                aria-label="下一個活動"
              >
                <ChevronRight size={32} aria-hidden="true" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {allUpcomingActivities.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                    aria-label={`切換至第 ${index + 1} 個活動`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <section className="bg-red-600 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">連結產業，創造共好</h1>
            <p className="text-xl text-red-100 max-w-3xl leading-relaxed">食在力量致力於餐飲業&食品產業的交流與成長，提供講座論壇、企業參訪與專業課程，讓您的事業在這裡蓬勃發展。</p>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="space-y-8">
          
          {/* 協會活動 CTA */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">探索協會活動</h2>
              <p className="text-gray-600 mb-0">我們定期舉辦講座論壇、企業參訪與專業課程，歡迎報名參加，與我們一起成長。</p>
            </div>
            <div className="relative z-10">
              <Link to="/activities" className="bg-red-50 text-red-600 hover:bg-red-100 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <Calendar size={20} aria-hidden="true" />
                查看所有活動
              </Link>
            </div>
            {/* 裝飾背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] opacity-50 -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
          </div>

          {/* 加入會員 CTA */}
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">還沒加入食在力量會員嗎？</h2>
              <p className="text-gray-400 mb-0">立即註冊成為會員，享有專屬活動優惠、產業媒合機會，並與頂尖業者交流共學。</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Link to="/join" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <UserPlus size={20} aria-hidden="true" />
                立即加入會員
              </Link>
              <Link to="/renew" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 hover:border-gray-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <Crown size={20} aria-hidden="true" />
                會員續約
              </Link>
            </div>
            {/* 裝飾背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-10 translate-y-1/2 -translate-x-1/2" aria-hidden="true"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
