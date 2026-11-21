# Meta Ads AI Controller & Creative Staging Web App — Technical Blueprint

## 1. Project Overview
Build a full-stack web application that connects securely to **Meta (Facebook) Ads Manager** via the **Meta Marketing API (`v27.0`)**. The application enables media buyers and marketers to:
1. **Analyze Campaign Performance:** Pull real-time metrics across Campaigns, Ad Sets, and Ads, with AI-powered diagnostics to detect creative fatigue, rising CPA, or scaling opportunities.
2. **Edit Existing Campaigns & Ad Sets:** Modify budgets, schedules, targeting parameters, and statuses safely.
3. **Upload New Ads (Artwork, Video & Copywriting):** Upload static images and videos, pair them with AI-assisted or manual direct-response ad copy, and push them to Meta Ads Manager in **`PAUSED` draft mode**.
4. **Human-in-the-Loop Approval Gate:** Hold every newly uploaded ad or campaign edit in a visual **Approval Queue**—rendering the live Meta Ad Preview—and strictly wait for explicit user confirmation before switching any ad or campaign to `ACTIVE`.

---

## 2. Recommended Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
* **Backend / API Layer:** Next.js Server Actions / Route Handlers (or Node.js / Python FastAPI) — *all Meta API calls must execute server-side to protect access tokens*
* **Database:** PostgreSQL (via Supabase or Neon) with Prisma or Drizzle ORM
* **Temporary Asset Storage:** AWS S3, Cloudflare R2, or Supabase Storage (for staging raw image/video uploads before pushing to Meta)
* **AI Layer:** LLM API (e.g., Gemini, OpenAI, or Anthropic) with structured JSON outputs for performance diagnostics and direct-response copywriting
* **External API:** Meta Graph & Marketing API `v27.0` (`https://graph.facebook.com/v27.0`)

---

## 3. Meta Developer & Business Manager Setup
Before connecting the web app, configure the following in the Meta Developer Portal and Meta Business Suite:

1. **Create a Meta App:** Select **Business** app type at `developers.facebook.com` and add the **Marketing API** product.
2. **Authentication Strategy:**
   * **Single-Business / Internal Tool:** Create a **System User** inside Meta Business Settings, assign the target Ad Account(s) and Facebook Page(s), and generate a non-expiring System User Access Token.
   * **Multi-Tenant / SaaS Tool:** Implement **Facebook Login for Business** OAuth flow to exchange short-lived tokens for long-lived user tokens.
3. **Required API Permissions (Scopes):**
   * `ads_read` — Read campaign performance metrics and account structure.
   * `ads_management` — Create, edit, pause, and activate campaigns, ad sets, creatives, and ads.
   * `business_management` — List Business Portfolios and connected Ad Accounts.
   * `pages_read_engagement` & `pages_manage_ads` — Link ads to the brand's Facebook Page and Instagram Business Account.
4. **Rate-Limit Handling:** Monitor the `x-business-use-case-usage` HTTP response header from Meta and implement exponential backoff if utilization exceeds `80%`.

---

## 4. Core Functional Modules

### Module 1: Campaign Performance Dashboard & AI Analyst
* **Data Sync (`GET /act_{ad_account_id}/insights`):**
  * Fetch metrics at `campaign`, `adset`, and `ad` levels across selectable date presets (`today`, `yesterday`, `last_7d`, `last_30d`).
  * **Key Fields:** `campaign_name`, `adset_name`, `ad_name`, `spend`, `impressions`, `reach`, `frequency`, `clicks`, `ctr`, `cpc`, `cpm`, `actions` (Leads, Purchases, Messaging Conversations Started), `cost_per_action_type`, `purchase_roas`.
* **AI Diagnostic Engine:**
  * Feeds normalized campaign metrics into the LLM to output structured recommendations:
    * *Creative Fatigue Alert:* Triggered when `frequency > 3.0` and `ctr` drops by `> 20%` over 7 days.
    * *Scaling Candidate:* Triggered when CPA/ROAS beats target KPI over at least 3 days with stable spend.
    * *Budget Leak Warning:* Triggered when spend exceeds $2\times$ target CPA with zero conversions.
  * Each AI recommendation includes a **"Stage Proposed Edit"** button that sends the suggested change into the Approval Queue rather than executing it immediately.

### Module 2: Campaign & Ad Set Editor
* View hierarchical tree: `Campaign -> Ad Set -> Ad`.
* Allow inline editing of:
  * Daily Budget / Lifetime Budget (stored in minor currency units, e.g., cents/sen)
  * Bid Strategy & Bid Cap / Cost Cap
  * Ad Set Targeting (Age, Gender, Locations, Custom Audiences)
  * Status (`ACTIVE` / `PAUSED`)
