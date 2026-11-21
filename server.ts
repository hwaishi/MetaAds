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
];

let ads = [
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
    cpa: 48.50, // fatigue
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
  status: 'PENDING_APPROVAL' | 'APPROVED_LIVE' | 'REJECTED' | 'FAILED';
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
  approval_id?: string | null;
  meta_endpoint: string;
  http_status: number;
  response_summary: any;
  executed_at: string;
}> = [
  {
    id: 'log_501',
    approval_id: null,
    meta_endpoint: 'GET /act_8923471928/insights',
    http_status: 200,
    response_summary: { message: 'Successfully synced 3 campaigns' },
    executed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }
];

// API Endpoints

// 1. Get Accounts
app.get('/api/accounts', (req, res) => {
  res.json(adAccounts);
});

// 2. Get Insights / Summary
app.get('/api/insights', (req, res) => {
  const { account_id = 'acc_1', date_preset = 'last_7d' } = req.query;
  const filteredCampaigns = campaigns.filter(c => c.ad_account_id === account_id);
  
  const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalImpressions = filteredCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalPurchases = filteredCampaigns.reduce((acc, c) => acc + (c.purchases || 0), 0);
  const blendedCtr = (totalClicks / (totalImpressions || 1)) * 100;
  const blendedCpa = totalSpend / (totalPurchases || 1);
  const blendedRoas = filteredCampaigns.reduce((acc, c) => acc + (c.roas * c.spend), 0) / (totalSpend || 1);

  res.json({
    date_preset,
    metrics: {
      spend: Math.round(totalSpend * 100) / 100,
      impressions: totalImpressions,
      clicks: totalClicks,
      purchases: totalPurchases,
      ctr: Math.round(blendedCtr * 100) / 100,
      cpa: Math.round(blendedCpa * 100) / 100,
      roas: Math.round(blendedRoas * 100) / 100,
    },
    campaigns: filteredCampaigns,
  });
});

// 3. Get Campaigns & Ad Sets
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

// 4. Update Budget (with safety check)
app.post('/api/campaigns/update-budget', (req, res) => {
  const { campaign_id, adset_id, daily_budget_cents, account_id } = req.body;
  const account = adAccounts.find(a => a.id === (account_id || 'acc_1'));

  if (account && daily_budget_cents > account.max_daily_budget_cents) {
    return res.status(400).json({
      error: `Budget exceeds safety ceiling of $${account.max_daily_budget_cents / 100}/day configured for this ad account.`
    });
  }

  if (campaign_id) {
    const cmp = campaigns.find(c => c.id === campaign_id);
    if (cmp) {
      cmp.daily_budget_cents = daily_budget_cents;
    }
  } else if (adset_id) {
    const as = adSets.find(a => a.id === adset_id);
    if (as) {
      as.daily_budget_cents = daily_budget_cents;
    }
  }

  auditLogs.unshift({
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    approval_id: null,
    meta_endpoint: `POST /act_.../budgets`,
    http_status: 200,
    response_summary: { target_id: campaign_id || adset_id, new_budget_cents: daily_budget_cents },
    executed_at: new Date().toISOString()
  });

  res.json({ success: true, message: 'Budget updated successfully' });
});

// 5. Update Status
app.post('/api/campaigns/update-status', (req, res) => {
  const { campaign_id, adset_id, ad_id, status } = req.body;
  
  if (campaign_id) {
    const c = campaigns.find(x => x.id === campaign_id);
    if (c) c.status = status;
  }
  if (adset_id) {
    const as = adSets.find(x => x.id === adset_id);
    if (as) as.status = status;
  }
  if (ad_id) {
    const ad = ads.find(x => x.id === ad_id);
    if (ad) ad.status = status;
  }

  auditLogs.unshift({
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    approval_id: null,
    meta_endpoint: `POST /act_.../status`,
    http_status: 200,
    response_summary: { target_id: campaign_id || adset_id || ad_id, status },
    executed_at: new Date().toISOString()
  });

  res.json({ success: true, status });
});

// 6. Get Approval Queue
app.get('/api/approval-queue', (req, res) => {
  res.json(approvalQueue);
});

