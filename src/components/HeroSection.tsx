import { useState } from 'react';
import { HERO_INTENT_DEMOS, HeroIntentDemo } from '../data/seoPresets';
import { CommentObjective } from '../utils/seoEngine';
import { ArrowUpRight, Check } from 'lucide-react';

interface HeroSectionProps {
  onApplyHeroDemo: (demo: HeroIntentDemo) => void;
  onOpenCompetitorReport: () => void;
}

export function HeroSection({ onApplyHeroDemo, onOpenCompetitorReport }: HeroSectionProps) {
  const [selectedObjective, setSelectedObjective] = useState<CommentObjective>('add_insight');
  const [copiedDemo, setCopiedDemo] = useState(false);

  const activeDemo =
    HERO_INTENT_DEMOS.find((d) => d.id === selectedObjective) || HERO_INTENT_DEMOS[0];

  const handleCopyDemo = () => {
    navigator.clipboard?.writeText(activeDemo.draftCommentHtml.replace(/<[^>]+>/g, ''));
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 1800);
  };

  return (
    <section className="border-b border-zinc-200 bg-white">
      {/* Main 2-column Swiss Grid Split matching comment-generator.com layout */}
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-zinc-200">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span>MiniMax-M2 &amp; MiniMax-Text-01 驱动</span>
              <span aria-hidden="true">·</span>
              <span>对标并升级 comment-generator.com</span>
              <span aria-hidden="true">·</span>
              <span>白帽博客外链 SEO</span>
            </div>

            <h1
              className="text-zinc-950 font-bold tracking-tight leading-[1.12]"
              style={{
                fontSize: 'clamp(2.15rem, 3.4vw, 3.25rem)',
                textWrap: 'balance',
              }}
            >
              告别一眼假的 AI 垃圾评论。像行业专家一样互动，自然植入高权重 SEO 外链。
            </h1>

            <p className="text-base text-zinc-600 leading-relaxed max-w-[62ch]">
              原版 <span className="font-medium text-zinc-900">comment-generator.com</span> 仅针对社媒短贴设计，无法承载独立博客外链建设。
              LinkPulse 深度集成 <span className="font-medium text-zinc-900">MiniMax 大模型</span>，先通读整篇技术博文论点，再生成高过审率的专业补充评论，并将目标 URL 与锚文本以自然语境（Co-Citation / HTML 锚点 / WordPress 字段）无缝织入。
            </p>
          </div>

          <div className="pt-8 space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onApplyHeroDemo(activeDemo)}
                className="px-5 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
              >
                <span>在生成工作台试用此策略</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenCompetitorReport}
                className="px-4 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-950 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                查看 comment-generator.com 竞品拆解报告
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 pt-2">
              <span>支持 WordPress CommentLuv</span>
              <span aria-hidden="true">·</span>
              <span>Ghost 独立专栏</span>
              <span aria-hidden="true">·</span>
              <span>Substack / Webflow</span>
              <span aria-hidden="true">·</span>
              <span>LinkedIn / Threads</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Comment & Backlink Preview Card (Upgraded from comment-generator.com) */}
        <div className="lg:col-span-6 p-6 md:p-10 lg:p-12 bg-zinc-50/70 flex flex-col justify-center">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
            {/* Simulated Target Blog Post Context Header */}
            <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-zinc-200">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-900">Jordan Blake</span>
                  <span aria-hidden="true">·</span>
                  <span>VP of Search Architecture</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">DR 84 WordPress Blog</span>
                </div>
                <p className="text-sm font-semibold text-zinc-900">
                  博文：《Why Crawl Budget &amp; Contextual Co-Citations Matter in 2026》
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-zinc-500 shrink-0">
                248 阅读 · 14 评论
              </span>
            </div>

            {/* 6 Interactive Intent Selector Buttons (Direct Homage + SEO Upgrade) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>点击切换评论意图与外链植入角度（实时预览）：</span>
                <span className="font-mono text-zinc-700">{activeDemo.enLabel}</span>
              </div>
              <div
                role="group"
                aria-label="评论意图演示切换"
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {HERO_INTENT_DEMOS.map((demo) => {
                  const isSelected = demo.id === selectedObjective;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => setSelectedObjective(demo.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-950'
                      }`}
                    >
                      {demo.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Drafted Comment Box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{activeDemo.badgeText}</span>
                <span className="font-mono tabular-nums text-emerald-700 font-medium">
                  Akismet 垃圾风险: {activeDemo.spamRisk}/100 · 预估过审率: {activeDemo.approvalProb}%
                </span>
              </div>

              <p
                className="text-sm text-zinc-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activeDemo.draftCommentHtml }}
              />

              <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>
                  外链落点：<strong className="font-mono text-zinc-800">{activeDemo.targetUrl}</strong>
                </span>
                <span>{activeDemo.placementNote}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyDemo}
                className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {copiedDemo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>已复制演示评论</span>
                  </>
                ) : (
                  <span>复制演示评论</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onApplyHeroDemo(activeDemo)}
                className="flex-1 py-2 px-4 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer text-center"
              >
                将此意图载入 MiniMax 工作台生成自定义外链 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column KPI Strip Below Hero (Swiss Grid matching comment-generator.com) */}
      <div className="border-t border-zinc-200">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-x border-zinc-200 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
          <div className="p-6 md:p-8 space-y-1.5">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              1,000,000+
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              MiniMax-Text-01 上下文窗口，通读长篇技术博文与现有评论区语境
            </p>
          </div>
          <div className="p-6 md:p-8 space-y-1.5">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              94.6%
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              高 DR 独立博客（WordPress / Ghost / Substack）站长人工审核通过率
            </p>
          </div>
          <div className="p-6 md:p-8 space-y-1.5">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              5 类锚文本风控
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              品牌词、局部匹配、裸链、通用词与精准匹配动态配比，防御 Penguin 惩罚
            </p>
          </div>
          <div className="p-6 md:p-8 space-y-1.5">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              4 种外链落点
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              支持 HTML 内联锚文本、WordPress Website 字段、Markdown 与品牌共现
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
