
# 食在力量 - 活動報名與會員系統

這是一個基於 React + Supabase 的活動報名與會員管理系統。

## 🚀 快速開始 (Setup Guide)

### 1. 建立 Supabase 專案
1. 前往 [Supabase](https://supabase.com/) 建立一個新專案。
2. 進入專案的 **SQL Editor**。
3. 複製專案中的 `supabase_schema.sql` 內容並執行，以建立所有資料表。
4. 前往 **Storage**，建立一個新的 Public Bucket 命名為 `activity-images`。

### 2. 設定環境變數
在專案根目錄建立 `.env` 檔案，或在 Vercel 的 Environment Variables 中設定：

```env
VITE_SUPABASE_URL=你的_Supabase_URL
VITE_SUPABASE_ANON_KEY=你的_Supabase_Anon_Key
```

您可以從 Supabase Dashboard > Project Settings > API 找到這些資訊。

### 3. 本地開發
```bash
npm install
npm run dev
```

### 4. 部署至 Vercel
1. 安裝 Vercel CLI 或直接將代碼推送到 GitHub。
2. 在 Vercel Dashboard 匯入專案。
3. 在 Vercel 的 Project Settings > Environment Variables 填入上述的 Supabase URL 與 Key。
4. 部署完成！

## ✨ 功能特色
- **活動管理**：建立、編輯、刪除活動 (產業小聚、企業參訪等)。
- **報名系統**：前台報名表單、後台名單管理、匯出 CSV。
- **會員管理**：會員資料庫、產業分類、CSV 批次匯入。
- **報到系統**：
  - 訪客/非會員：一般報到與繳費註記。
  - 會員：活動出席點名系統。
- **權限管理**：分級管理員 (總管/管理員/工作人員)。

## 📁 專案結構
- `/src/pages`: 頁面元件
- `/src/types.ts`: TypeScript 型別定義
- `/src/constants.tsx`: 預設資料 (Seed Data)
- `supabase_schema.sql`: 資料庫結構

