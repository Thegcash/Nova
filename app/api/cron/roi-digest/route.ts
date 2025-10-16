import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const POLICY_ID = '9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb';
const POLICY_NAME = 'Speed Limit Violations';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

/**
 * POST /api/cron/roi-digest
 * Sends a daily ROI digest to Slack
 */
export async function POST() {
  try {
    // Check for Slack webhook URL
    const webhookUrl = process.env.SLACK_WEBHOOK_ROI;
    
    if (!webhookUrl) {
      return NextResponse.json(
        { 
          error: 'SLACK_WEBHOOK_ROI environment variable is not configured',
          hint: 'Set SLACK_WEBHOOK_ROI to your Slack Incoming Webhook URL'
        },
        { status: 500 }
      );
    }

    // Fetch 7-day summary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

    const { data: summaryData, error: summaryError } = await supabase
      .from('vw_policy_roi_daily')
      .select('alert_count, loss_prevented_est_sum')
      .eq('policy_id', POLICY_ID)
      .gte('day', fromDate);

    if (summaryError) {
      throw new Error(`Failed to fetch summary: ${summaryError.message}`);
    }

    // Calculate 7-day totals
    const alerts7d = (summaryData || []).reduce((sum, row) => sum + Number(row.alert_count || 0), 0);
    const lossPrevent7d = (summaryData || []).reduce((sum, row) => sum + Number(row.loss_prevented_est_sum || 0), 0);

    // Fetch 30-day trends to find max day
    const { data: trendsData, error: trendsError } = await supabase
      .from('vw_policy_trends_30d')
      .select('day, loss_prevented_est_sum')
      .eq('policy_id', POLICY_ID)
      .order('loss_prevented_est_sum', { ascending: false })
      .limit(1);

    if (trendsError) {
      throw new Error(`Failed to fetch trends: ${trendsError.message}`);
    }

    const maxDay = trendsData?.[0];
    const maxDayFormatted = maxDay?.day || 'N/A';
    const maxDayAmount = Number(maxDay?.loss_prevented_est_sum || 0);

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Compose Slack message
    const message = `🚨 Nova ROI — Daily Digest

Policy: ${POLICY_NAME} (${POLICY_ID.slice(0, 13)}...)

📊 Last 7 Days:
• Alerts: ${alerts7d.toLocaleString()}
• Loss Prevented: ${formatCurrency(lossPrevent7d)}

📈 Max Day (30d): ${maxDayFormatted}
• Peak Prevention: ${formatCurrency(maxDayAmount)}

Generated: ${new Date().toISOString()}`;

    // Send to Slack
    const slackResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      throw new Error(`Slack webhook failed: ${slackResponse.status} ${errorText}`);
    }

    return NextResponse.json({
      ok: true,
      message: 'ROI digest sent to Slack successfully',
      summary: {
        alerts_7d: alerts7d,
        loss_prevented_7d: lossPrevent7d,
        max_day: maxDayFormatted,
        max_day_amount: maxDayAmount,
      },
    });

  } catch (error: any) {
    console.error('ROI digest error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate ROI digest',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/roi-digest
 * Returns endpoint info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/roi-digest',
    method: 'POST',
    description: 'Sends a daily ROI digest to Slack',
    requires: ['SLACK_WEBHOOK_ROI', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE'],
    configured: {
      slack_webhook: !!process.env.SLACK_WEBHOOK_ROI,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE),
    },
  });
}



