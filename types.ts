
export enum ActivityType {
  GATHERING = '產業小聚',
  VISIT = '企業參訪',
  COURSE = '專業課程',
  DINNER = '交流餐敘',
  PROJECT = '專案活動'
}

export enum UserRole {
  STAFF = '工作人員',
  MANAGER = '管理員',
  SUPER_ADMIN = '總管理員'
}

// 修改：簡化出席狀態，僅保留出席與缺席(未出席)
export enum AttendanceStatus {
  PRESENT = 'present',       // 出席 (已簽到)
  ABSENT = 'absent',         // 缺席 (預設/取消簽到)
}

export interface Activity {
  id: string | number;
  type: ActivityType;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  // 移除 member_price
  picture: string;
  description: string;
  status?: 'active' | 'closed';
}

export interface Registration {
  id: string | number;
  activityId: string | number;
  name: string;
  phone: string;
  email: string;
  
  // 以下欄位若資料庫尚未建立，設為選填以避免前端錯誤
  company?: string;
  title?: string;
  referrer?: string;
  check_in_status?: boolean; // 後台管理用：報到狀態
  paid_amount?: number;      // 後台管理用：繳費金額
  coupon_code?: string;      // 新增：使用的折扣碼
  
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string; // 改為手機號碼
  role: UserRole;
  password?: string;
}

export interface Member {
  id: string | number;
  member_no: string | number; // 修改：允許 string 或 number
  industry_chain: '美食' | '工程' | '健康' | '幸福' | '工商'; // 產業鏈
  industry_category: string; // 行業別
  name: string; // 大名
  company: string; // 品牌/公司名稱
  website?: string; // 網站
  intro?: string; // 新增：會員簡介
  birthday?: string; // 新增：生日 (YYYY-MM-DD)
  
  // 新增：會籍管理
  status?: 'active' | 'inactive'; // active=活躍(顯示), inactive=停權/離會(隱藏)
  join_date?: string; // 入會日期
  quit_date?: string; // 離會日期
}

// 新增：出席紀錄介面
export interface AttendanceRecord {
  id?: string | number;
  activity_id: string;
  member_id: string;
  status: AttendanceStatus;
  updated_at?: string;
}

// 新增：折扣券介面
export interface Coupon {
  id: string | number;
  code: string;           // 流水號代碼
  activity_id: string;    // 綁定特定活動
  member_id?: string;     // 綁定特定會員 (可選)
  discount_amount: number;// 折扣金額
  is_used: boolean;       // 是否已使用
  created_at: string;
  used_at?: string;
}