* **Rule:** Any budget increase above a configurable safety threshold (e.g., `> 20%`) or status activation must pass through the **Approval Gate**.

### Module 3: Ad Creative & Copy Studio (Artwork, Video & Copywriting)
* **Media Uploader:**
  * Drag-and-drop support for static images (`JPG`, `PNG` — 1:1 `1080x1080`, 4:5 `1080x1350`, 9:16 `1080x1920`, max 30MB) and videos (`MP4`, `MOV` — max 4GB).
  * Client-side validation for aspect ratio, resolution, and file size before upload.
* **AI Copywriting Assistant:**
  * Input: Product/offer details, target audience, objective (Conversions, Leads, Click-to-WhatsApp), and tone.
  * Output: 3 variations of **Primary Text** (hook + body + CTA), **Headline** (max 40 chars recommended), **Link Description**, and **Call-To-Action** enum (`LEARN_MORE`, `SHOP_NOW`, `SIGN_UP`, `SEND_WHATSAPP_MESSAGE`, `GET_QUOTE`).
* **Destination Configurator:**
  * Website URL + UTM parameter builder, OR Click-to-WhatsApp / Instant Form (Lead Gen) selector.

### Module 4: Human Approval Gate & Staging Queue (Mandatory Safety Layer)
* **Strict Default Rule:** Every new ad created through the web app is pushed to Meta with `"status": "PAUSED"`.
* **Staging Queue UI:**
  * Displays all pending drafts (`PENDING_APPROVAL`) with:
    * Target Campaign & Ad Set name + current Ad Set daily budget
    * Live rendered **Meta Ad Preview** (fetched via Meta's `/previews` endpoint)
    * Full copy breakdown (Primary Text, Headline, Description, Destination URL, CTA)
    * Pre-flight compliance & sanity checklist (e.g., valid URL, pixel attached, budget within safety cap)
* **Confirmation Actions:**
  * **`Confirm & Run Ads`:** Triggers the final API call to update the ad (and parent campaign/ad set if requested) from `PAUSED` to `ACTIVE`, logs the approver's timestamp, and updates status to `APPROVED_LIVE`.
  * **`Request Revision` / `Reject`:** Keeps the ad `PAUSED` or archives it (`ARCHIVED`), recording feedback notes.

---

## 5. Meta Marketing API (`v27.0`) Deployment Sequence

When the user clicks **"Stage Ad in Ads Manager (Paused)"**, the backend executes this exact 4-step pipeline:

### Step 1A: Upload Static Image (If Artwork)
* **Endpoint:** `POST https://graph.facebook.com/v27.0/act_{ad_account_id}/adimages`
* **Payload:** `multipart/form-data` containing the image file.
* **Response:** Extract `images.{filename}.hash` (`image_hash`).

### Step 1B: Upload Video (If Video)
* **Endpoint:** `POST https://graph.facebook.com/v27.0/act_{ad_account_id}/advideos`
* **Payload:** `multipart/form-data` containing the video file (or resumable upload chunks for large files).
* **Response:** Extract `id` (`video_id`).
* **Encoding Poll:** Poll `GET https://graph.facebook.com/v27.0/{video_id}?fields=status` until `status.video_status === "ready"` before creating the creative.

### Step 2: Create Ad Creative Object
* **Endpoint:** `POST https://graph.facebook.com/v27.0/act_{ad_account_id}/adcreatives`
* **Sample Image Creative Payload:**
```json
{
  "name": "Creative - Promo V1 - 1080x1080",
  "object_story_spec": {
    "page_id": "{facebook_page_id}",
    "instagram_actor_id": "{instagram_business_id}",
    "link_data": {
      "image_hash": "{image_hash}",
      "link": "https://yourdomain.com/offer?utm_source=meta&utm_medium=paid",
      "message": "Primary text hook goes here...",
      "name": "Scroll-Stopping Headline",
      "description": "Supporting benefit line",
      "call_to_action": {
        "type": "LEARN_MORE",
        "value": {
          "link": "https://yourdomain.com/offer?utm_source=meta&utm_medium=paid"
        }
      }
    }
  }
}
```
* **Sample Video Creative Payload:**
```json
{
  "name": "Creative - UGC Reel V1 - 9x16",
  "object_story_spec": {
    "page_id": "{facebook_page_id}",
    "instagram_actor_id": "{instagram_business_id}",
    "video_data": {
      "video_id": "{video_id}",
      "image_hash": "{thumbnail_image_hash}",
      "message": "Primary text hook goes here...",
      "title": "Scroll-Stopping Headline",
      "link_description": "Supporting benefit line",
      "call_to_action": {
        "type": "SHOP_NOW",
        "value": {
          "link": "https://yourdomain.com/offer"
        }
      }
    }
  }
}
```

### Step 3: Create Ad in `PAUSED` State
* **Endpoint:** `POST https://graph.facebook.com/v27.0/act_{ad_account_id}/ads`
* **Payload:**
```json
{
  "name": "Ad - Promo V1 - Static",
  "adset_id": "{target_adset_id}",
  "creative": {
    "creative_id": "{created_creative_id}"
  },
  "status": "PAUSED"
}
```

### Step 4: Generate Preview & Wait for Confirmation
* **Fetch Preview:** `GET https://graph.facebook.com/v27.0/{created_ad_id}/previews?ad_format=MOBILE_FEED_STANDARD`
* Render the returned preview `iframe` inside the web app's **Approval Queue**.
* **Only after the user clicks "Confirm & Run Ads":**
  * **Endpoint:** `POST https://graph.facebook.com/v27.0/{created_ad_id}`
  * **Payload:** `{"status": "ACTIVE"}`

---

## 6. Database Schema (PostgreSQL)

```sql
CREATE TABLE ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_account_id VARCHAR(64) UNIQUE NOT NULL, -- e.g., act_123456789
  account_name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  max_daily_budget_cents BIGINT NOT NULL DEFAULT 50000, -- Safety spend guardrail
  encrypted_access_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'CREATE_AD' | 'UPDATE_BUDGET' | 'UPDATE_STATUS' | 'UPDATE_TARGETING'
  meta_entity_id VARCHAR(64), -- Created paused ad_id or target campaign/adset_id
  target_parent_id VARCHAR(64), -- Target adset_id or campaign_id
  proposed_payload JSONB NOT NULL, -- Full API payload & copy details
  preview_iframe_html TEXT, -- Rendered Meta Ad Preview HTML
  ai_rationale TEXT, -- AI explanation if suggested by diagnostics
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL' | 'APPROVED_LIVE' | 'REJECTED' | 'FAILED'
  created_by VARCHAR(255) NOT NULL,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID REFERENCES approval_queue(id),
  meta_endpoint VARCHAR(255) NOT NULL,
  http_status INT NOT NULL,
  response_summary JSONB,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Security & Spend-Protection Guardrails
1. **Zero Client-Side Tokens:** Never expose Meta Access Tokens or App Secrets in browser code or `NEXT_PUBLIC_*` environment variables.
2. **Hardcoded `PAUSED` Creation:** Enforce `status = "PAUSED"` inside the backend service layer for all `POST /ads`, `POST /adsets`, and `POST /campaigns` creation calls—even if a client request attempts to pass `"ACTIVE"`.
3. **Budget Ceiling Check:** Reject any campaign/ad set budget edit that exceeds `ad_accounts.max_daily_budget_cents` unless explicitly overridden by an Admin.
4. **Idempotency Keys:** Generate a unique UUID per staging submission so double-clicking "Confirm & Run Ads" never creates duplicate ads.

---

## 8. Prompt to Generate This App in an AI Code Editor
Copy and paste the prompt below into **Cursor, Windsurf, Bolt, Lovable, or Claude Code** alongside this Markdown file:

> "Using the attached `meta-ads-ai-controller-spec.md` blueprint, scaffold a full-stack Next.js (App Router, TypeScript, Tailwind CSS) web application for managing Meta Ads via Marketing API v27.0. Implement:
> 1. A server-side Meta Graph API client (`/lib/meta-api.ts`) supporting Insights fetching, Campaign/AdSet updates, `/adimages` & `/advideos` uploads, `/adcreatives` assembly, `/ads` creation strictly forced to `status: 'PAUSED'`, `/previews` fetching, and status activation.
> 2. A Campaign Analytics dashboard with an AI Diagnostics panel that flags high CPA and creative fatigue.
> 3. An Ad Creative & Copy Studio supporting image/video uploads and AI direct-response copy generation.
> 4. A mandatory Human Approval Queue page that displays live ad previews and budget diffs, requiring an explicit 'Confirm & Run Ads' click before activating any ad or budget edit.
> Include clean environment variable templates (`.env.example`) and PostgreSQL schema migrations."