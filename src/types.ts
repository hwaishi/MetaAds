export interface AdAccount {
  id: string;
  meta_account_id: string;
  account_name: string;
  currency: string;
  max_daily_budget_cents: number;
  access_token_masked: string;
  created_at: string;
}

export interface Ad {
  id: string;
  adset_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  format: 'image' | 'video' | 'carousel';
  spend: number;
  impressions: number;
  ctr: number;
  cpa: number;
  preview_url: string;
  primary_text: string;
  headline: string;
  cta_type: string;
  destination_url: string;
}

export interface AdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  daily_budget_cents: number;
  targeting: {
    age_min: number;
    age_max: number;
    genders: string[];
    locations: string[];
    interests?: string[];
    custom_audiences?: string[];
  };
  ads?: Ad[];
}

export interface Campaign {
  id: string;
  meta_campaign_id: string;
  ad_account_id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  daily_budget_cents: number;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  purchases: number;
  ad_sets?: AdSet[];
}

export interface ApprovalQueueItem {
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

export interface AuditLog {
  id: string;
  approval_id?: string;
  meta_endpoint: string;
  http_status: number;
  response_summary: any;
  executed_at: string;
}

export interface AIDiagnostic {
  id: string;
  title: string;
  type: 'fatigue' | 'scaling' | 'leak';
  severity: 'high' | 'medium' | 'low';
  description: string;
  target_id: string;
  suggested_action: string;
  payload: any;
}
