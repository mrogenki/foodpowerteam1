-- 建立 receipts 儲存桶 (如果不存在)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 允許所有人讀取 receipts 儲存桶的檔案
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- 允許已登入的使用者上傳檔案到 receipts 儲存桶
CREATE POLICY "Auth Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );

-- 允許已登入的使用者更新 receipts 儲存桶的檔案
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );

-- 允許已登入的使用者刪除 receipts 儲存桶的檔案
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );
