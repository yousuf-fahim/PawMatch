-- RLS Policies for extended schema tables
-- Run after 04_extended_schema.sql

-- Enable RLS on new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (public.is_admin());

-- Adoption applications policies
CREATE POLICY "Users can view their own applications" ON adoption_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON adoption_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications" ON adoption_applications
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    status = 'pending'
  );

CREATE POLICY "Admins can manage all applications" ON adoption_applications
  FOR ALL USING (public.is_admin());

-- User messages policies
CREATE POLICY "Users can view messages in their applications" ON user_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM adoption_applications 
      WHERE id = application_id AND 
      (user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can send messages in their applications" ON user_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM adoption_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can send messages in any application" ON user_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND public.is_admin()
  );

CREATE POLICY "Users can update read status of messages sent to them" ON user_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Grant necessary permissions
GRANT SELECT ON admin_stats TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON adoption_applications TO authenticated; 
GRANT ALL ON user_messages TO authenticated;
