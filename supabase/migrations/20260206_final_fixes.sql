-- 🏁 SILENT MONEY FINAL SYSTEM POLISH
-- 1. Notification Engine
-- 2. Role-Based Triggers
-- 3. Storage Maintenance Utility

-- ============================================
-- 1. NOTIFICATION ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT DEFAULT 'info', -- 'approval', 'role_change', 'audit', 'info'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- ============================================
-- 2. AUTOMATED NOTIFICATION TRIGGERS
-- ============================================

-- A. Notify on Blueprint Approval
CREATE OR REPLACE FUNCTION notify_idea_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    INSERT INTO public.notifications (user_id, title, message, link, type)
    VALUES (
      NEW.author_id,
      '🚀 Blueprint Approved!',
      'Your blueprint "' || NEW.title || '" has been verified and is now live in the discovery feed.',
      '/ideas/' || NEW.slug,
      'approval'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_idea_approval
AFTER UPDATE ON public.income_ideas
FOR EACH ROW EXECUTE FUNCTION notify_idea_approval();

-- B. Notify on Franchise Approval
CREATE OR REPLACE FUNCTION notify_franchise_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    INSERT INTO public.notifications (user_id, title, message, link, type)
    VALUES (
      NEW.author_id,
      '🏢 Brand Verified!',
      'Your franchise opportunity "' || NEW.name || '" has been approved for the expansion feed.',
      '/franchise/' || NEW.slug,
      'approval'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_franchise_approval
AFTER UPDATE ON public.franchises
FOR EACH ROW EXECUTE FUNCTION notify_franchise_approval();

-- C. Notify on Role Change (Promotion/Demotion)
CREATE OR REPLACE FUNCTION notify_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '🛡️ Rank Updated: ' || initcap(NEW.role),
      'Your institutional rank has been updated to "' || initcap(NEW.role) || '". You may have new permissions.',
      'role_change'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_role_change
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION notify_role_change();

-- ============================================
-- 3. STORAGE MAINTENANCE UTILITY (WIP)
-- ============================================

-- Function to mark items as processed in the deletion queue
CREATE OR REPLACE FUNCTION mark_deleted_files(processed_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE public.storage_deletion_queue
  SET deleted_at = NOW()
  WHERE id = ANY(processed_ids);
END;
$$ LANGUAGE plpgsql;
