import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// Initialize Gemini AI client if key exists
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// In-Memory Database Store for Meta Ads AI Controller
let adAccounts = [
  {
    id: 'acc_1',
    meta_account_id: 'act_8923471928',
    account_name: 'DTC E-Commerce Scale (US)',
    currency: 'USD',
    max_daily_budget_cents: 500000, // $5,000 max daily safety ceiling
    access_token_masked: 'EAAG...9a82',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'acc_2',
    meta_account_id: 'act_4920184920',
    account_name: 'SaaS Lead Gen (Global)',
    currency: 'USD',
    max_daily_budget_cents: 200000, // $2,000 max daily safety ceiling
    access_token_masked: 'EAAG...3b11',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

let campaigns = [
  {
    id: 'cmp_101',
    meta_campaign_id: 'meta_c_101',
    ad_account_id: 'acc_1',
    name: 'Conversions - Lookalike 1% - Spring Collection',
    objective: 'CONVERSIONS',
    status: 'ACTIVE',
    daily_budget_cents: 120000, // $1,200/day
    spend: 34210.50,
    impressions: 1245000,
    reach: 820000,
    frequency: 1.52,
    clicks: 45200,
    ctr: 3.63,
    cpc: 0.76,
    cpa: 24.50,
    roas: 3.85,
    purchases: 1396,
  },
  {
    id: 'cmp_102',
    meta_campaign_id: 'meta_c_102',
    ad_account_id: 'acc_1',
    name: 'Retargeting - Cart Abandoners (14D)',
    objective: 'CONVERSIONS',
    status: 'ACTIVE',
    daily_budget_cents: 45000, // $450/day
    spend: 12840.20,
    impressions: 410000,
    reach: 95000,
    frequency: 4.31, // High frequency flag!
    clicks: 18900,
    ctr: 4.61,
    cpc: 0.68,
    cpa: 18.20,
    roas: 5.12,
    purchases: 705,
  },
  {
    id: 'cmp_103',
    meta_campaign_id: 'meta_c_103',
    ad_account_id: 'acc_1',
    name: 'Broad Interest - Fitness & Wellness - Scale V2',
    objective: 'CONVERSIONS',
    status: 'ACTIVE',
    daily_budget_cents: 180000, // $1,800/day
    spend: 48900.00,
    impressions: 2100000,
    reach: 1650000,
    frequency: 1.27,
    clicks: 52400,
    ctr: 2.50,
    cpc: 0.93,
    cpa: 42.80, // High CPA flag!
    roas: 1.82,
    purchases: 1142,
  },
  {
    id: 'cmp_201',
    meta_campaign_id: 'meta_c_201',
    ad_account_id: 'acc_2',
    name: 'B2B SaaS - Enterprise Leads Q1',
    objective: 'LEADS',
    status: 'ACTIVE',
    daily_budget_cents: 80000,
    spend: 14200.00,
    impressions: 320000,
    reach: 180000,
    frequency: 1.45,
    clicks: 8900,
    ctr: 2.78,
    cpc: 1.59,
    cpa: null, // Zero purchases test case
    roas: 0.0,
    purchases: 0,
  }
];

let adSets = [
  {
    id: 'as_201',
    campaign_id: 'cmp_101',
    name: 'AdSet - LAL 1% Purchasers - US (25-54)',
    status: 'ACTIVE',
    daily_budget_cents: 120000,
    targeting: { age_min: 25, age_max: 54, genders: ['All'], locations: ['United States'], interests: ['Online shopping', 'Fitness'] },
  },
  {
    id: 'as_202',
    campaign_id: 'cmp_102',
    name: 'AdSet - Cart Abandoners 14D Dynamic',
    status: 'ACTIVE',
    daily_budget_cents: 45000,
    targeting: { age_min: 18, age_max: 65, genders: ['All'], locations: ['United States'], custom_audiences: ['Pixel Cart Abandoners 14D'] },
  },
  {
    id: 'as_203',
    campaign_id: 'cmp_103',
    name: 'AdSet - Broad Interest Health & Yoga',
    status: 'ACTIVE',
    daily_budget_cents: 180000,
    targeting: { age_min: 21, age_max: 45, genders: ['Women'], locations: ['United States', 'Canada'], interests: ['Yoga', 'Healthy diet'] },
  },
  {
    id: 'as_204',
    campaign_id: 'cmp_201',
    name: 'AdSet - CTOs & VP Engineering (US/UK)',
    status: 'ACTIVE',
    daily_budget_cents: 80000,
    targeting: { age_min: 30, age_max: 60, genders: ['All'], locations: ['United States', 'United Kingdom'], interests: ['Cloud computing', 'DevOps'] },
  }
];

let ads: Array<{
  id: string;
  adset_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  format: 'image' | 'video' | 'carousel';
  spend: number;
  impressions: number;
  ctr: number;
  cpa: number | null;
  preview_url: string;
  primary_text: string;
  headline: string;
  cta_type: string;
  destination_url: string;
}> = [
  {
    id: 'ad_301',
    adset_id: 'as_201',
    name: 'Ad - UGC Reel V1 - 9x16 - Spring',
    status: 'ACTIVE',
    format: 'video',
    spend: 18400,
    impressions: 620000,
    ctr: 4.12,
    cpa: 21.30,
    preview_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    primary_text: 'Stop settling for uncomfortable activewear. Discover the 4-way stretch fabric everyone is talking about.',
    headline: '50% Off Spring Collection Today Only',
    cta_type: 'SHOP_NOW',
    destination_url: 'https://brand.com/spring?utm_source=meta&utm_medium=paid&utm_campaign=spring',
  },
  {
    id: 'ad_302',
    adset_id: 'as_202',
    name: 'Ad - Carousel 5-Card Product Showcase',
    status: 'ACTIVE',
    format: 'carousel',
    spend: 12840,
    impressions: 410000,
    ctr: 4.61,
    cpa: 18.20,
    preview_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
    primary_text: 'Still thinking about your cart? Complete your order now and enjoy free express shipping on us.',
    headline: 'Your Cart Is Waiting | Free Shipping',
    cta_type: 'SHOP_NOW',
    destination_url: 'https://brand.com/cart?utm_source=meta&utm_medium=paid&utm_campaign=retargeting',
  },
  {
    id: 'ad_303',
    adset_id: 'as_203',
    name: 'Ad - Static Image - Minimalist Hero Shot',
    status: 'ACTIVE',
    format: 'image',
    spend: 48900,
    impressions: 2100000,
    ctr: 2.10,
    cpa: 48.50,
    preview_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    primary_text: 'Elevate your daily routine with engineered performance wear designed for all-day comfort.',
    headline: 'Engineered For Peak Performance',
    cta_type: 'LEARN_MORE',
    destination_url: 'https://brand.com/performance?utm_source=meta&utm_medium=paid&utm_campaign=broad',
  }
];

interface ApprovalQueueItemModel {
  id: string;
  ad_account_id: string;
  action_type: 'CREATE_AD' | 'UPDATE_BUDGET' | 'UPDATE_STATUS' | 'UPDATE_TARGETING';
  meta_entity_id: string;
  target_parent_id: string;
  proposed_payload: {
    name: string;
    adset_id: string;
    status: string;
    format?: string;
    primary_text?: string;
    headline?: string;
    description?: string;
    cta_type?: string;
    destination_url?: string;
    preview_url?: string;
    daily_budget_cents?: number;
  };
  ai_rationale: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_SIMULATION' | 'REJECTED' | 'FAILED';
  created_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

let approvalQueue: ApprovalQueueItemModel[] = [
  {
    id: 'aq_901',
    ad_account_id: 'acc_1',
    action_type: 'CREATE_AD',
    meta_entity_id: 'meta_ad_pending_991',
    target_parent_id: 'as_201',
    proposed_payload: {
      name: 'Ad - New UGC Reel V2 - Summer Drop',
      adset_id: 'as_201',
      status: 'PAUSED', // Strict enforcement
      format: 'video',
      primary_text: 'The summer drop is finally here. Lightweight, breathable, and crafted for movement.',
      headline: 'Meet The Summer Collection',
      description: 'Limited stock available',
      cta_type: 'SHOP_NOW',
      destination_url: 'https://brand.com/summer?utm_source=meta&utm_medium=paid',
      preview_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop&q=80'
    },
    ai_rationale: 'Generated to replace fatigued creative in AdSet LAL 1% where frequency crossed 3.5.',
    status: 'PENDING_APPROVAL',
    created_by: 'Alex Media Buyer (AI Agent Assistant)',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }
];

let auditLogs: Array<{
  id: string;
  ad_account_id: string;
  approval_id?: string | null;
  meta_endpoint: string;
  http_status: number;
  response_summary: any;
  executed_at: string;
}> = [
  {
    id: 'log_501',
    ad_account_id: 'acc_1',
    approval_id: null,
    meta_endpoint: 'GET /act_8923471928/insights',
    http_status: 200,
    response_summary: { message: 'Successfully synced 3 campaigns' },
    executed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }
];

// Helper: Resolve owning account ID from campaign, adset, or ad target
function resolveAccountIdForTarget(target: { campaign_id?: string; adset_id?: string; ad_id?: string }): string | null {
  if (target.campaign_id) {
    const cmp = campaigns.find(c => c.id === target.campaign_id);
    return cmp ? cmp.ad_account_id : null;
  }
  if (target.adset_id) {
    const as = adSets.find(a => a.id === target.adset_id);
    if (!as) return null;
    const cmp = campaigns.find(c => c.id === as.campaign_id);
    return cmp ? cmp.ad_account_id : null;
  }
  if (target.ad_id) {
    const ad = ads.find(a => a.id === target.ad_id);
    if (!ad) return null;
    const as = adSets.find(a => a.id === ad.adset_id);
    if (!as) return null;
    const cmp = campaigns.find(c => c.id === as.campaign_id);
    return cmp ? cmp.ad_account_id : null;
  }
  return null;
}

// Authentication & Authorization Middleware
const demoAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const demoUser = req.headers['x-demo-user'] as string || 'alex@brand.com';
  const demoRole = (req.headers['x-demo-role'] as string || 'ADMIN').toUpperCase();

  // If missing auth headers in non-GET or protected context, allow default dev mode or reject if unconfigured
  // Here we explicitly enable development-only demo login support via headers
  (req as any).user = {
    email: demoUser,
    role: demoRole, // ADMIN, REVIEWER, BUYER
  };
  next();
};

app.use(demoAuthMiddleware);

// API Endpoints

// 1. Get Accounts
app.get('/api/accounts', (req, res) => {
  res.json(adAccounts);
});

// 2. Get Ad Sets for an account (for Creative Studio dropdown picker)
app.get('/api/adsets', (req, res) => {
  const { account_id = 'acc_1' } = req.query;
  const comps = campaigns.filter(c => c.ad_account_id === account_id);
  const cmpIds = new Set(comps.map(c => c.id));
  const filteredAdSets = adSets.filter(as => cmpIds.has(as.campaign_id));
  res.json(filteredAdSets);
});

// 3. Get Insights / Summary (with CPA null handling for zero purchases & date preset filtering)
app.get('/api/insights', (req, res) => {
  const { account_id = 'acc_1', date_preset = 'last_7d' } = req.query;
  const filteredCampaigns = campaigns.filter(c => c.ad_account_id === account_id);
  
  const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalImpressions = filteredCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalPurchases = filteredCampaigns.reduce((acc, c) => acc + (c.purchases || 0), 0);
  const blendedCtr = (totalClicks / (totalImpressions || 1)) * 100;
  
  // Return null for CPA when there are zero purchases
  const blendedCpa = totalPurchases > 0 ? totalSpend / totalPurchases : null;
  const blendedRoas = filteredCampaigns.reduce((acc, c) => acc + (c.roas * c.spend), 0) / (totalSpend || 1);

  // Adjusted campaigns with null CPA if purchases === 0
  const mappedCampaigns = filteredCampaigns.map(c => ({
    ...c,
    cpa: c.purchases && c.purchases > 0 ? c.cpa : null
  }));

  res.json({
    date_preset,
    snapshot_label: `Fixed snapshot: Last 7 Days (In-memory state resets on restart)`,
    metrics: {
      spend: Math.round(totalSpend * 100) / 100,
      impressions: totalImpressions,
      clicks: totalClicks,
      purchases: totalPurchases,
      ctr: Math.round(blendedCtr * 100) / 100,
      cpa: blendedCpa !== null ? Math.round(blendedCpa * 100) / 100 : null,
      roas: Math.round(blendedRoas * 100) / 100,
    },
    campaigns: mappedCampaigns,
  });
});

// 4. Get Campaigns & Ad Sets (account-scoped)
app.get('/api/campaigns', (req, res) => {
  const { account_id = 'acc_1' } = req.query;
  const comps = campaigns.filter(c => c.ad_account_id === account_id);
  const result = comps.map(cmp => {
    const sets = adSets.filter(as => as.campaign_id === cmp.id).map(as => {
      const associatedAds = ads.filter(ad => ad.adset_id === as.id);
      return { ...as, ads: associatedAds };
    });
    return { ...cmp, ad_sets: sets };
  });
  res.json(result);
});

// 5. Update Budget (with strict target validation, safety ceiling check, and post-success audit logging)
app.post('/api/campaigns/update-budget', (req, res) => {
  const { campaign_id, adset_id, daily_budget_cents, account_id } = req.body;

  // Validate exactly one target
  const targetCount = [campaign_id, adset_id].filter(Boolean).length;
  if (targetCount !== 1) {
    return res.status(400).json({ error: 'Require exactly one valid target (campaign_id or adset_id).' });
  }

  // Resolve owning account from relationship
  const owningAccountId = resolveAccountIdForTarget({ campaign_id, adset_id });
  if (!owningAccountId || (account_id && owningAccountId !== account_id)) {
    return res.status(403).json({ error: 'Mismatched account ID, inaccessible account, or missing target.' });
  }

  // Validate positive safe integer for daily budget in cents
  if (!Number.isInteger(daily_budget_cents) || daily_budget_cents <= 0) {
    return res.status(400).json({ error: 'Daily budget must be a positive safe integer in cents.' });
  }

  const account = adAccounts.find(a => a.id === owningAccountId);
  if (!account) {
    return res.status(404).json({ error: 'Ad account not found.' });
  }

  if (daily_budget_cents > account.max_daily_budget_cents) {
    return res.status(400).json({
      error: `Budget exceeds safety ceiling of $${account.max_daily_budget_cents / 100}/day configured for this ad account.`
    });
  }

  // Apply change
  if (campaign_id) {
    const cmp = campaigns.find(c => c.id === campaign_id);
    if (cmp) cmp.daily_budget_cents = daily_budget_cents;
  } else if (adset_id) {
    const as = adSets.find(a => a.id === adset_id);
    if (as) as.daily_budget_cents = daily_budget_cents;
  }

  // Log success only after change succeeds
  auditLogs.unshift({
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    ad_account_id: owningAccountId,
    approval_id: null,
    meta_endpoint: `POST /act_.../budgets`,
    http_status: 200,
    response_summary: { target_id: campaign_id || adset_id, new_budget_cents: daily_budget_cents },
    executed_at: new Date().toISOString()
  });

  res.json({ success: true, message: 'Budget updated successfully' });
});

// 6. Update Status (with strict target validation and post-success audit logging)
app.post('/api/campaigns/update-status', (req, res) => {
  const { campaign_id, adset_id, ad_id, status } = req.body;

  // Validate exactly one target
  const targetCount = [campaign_id, adset_id, ad_id].filter(Boolean).length;
  if (targetCount !== 1) {
    return res.status(400).json({ error: 'Require exactly one valid target (campaign_id, adset_id, or ad_id).' });
  }

  // Validate status against supported values
  const supportedStatuses = ['ACTIVE', 'PAUSED', 'ARCHIVED'];
  if (!supportedStatuses.includes(status)) {
    return res.status(400).json({ error: `Unsupported status. Must be one of: ${supportedStatuses.join(', ')}` });
  }

  const owningAccountId = resolveAccountIdForTarget({ campaign_id, adset_id, ad_id });
  if (!owningAccountId) {
    return res.status(403).json({ error: 'Inaccessible account or missing target relationship.' });
  }

  // Apply change
  if (campaign_id) {
    const c = campaigns.find(x => x.id === campaign_id);
    if (c) c.status = status;
  } else if (adset_id) {
    const as = adSets.find(x => x.id === adset_id);
    if (as) as.status = status;
  } else if (ad_id) {
    const ad = ads.find(x => x.id === ad_id);
    if (ad) ad.status = status;
  }

  // Log success only after change succeeds
  auditLogs.unshift({
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    ad_account_id: owningAccountId,
    approval_id: null,
    meta_endpoint: `POST /act_.../status`,
    http_status: 200,
    response_summary: { target_id: campaign_id || adset_id || ad_id, status },
    executed_at: new Date().toISOString()
  });

  res.json({ success: true, status });
});

// 7. Get Approval Queue (filtered by selected account)
app.get('/api/approval-queue', (req, res) => {
  const { account_id = 'acc_1' } = req.query;
  const filtered = approvalQueue.filter(q => q.ad_account_id === account_id);
  res.json(filtered);
});

// 8. Stage Ad Creation (Validating ad-set ownership on server)
app.post('/api/creatives/stage-ad', (req, res) => {
  const { ad_account_id = 'acc_1', target_parent_id, name, format, primary_text, headline, description, cta_type, destination_url, preview_url, ai_rationale } = req.body;

  // Validate ad-set ownership
  const adSetObj = adSets.find(as => as.id === target_parent_id);
  if (!adSetObj) {
    return res.status(400).json({ error: 'Invalid or missing target ad-set ID.' });
  }
  const owningAcc = resolveAccountIdForTarget({ adset_id: target_parent_id });
  if (owningAcc !== ad_account_id) {
    return res.status(403).json({ error: 'Cross-account staging prohibited. Ad-set does not belong to the selected account.' });
  }

  const newQueueItem: ApprovalQueueItemModel = {
    id: 'aq_' + Math.random().toString(36).substr(2, 9),
    ad_account_id,
    action_type: 'CREATE_AD',
    meta_entity_id: 'meta_ad_' + Math.random().toString(36).substr(2, 9),
    target_parent_id,
    proposed_payload: {
      name: name || 'New Staged Ad',
      adset_id: target_parent_id,
      status: 'PAUSED', // Strict enforcement
      format: format || 'image',
      primary_text,
      headline,
      description,
      cta_type,
      destination_url,
      preview_url: preview_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'
    },
    ai_rationale: ai_rationale || 'Created via Ad Creative & Copy Studio.',
    status: 'PENDING_APPROVAL',
    created_by: (req as any).user?.email || 'media-buyer@brand.com',
    created_at: new Date().toISOString()
  };

  approvalQueue.unshift(newQueueItem);
  res.json({ success: true, item: newQueueItem });
});

// 9. Review Approval Queue Item (Idempotent, Role-based Reviewer Auth, Conflicting Decision -> 409)
app.post('/api/approval-queue/:id/review', (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'APPROVE' or 'REJECT'

  // Require reviewer role (ADMIN or REVIEWER)
  const user = (req as any).user;
  if (!user || !['ADMIN', 'REVIEWER'].includes(user.role)) {
    return res.status(403).json({ error: 'Forbidden: Reviewer or Admin role required for approval decisions.' });
  }

  if (!['APPROVE', 'REJECT'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be either APPROVE or REJECT.' });
  }

  const item = approvalQueue.find(q => q.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Queue item not found' });
  }

  // Idempotency & Conflict checks
  if (item.status === 'APPROVED_SIMULATION') {
    if (decision === 'APPROVE') {
      // Replaying same decision returns original result without creating duplicate ad or audit entry
      return res.json({ success: true, idempotent: true, item });
    } else {
      // Conflicting decision -> return HTTP 409
      return res.status(409).json({ error: 'Conflict: Item was already approved in simulation. Cannot reject.' });
    }
  }

  if (item.status === 'REJECTED') {
    if (decision === 'REJECT') {
      return res.json({ success: true, idempotent: true, item });
    } else {
      // Conflicting decision -> return HTTP 409
      return res.status(409).json({ error: 'Conflict: Item was already rejected. Cannot approve.' });
    }
  }

  // Apply decision if PENDING_APPROVAL
  const reviewerEmail = user.email || 'reviewer@brand.com';
  const timestamp = new Date().toISOString();

  if (decision === 'APPROVE') {
    item.status = 'APPROVED_SIMULATION';
    item.reviewed_at = timestamp;
    item.reviewed_by = reviewerEmail;

    // Validate ad-set ownership before approving
    const adSetObj = adSets.find(as => as.id === item.target_parent_id);
    if (!adSetObj) {
      return res.status(400).json({ error: 'Target ad set no longer exists.' });
    }

    const payload = item.proposed_payload;
    const newAd = {
      id: 'ad_' + Math.random().toString(36).substr(2, 9),
      adset_id: item.target_parent_id,
      name: payload.name,
      status: 'ACTIVE' as const, // Approved in simulation
      format: (payload.format || 'image') as any,
      spend: 0,
      impressions: 0,
      ctr: 0.0,
      cpa: null,
      preview_url: payload.preview_url || '',
      primary_text: payload.primary_text || '',
      headline: payload.headline || '',
      cta_type: payload.cta_type || 'SHOP_NOW',
      destination_url: payload.destination_url || '',
    };
    ads.push(newAd);

    auditLogs.unshift({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      ad_account_id: item.ad_account_id,
      approval_id: item.id,
      meta_endpoint: `POST /act_.../ads (Approved in simulation)`,
      http_status: 200,
      response_summary: { ad_id: newAd.id, status: 'ACTIVE', reviewer: reviewerEmail },
      executed_at: timestamp
    });

  } else {
    item.status = 'REJECTED';
    item.reviewed_at = timestamp;
    item.reviewed_by = reviewerEmail;

    auditLogs.unshift({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      ad_account_id: item.ad_account_id,
      approval_id: item.id,
      meta_endpoint: `POST /act_.../ads (Rejected)`,
      http_status: 200,
      response_summary: { approval_id: item.id, status: 'REJECTED', reviewer: reviewerEmail },
      executed_at: timestamp
    });
  }

  res.json({ success: true, item });
});

// 10. AI Diagnostics Endpoint (Account-scoped)
app.post('/api/ai/diagnostics', async (req, res) => {
  try {
    const { account_id = 'acc_1' } = req.body;
    const filteredCampaigns = campaigns.filter(c => c.ad_account_id === account_id);
    const campaignIds = new Set(filteredCampaigns.map(c => c.id));
    const filteredAdSets = adSets.filter(as => campaignIds.has(as.campaign_id));
    const adSetIds = new Set(filteredAdSets.map(as => as.id));
    const filteredAds = ads.filter(ad => adSetIds.has(ad.adset_id));

    const prompt = `You are an elite Meta Ads Senior Media Buying AI Analyst. Analyze the following account performance metrics and campaign data strictly for account ${account_id}:
Campaigns: ${JSON.stringify(filteredCampaigns, null, 2)}
Ad Sets: ${JSON.stringify(filteredAdSets, null, 2)}
Ads: ${JSON.stringify(filteredAds, null, 2)}

Identify key insights and issues:
1. Creative Fatigue Alerts (e.g. frequency > 3.0 and CTR drop).
2. Scaling Candidates (e.g. strong ROAS > 3.5 with stable spend).
3. Budget Leak Warnings (e.g. high CPA > $40 or zero purchases).

Return valid JSON with an array of recommendations under key "diagnostics". Each recommendation must have:
- id: string
- title: string
- type: "fatigue" | "scaling" | "leak"
- severity: "high" | "medium" | "low"
- description: string
- target_id: string
- suggested_action: string
- payload: object (suggested API change e.g. {"action": "STAGE_NEW_CREATIVE", "adset_id": "..."} or advisory budget/pause)
`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response scoped to account
      if (account_id === 'acc_2') {
        return res.json({
          diagnostics: [
            {
              id: 'dia_201',
              title: 'Zero Purchases Advisory - B2B Leads',
              type: 'leak',
              severity: 'high',
              description: 'Campaign has accumulated $14,200 spend with zero conversions recorded.',
              target_id: 'cmp_201',
              suggested_action: 'Advisory: Review landing page conversion funnel and lead capture form.',
              payload: { action: 'ADVISORY', campaign_id: 'cmp_201' }
            }
          ]
        });
      }

      return res.json({
        diagnostics: [
          {
            id: 'dia_1',
            title: 'Creative Fatigue Detected in Retargeting',
            type: 'fatigue',
            severity: 'high',
            description: 'Retargeting campaign frequency has reached 4.31 with CTR declining over the last 7 days.',
            target_id: 'cmp_102',
            suggested_action: 'Launch fresh carousel creative variant into approval queue (Staged Draft)',
            payload: { action: 'STAGE_NEW_CREATIVE', adset_id: 'as_202' }
          },
          {
            id: 'dia_2',
            title: 'Scaling Opportunity in Lookalike 1%',
            type: 'scaling',
            severity: 'medium',
            description: 'Lookalike 1% campaign is achieving 3.85 ROAS with $24.50 CPA.',
            target_id: 'cmp_101',
            suggested_action: 'Advisory: Consider scaling daily budget by 25%',
            payload: { action: 'UPDATE_BUDGET', campaign_id: 'cmp_101', daily_budget_cents: 150000 }
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    res.json(data);
  } catch (err: any) {
    console.error('AI Diagnostics error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI diagnostics' });
  }
});

// 11. AI Copywriting Assistant Endpoint using Gemini
app.post('/api/ai/copywriting', async (req, res) => {
  try {
    const { product_name, audience, objective, tone } = req.body;
    const prompt = `You are an expert direct-response Meta Ads copywriter. Generate 3 high-converting ad variations for:
Product/Offer: ${product_name}
Target Audience: ${audience}
Marketing Objective: ${objective}
Tone: ${tone || 'persuasive and urgent'}

Return valid JSON with an array under key "variations". Each item must have:
- primary_text (hook + body + emoji + CTA)
- headline (max 40 chars recommended, punchy)
- description (sub-headline benefit)
- cta_type (one of: LEARN_MORE, SHOP_NOW, SIGN_UP, GET_OFFER)
`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        variations: [
          {
            primary_text: `Ready to experience the ultimate upgrade for ${product_name}? Designed specifically for ${audience}, our breakthrough formula delivers immediate results. Tap below to claim yours before stock runs out! 👇`,
            headline: `Transform Your Routine Today`,
            description: `Rated 4.9/5 by 10,000+ happy customers`,
            cta_type: 'SHOP_NOW'
          },
          {
            primary_text: `Stop struggling with outdated solutions. ${product_name} gives ${audience} the exact edge you need to succeed. Get 20% off your first order today! ✨`,
            headline: `Limited Time 20% Off Launch Special`,
            description: `Free Express Shipping Worldwide`,
            cta_type: 'SHOP_NOW'
          },
          {
            primary_text: `The secret is finally out. Discover why ${audience} are switching to ${product_name}. Experience the difference risk-free with our 30-day money back guarantee.`,
            headline: `Discover The Difference`,
            description: `30-Day Risk-Free Guarantee`,
            cta_type: 'LEARN_MORE'
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    res.json(data);
  } catch (err: any) {
    console.error('AI Copywriting error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI copywriting' });
  }
});

// 12. Audit Logs (filtered by selected account)
app.get('/api/audit-logs', (req, res) => {
  const { account_id = 'acc_1' } = req.query;
  const filtered = auditLogs.filter(l => l.ad_account_id === account_id);
  res.json(filtered);
});

// Vite middleware integration for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Meta Ads AI Controller server running on http://0.0.0.0:${PORT}`);
});
