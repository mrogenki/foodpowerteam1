-- 允許所有使用者刪除續約紀錄 (為了後台管理)
CREATE POLICY "Enable delete for all users" ON member_renewals FOR DELETE USING (true);
