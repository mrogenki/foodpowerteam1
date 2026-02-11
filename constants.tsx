
import { Activity, ActivityType, AdminUser, UserRole, Member } from './types';

// ==========================================
// EmailJS 設定 (已更新為正式金鑰)
// ==========================================
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_z0iyas9',
  TEMPLATE_ID: 'template_ih0plai',
  PUBLIC_KEY: 'ajJknYqtnk3p1_WmI'
};

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: ActivityType.GATHERING,
    title: '食在力量 - 十月產業小聚',
    date: '2025-10-18',
    time: '14:00',
    location: '台北市大安區忠孝東路四段 (食在力量總部)',
    price: 500,
    picture: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop',
    description: '匯聚食品產業上下游夥伴，透過輕鬆的下午茶形式，交流近期市場動態與合作機會。',
    status: 'active'
  },
  {
    id: '2',
    type: ActivityType.DINNER,
    title: '年終感恩交流餐敘',
    date: '2025-12-20',
    time: '18:00',
    location: '台北市信義區知名飯店',
    price: 1200,
    picture: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
    description: '感謝一年來的支持與陪伴，食在力量邀請您共度溫馨晚宴，展望來年新計畫。',
    status: 'active'
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'super-admin-01',
    name: '總管理員',
    phone: '0925981577',
    password: '981577',
    role: UserRole.SUPER_ADMIN
  }
];

// 為了相容新舊資料結構，將舊資料對應到新欄位
// 預設將既有資料 map 到 '其他' 或接近的分類
export const INITIAL_MEMBERS: Member[] = [
  { 
    id: 'm314', 
    member_no: '314', 
    industry_category: '營運協作', 
    name: '徐聖恩', 
    brand_name: '歐友科技', 
    company_title: '歐友科技有限公司',
    main_service: '電腦機房系統整合、不斷電系統',
    status: 'active',
    membership_expiry_date: '2025-12-31'
  },
  { 
    id: 'm276', 
    member_no: '276', 
    industry_category: '其他', 
    name: '林恆暉', 
    brand_name: '永吉殯儀', 
    main_service: '殯葬禮儀服務', 
    status: 'active',
    membership_expiry_date: '2025-12-31'
  },
  { 
    id: 'm79', 
    member_no: '79', 
    industry_category: '通路行銷', 
    name: '郭信德', 
    brand_name: '威格品牌設計', 
    main_service: '品牌形象設計、包裝設計', 
    status: 'active',
    membership_expiry_date: '2025-12-31'
  },
  { 
    id: 'm412', 
    member_no: '412', 
    industry_category: '美食產品', 
    name: '張哲維', 
    brand_name: '嚴選阿里山銀耳', 
    main_service: '原生種銀耳飲品', 
    status: 'active',
    membership_expiry_date: '2025-12-31'
  },
  { 
    id: 'm102', 
    member_no: '102', 
    industry_category: '餐飲服務', 
    name: '張文昱', 
    brand_name: '水蛙師', 
    main_service: '中式辦桌、精緻外燴', 
    status: 'active',
    membership_expiry_date: '2025-12-31'
  },
  {
    id: 'm199',
    member_no: '199',
    industry_category: '美食產品',
    name: '張智鴻',
    brand_name: '蔥阿伯',
    main_service: '蔥抓餅、餡餅冷凍食品',
    status: 'active',
    membership_expiry_date: '2025-12-31'
  }
];
