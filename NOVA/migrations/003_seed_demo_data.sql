-- Nova 2.0 Demo Seed Data
-- Run this after 002_experiments.sql to populate test data

-- Demo tenant & user UUIDs
DO $$
DECLARE
  demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  demo_user_id UUID := '00000000-0000-0000-0000-000000000002';
  policy1_id UUID := gen_random_uuid();
  policy2_id UUID := gen_random_uuid();
  policy3_id UUID := gen_random_uuid();
  unit1_id UUID := gen_random_uuid();
  unit2_id UUID := gen_random_uuid();
  unit3_id UUID := gen_random_uuid();
  base_rate_plan_id UUID;
BEGIN

  -- 1. Create default rate plan
  INSERT INTO rate_plans (tenant_id, id, name, params, status, created_by)
  VALUES (
    demo_tenant_id,
    gen_random_uuid(),
    'Base Rate Plan 2025',
    '{"base_rate": 0.045, "caps": {"max_change_pct": 0.25, "min_change_pct": -0.15}}'::jsonb,
    'active',
    demo_user_id
  )
  RETURNING id INTO base_rate_plan_id;

  -- 2. Insert sample exposures (90 days of data)
  FOR i IN 0..89 LOOP
    INSERT INTO exposures_daily (tenant_id, dt, policy_id, unit_id, product, risk_vars, written_premium, earned_premium, exposure)
    VALUES
      (demo_tenant_id, CURRENT_DATE - i, policy1_id, unit1_id, 'AUTO', 
       '{"fleet_size": 3, "risk_score": 0.65, "state": "CA"}'::jsonb, 450, 37.5, 1),
      (demo_tenant_id, CURRENT_DATE - i, policy2_id, unit2_id, 'ROBOT', 
       '{"fleet_size": 10, "risk_score": 0.82, "state": "TX"}'::jsonb, 980, 81.67, 1),
      (demo_tenant_id, CURRENT_DATE - i, policy3_id, unit3_id, 'AUTO', 
       '{"fleet_size": 1, "risk_score": 0.42, "state": "NY"}'::jsonb, 320, 26.67, 1)
    ON CONFLICT (tenant_id, dt, unit_id) DO NOTHING;
  END LOOP;

  -- 3. Insert sample losses (20% of days have claims)
  FOR i IN 0..17 LOOP
    INSERT INTO losses (tenant_id, policy_id, unit_id, dt, incurred, paid, cause, status)
    VALUES
      (demo_tenant_id, policy1_id, unit1_id, CURRENT_DATE - (i * 5), 120 + (i * 10), 50, 'Collision', 'Open'),
      (demo_tenant_id, policy2_id, unit2_id, CURRENT_DATE - (i * 5 + 1), 350 + (i * 20), 180, 'Malfunction', 'Closed');
  END LOOP;

  -- 4. Insert sample guardrail hits (simulate violations)
  FOR i IN 0..29 LOOP
    IF i % 3 = 0 THEN
      INSERT INTO guardrail_hits (tenant_id, unit_id, dt, severity, rule_name, metadata)
      VALUES
        (demo_tenant_id, unit2_id, CURRENT_TIMESTAMP - (i || ' days')::interval, 0.8, 'Speed Limit Exceeded', '{"speed": 75, "limit": 55}'::jsonb);
    END IF;
  END LOOP;

  RAISE NOTICE 'Demo data seeded successfully!';
  RAISE NOTICE 'Base rate plan ID: %', base_rate_plan_id;
  RAISE NOTICE 'Demo tenant ID: %', demo_tenant_id;

END $$;

-- Verify data
SELECT 
  'Exposures' as table_name, 
  count(*) as row_count 
FROM exposures_daily 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'Losses', 
  count(*) 
FROM losses 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'Guardrail Hits', 
  count(*) 
FROM guardrail_hits 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'Rate Plans', 
  count(*) 
FROM rate_plans 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';


