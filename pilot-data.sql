-- Nova Command Center - Pilot Data Setup
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. Create ROI data table (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_roi_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL,
  day DATE NOT NULL,
  alert_count INTEGER DEFAULT 0,
  avoided_incidents INTEGER DEFAULT 0,
  downtime_avoided_min INTEGER DEFAULT 0,
  loss_prevented_est_sum NUMERIC DEFAULT 0,
  baseline_alerts INTEGER DEFAULT 0,
  baseline_avoided_incidents INTEGER DEFAULT 0,
  baseline_downtime_min INTEGER DEFAULT 0,
  baseline_loss NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, day)
);

-- Create or replace the view that the app uses
CREATE OR REPLACE VIEW vw_policy_roi_v1_with_baseline AS
SELECT * FROM policy_roi_daily;

-- ============================================================================
-- 2. Insert 30 days of pilot data
-- ============================================================================

INSERT INTO policy_roi_daily (
  policy_id,
  day,
  alert_count,
  avoided_incidents,
  downtime_avoided_min,
  loss_prevented_est_sum,
  baseline_alerts,
  baseline_avoided_incidents,
  baseline_downtime_min,
  baseline_loss
) VALUES
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 29, 45, 12, 240, 18500, 38, 10, 200, 15000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 28, 52, 15, 290, 22000, 42, 12, 240, 18000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 27, 48, 13, 265, 19500, 40, 11, 220, 16500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 26, 41, 11, 220, 16500, 36, 9, 180, 13500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 25, 55, 16, 310, 24000, 45, 13, 260, 19500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 24, 38, 10, 200, 15000, 33, 8, 160, 12000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 23, 44, 12, 235, 17500, 37, 10, 195, 14500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 22, 50, 14, 275, 21000, 41, 11, 230, 17000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 21, 47, 13, 255, 19000, 39, 10, 210, 15500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 20, 43, 12, 230, 17000, 36, 9, 190, 14000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 19, 51, 15, 285, 22500, 43, 12, 245, 18500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 18, 46, 13, 250, 18500, 38, 10, 205, 15000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 17, 39, 11, 215, 16000, 34, 9, 180, 13000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 16, 54, 16, 305, 23500, 44, 13, 255, 19000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 15, 49, 14, 270, 20500, 40, 11, 225, 16500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 14, 42, 12, 225, 17500, 35, 9, 185, 13500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 13, 45, 13, 245, 18500, 37, 10, 200, 15000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 12, 53, 15, 295, 22500, 43, 12, 250, 18500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 11, 48, 14, 260, 19500, 39, 11, 215, 16000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 10, 40, 11, 210, 16000, 34, 9, 175, 13000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 9, 56, 17, 315, 24500, 46, 14, 270, 20000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 8, 44, 12, 240, 18000, 37, 10, 200, 15000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 7, 47, 13, 255, 19500, 39, 11, 210, 16000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 6, 52, 15, 285, 22000, 42, 12, 240, 18000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 5, 49, 14, 270, 20500, 40, 11, 225, 16500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 4, 41, 11, 220, 16500, 35, 9, 185, 13500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 3, 55, 16, 300, 23500, 45, 13, 255, 19000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 2, 46, 13, 250, 19000, 38, 10, 210, 15500),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE - 1, 43, 12, 230, 17500, 36, 9, 190, 14000),
  ('9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb', CURRENT_DATE, 50, 14, 275, 21000, 41, 11, 230, 17000)
ON CONFLICT (policy_id, day) DO UPDATE SET
  alert_count = EXCLUDED.alert_count,
  avoided_incidents = EXCLUDED.avoided_incidents,
  downtime_avoided_min = EXCLUDED.downtime_avoided_min,
  loss_prevented_est_sum = EXCLUDED.loss_prevented_est_sum;

-- ============================================================================
-- 3. Verify the data
-- ============================================================================

SELECT COUNT(*) as row_count FROM vw_policy_roi_v1_with_baseline;

-- You should see 30 rows inserted
-- The ROI page will now show beautiful charts and data!
