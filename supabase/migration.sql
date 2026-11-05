-- KALKI SIDDHI: Supabase Database Migration
-- Execute this in your Supabase SQL Editor

-- Main leads table
CREATE TABLE IF NOT EXISTS public.avatar_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  lead_name TEXT,
  business_name TEXT,
  business_type TEXT,
  phone VARCHAR(15) NOT NULL,
  service_interest TEXT,
  conversation_transcript JSONB DEFAULT '[]'::JSONB,
  ip_location TEXT,
  status VARCHAR(20) DEFAULT 'new' NOT NULL,
  quote_sent BOOLEAN DEFAULT false,
  follow_up_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_avatar_leads_phone ON public.avatar_leads(phone);
CREATE INDEX IF NOT EXISTS idx_avatar_leads_created_at ON public.avatar_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avatar_leads_status ON public.avatar_leads(status);
CREATE INDEX IF NOT EXISTS idx_avatar_leads_business_type ON public.avatar_leads(business_type);

-- Enable Row Level Security
ALTER TABLE public.avatar_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from edge functions (anonymous inserts)
CREATE POLICY "Enable insert for edge functions"
ON public.avatar_leads FOR INSERT
WITH CHECK (true);

-- Policy: Allow read for service role only (no public read)
CREATE POLICY "Service role can read all leads"
ON public.avatar_leads FOR SELECT
USING (false);

-- Policy: Service role can update
CREATE POLICY "Service role can update leads"
ON public.avatar_leads FOR UPDATE
USING (false);

-- ============================================
-- OPTIONAL: Auto-notification trigger
-- Uncomment and configure your webhook URL
-- ============================================

-- CREATE OR REPLACE FUNCTION public.notify_new_lead()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url := 'https://YOUR_WEBHOOK_URL/new-lead',
--     headers := '{"Content-Type": "application/json"}'::jsonb,
--     body := jsonb_build_object(
--       'lead_id', NEW.id,
--       'name', NEW.lead_name,
--       'business', NEW.business_name,
--       'phone', NEW.phone,
--       'industry', NEW.business_type,
--       'created_at', NEW.created_at
--     )
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_new_lead
-- AFTER INSERT ON public.avatar_leads
-- FOR EACH ROW
-- EXECUTE FUNCTION public.notify_new_lead();
