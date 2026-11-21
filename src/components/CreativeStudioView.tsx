import React, { useState } from 'react';
import { Sparkles, Upload, Image as ImageIcon, Video, CheckCircle2, ShieldAlert, Link, Send, RefreshCw } from 'lucide-react';

interface CreativeStudioViewProps {
  selectedAccount: string;
  onNavigateTab: (tab: string) => void;
}

const sampleImages = [
  { name: 'UGC Spring Model', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Minimalist Product Hero', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lifestyle Gym Workout', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Summer Beach Collection', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop&q=80' },
];

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({ selectedAccount, onNavigateTab }) => {
  const [productName, setProductName] = useState('UltraComfort Performance Joggers');
  const [audience, setAudience] = useState('Fitness enthusiasts & remote workers aged 25-45');
  const [objective, setObjective] = useState('Conversions & Purchases');
  const [tone, setTone] = useState('Urgent & Persuasive');

  const [primaryText, setPrimaryText] = useState('Stop settling for stiff, uncomfortable sweatpants. Engineered with 4-way stretch fabric, our joggers give you all-day comfort without sacrificing style. Order today and get 20% off!');
  const [headline, setHeadline] = useState('Upgrade Your Daily Comfort');
  const [description, setDescription] = useState('Rated 4.9/5 by 12,000+ customers');
  const [ctaType, setCtaType] = useState('SHOP_NOW');
  const [destinationUrl, setDestinationUrl] = useState('https://brand.com/joggers?utm_source=meta&utm_medium=paid&utm_campaign=spring_launch');
  const [selectedImage, setSelectedImage] = useState(sampleImages[0].url);
  const [format, setFormat] = useState<'image' | 'video'>('image');

  const [aiVariations, setAiVariations] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [stagingSuccess, setStagingSuccess] = useState<string | null>(null);

  const handleGenerateCopy = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName, audience, objective, tone })
      });
      const data = await res.json();
      setAiVariations(data.variations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyVariation = (v: any) => {
    setPrimaryText(v.primary_text);
    setHeadline(v.headline);
    setDescription(v.description);
    setCtaType(v.cta_type || 'SHOP_NOW');
  };

  const handleStageAd = async () => {
    try {
      const res = await fetch('/api/creatives/stage-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: selectedAccount,
          target_parent_id: 'as_201',
          name: `Ad - ${productName} - ${format.toUpperCase()}`,
          format,
          primary_text: primaryText,
          headline,
          description,
          cta_type: ctaType,
          destination_url: destinationUrl,
          preview_url: selectedImage,
          ai_rationale: 'Created via AI Creative & Copy Studio. Forced to PAUSED status for human approval gate.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStagingSuccess('Ad successfully staged in Approval Queue in PAUSED draft mode!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI Copywriting & Asset Staging
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">AI Creative & Copy Studio</h1>
          <p className="text-sm text-slate-400">Generate high-converting direct-response copy and stage ads safely into the approval queue.</p>
        </div>
      </div>

      {stagingSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-sm">{stagingSuccess}</span>
          </div>
          <button
            onClick={() => onNavigateTab('approval-queue')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
          >
            Review in Approval Queue →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Copy Generator & Ad Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Copywriting Generator Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">AI Direct-Response Copywriting Assistant</h2>
              </div>
              <button
                onClick={handleGenerateCopy}
                disabled={loadingAi}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loadingAi ? 'Generating...' : 'Generate 3 AI Copy Variants'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Product / Offer Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Target Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* AI Variations Result Cards */}
            {aiVariations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select AI Copy Variation to Apply:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiVariations.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => handleApplyVariation(v)}
                      className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Variant #{i + 1}</span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full">{v.cta_type}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 line-clamp-3">{v.primary_text}</p>
                      </div>
                      <button className="w-full py-1.5 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition">
                        Apply Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ad Creative Customizer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-white">Ad Creative & Copy Editor</h2>

            <div>
              <label className="text-xs text-slate-400 font-medium">Primary Text (Ad Hook & Body)</label>
              <textarea
                rows={3}
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Headline (Max 40 chars recommended)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Link Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Call-To-Action Button</label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="SHOP_NOW">SHOP NOW</option>
                  <option value="LEARN_MORE">LEARN MORE</option>
                  <option value="SIGN_UP">SIGN UP</option>
                  <option value="GET_OFFER">GET OFFER</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Destination URL with UTMs</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Link className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="pt-2">
              <label className="text-xs text-slate-400 font-medium mb-2 block">Select Staged Artwork / Video Asset</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sampleImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                      selectedImage === img.url ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 to-transparent p-2">
                      <span className="text-[10px] text-white font-medium truncate block">{img.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Action Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Enforces strict safety rule: Created in <b>PAUSED</b> draft mode</span>
              </div>
              <button
                onClick={handleStageAd}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-blue-600/30 transition"
              >
                <Send className="w-4 h-4" />
                <span>Stage Ad in Approval Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Meta Ad Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg sticky top-24">
            <h2 className="text-base font-bold text-white mb-3">Live Meta Ad Preview</h2>
            <p className="text-xs text-slate-400 mb-4">Rendered via Meta `/previews` endpoint simulation</p>

            {/* Mobile Feed Preview Mockup */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-3 flex items-center space-x-3 border-b border-slate-800/80">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                  BA
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Brand Official</span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full text-[8px] flex items-center justify-center text-white">✓</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Sponsored • Paid Partnership</div>
                </div>
              </div>

              {/* Primary Text */}
              <div className="p-3 text-xs text-slate-200 line-clamp-3">
                {primaryText}
              </div>

              {/* Media Preview */}
              <div className="relative aspect-square bg-slate-900">
                <img src={selectedImage} alt="Ad Creative" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                  {format}
                </div>
              </div>

              {/* Link Banner */}
              <div className="bg-slate-900 p-3 flex items-center justify-between border-t border-slate-800">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] uppercase text-slate-400 truncate">brand.com</div>
                  <div className="text-xs font-bold text-white truncate">{headline}</div>
                  <div className="text-[10px] text-slate-400 truncate">{description}</div>
                </div>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap">
                  {ctaType.replace('_', ' ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