// 7. Stage Ad Creation (Strictly PAUSED)
app.post('/api/creatives/stage-ad', (req, res) => {
  const { ad_account_id, target_parent_id, name, format, primary_text, headline, description, cta_type, destination_url, preview_url, ai_rationale } = req.body;

  const newQueueItem: ApprovalQueueItemModel = {
    id: 'aq_' + Math.random().toString(36).substr(2, 9),
    ad_account_id: ad_account_id || 'acc_1',
    action_type: 'CREATE_AD',
    meta_entity_id: 'meta_ad_' + Math.random().toString(36).substr(2, 9),
    target_parent_id: target_parent_id || 'as_201',
    proposed_payload: {
      name: name || 'New Staged Ad',
      adset_id: target_parent_id || 'as_201',
      status: 'PAUSED', // ENFORCED
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
    created_by: 'Media Buyer (User)',
    created_at: new Date().toISOString()
  };

  approvalQueue.unshift(newQueueItem);
  res.json({ success: true, item: newQueueItem });
});

// 8. Review Approval Queue Item (Approve / Reject)
app.post('/api/approval-queue/:id/review', (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'APPROVE' or 'REJECT'

  const item = approvalQueue.find(q => q.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Queue item not found' });
  }

  if (decision === 'APPROVE') {
    item.status = 'APPROVED_LIVE';
    item.reviewed_at = new Date().toISOString();
    item.reviewed_by = 'Super Admin (Human Gate)';

    // Push into active ads in PAUSED -> ACTIVE state transition
    const payload = item.proposed_payload;
    const newAd = {
      id: 'ad_' + Math.random().toString(36).substr(2, 9),
      adset_id: item.target_parent_id,
      name: payload.name,
      status: 'ACTIVE' as const, // Activated upon human sign-off!
      format: (payload.format || 'image') as any,
      spend: 0,
      impressions: 0,
      ctr: 0.0,
      cpa: 0.0,
      preview_url: payload.preview_url || '',
      primary_text: payload.primary_text || '',
      headline: payload.headline || '',
      cta_type: payload.cta_type || 'SHOP_NOW',
      destination_url: payload.destination_url || '',
    };
    ads.push(newAd);

    auditLogs.unshift({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      approval_id: item.id,
      meta_endpoint: `POST /act_.../ads (Status -> ACTIVE)`,
      http_status: 200,
      response_summary: { ad_id: newAd.id, status: 'ACTIVE' },
      executed_at: new Date().toISOString()
    });

  } else {
    item.status = 'REJECTED';
    item.reviewed_at = new Date().toISOString();
    item.reviewed_by = 'Super Admin (Human Gate)';
  }

  res.json({ success: true, item });
});

// 9. AI Diagnostics Endpoint using Gemini
app.post('/api/ai/diagnostics', async (req, res) => {
  try {
    const prompt = `You are an elite Meta Ads Senior Media Buying AI Analyst. Analyze the following live account performance metrics and campaign data:
Campaigns: ${JSON.stringify(campaigns, null, 2)}
Ad Sets: ${JSON.stringify(adSets, null, 2)}
Ads: ${JSON.stringify(ads, null, 2)}

Identify key insights and issues:
1. Creative Fatigue Alerts (e.g. frequency > 3.0 and CTR drop).
2. Scaling Candidates (e.g. strong ROAS > 3.5 with stable spend).
3. Budget Leak Warnings (e.g. high CPA > $40).

Return valid JSON with an array of recommendations under key "diagnostics". Each recommendation must have:
- id: string
- title: string
- type: "fatigue" | "scaling" | "leak"
- severity: "high" | "medium" | "low"
- description: string
- target_id: string (campaign or ad id)
- suggested_action: string
- payload: object (suggested API change e.g. {"action": "PAUSE_AD" or "INCREASE_BUDGET", "amount": 150000})
`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        diagnostics: [
          {
            id: 'dia_1',
            title: 'Creative Fatigue Detected in Retargeting',
            type: 'fatigue',
            severity: 'high',
            description: 'Retargeting campaign frequency has reached 4.31 with CTR declining over the last 7 days.',
            target_id: 'cmp_102',
            suggested_action: 'Launch fresh carousel creative variant into approval queue',
            payload: { action: 'STAGE_NEW_CREATIVE', adset_id: 'as_202' }
          },
          {
            id: 'dia_2',
            title: 'Scaling Opportunity in Lookalike 1%',
            type: 'scaling',
            severity: 'medium',
            description: 'Lookalike 1% campaign is achieving 3.85 ROAS with $24.50 CPA.',
            target_id: 'cmp_101',
            suggested_action: 'Increase daily budget by 25% ($1,200 to $1,500/day)',
            payload: { action: 'UPDATE_BUDGET', campaign_id: 'cmp_101', daily_budget_cents: 150000 }
          },
          {
            id: 'dia_3',
            title: 'High CPA Warning in Broad Fitness Interest',
            type: 'leak',
            severity: 'high',
            description: 'Broad interest campaign CPA has spiked to $42.80, exceeding target threshold of $30.',
            target_id: 'cmp_103',
            suggested_action: 'Pause underperforming ad variant or narrow audience targeting',
            payload: { action: 'PAUSE_AD', ad_id: 'ad_303' }
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

// 10. AI Copywriting Assistant Endpoint using Gemini
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

// 11. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
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
