BEGIN;

-- Clean up existing notification policies to allow a clean slate
DROP POLICY IF EXISTS "User Own Notifications" ON public.notifications;
DROP POLICY IF EXISTS "View Own Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Create Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Update Own Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Delete Own Notifications" ON public.notifications;

-- 1. VIEW: Users can only see their own notifications
CREATE POLICY "View Own Notifications" ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. INSERT: Any authenticated user can create a notification (e.g. assigning a lead)
-- We don't restrict the 'user_id' here because we want User A to be able to create a notif for User B.
CREATE POLICY "Create Notifications" ON public.notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. UPDATE: Users can only update their own notifications (e.g. marking as read)
CREATE POLICY "Update Own Notifications" ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. DELETE: Users can only delete their own notifications (optional, but good practice)
CREATE POLICY "Delete Own Notifications" ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

COMMIT;
