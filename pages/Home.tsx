
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, ChevronRight, Clock } from 'lucide-react';
import { Activity, ActivityType } from '../types';

interface HomeProps {
  activities: Activity[];
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  // 根據不同活動類型給予不同標籤顏色
  const getTypeColor = (type: ActivityType) => {
    switch(type) {
      case ActivityType.GATHERING: return 'bg-orange-600 text-white';
      case ActivityType.VISIT: return 'bg-blue-600 text-white';
      case ActivityType.COURSE: return 'bg-green-600 text-white';
      case ActivityType.DINNER: return 'bg-pink-600 text-white';
      case ActivityType.PROJECT: return 'bg-purple-600 text-white';
      default: return 'bg-gray-800 text-white';
    }
  };

  return (
    <Link to={`/activity/${activity.id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img src={activity.picture} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTypeColor(activity.type)}`}>
            {activity.type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4 line-clamp-1 group-hover:text-red-600 transition-colors">{activity.title}</h3>
        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-red-600" />
            <span>{activity.date}</span>
            <Clock size={16} className="text-red-600 ml-2" />
            <span>{activity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-600" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-red-600" />
            <span>NT$ {activity.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-red-600 font-bold text-sm">立即報名</span>
          <ChevronRight size={18} className="text-red-600" />
        </div>
      </div>
    </Link>
  );
};

const Home: React.FC<HomeProps> = ({ activities }) => {
  const now = new Date();

  const filterUpcoming = (a: Activity) => {
    // 結合日期與時間進行比較
    const activityFullDate = new Date(`${a.date.replace(/-/g, '/')} ${a.time}`);
    // 如果 status 不存在 (undefined)，默認為 active
    const isActive = a.status === 'active' || !a.status;
    return isActive && activityFullDate > now;
  };

  const upcomingActivities = activities.filter(filterUpcoming);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">連結產業，創造共好</h1>
          <p className="text-xl text-red-100 max-w-2xl">食在力量致力於食品產業的交流與成長，提供產業小聚、參訪與課程，讓您的事業在這裡蓬勃發展。</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="space-y-16">
          {/* Upcoming Activities List */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                近期活動
              </h2>
            </div>
            
            {upcomingActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl border border-dashed text-center">
                <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-400">目前暫無即將舉行的活動</h3>
                <p className="text-gray-300 mt-2">請稍後再回來查看，或聯繫食在力量秘書處。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
