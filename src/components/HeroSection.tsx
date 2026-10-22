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
      {/* Main 2-column Swiss Grid Split */}
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-zinc-200">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span>MiniMax-M3.1-Flash &amp; MiniMax-Text-01 驱动</span>
              <span aria-hidden="true">·</span>
              <span>新一代白帽独立博客外链中枢</span>
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
              传统社媒生成工具仅针对浅层社交互动设计，无法承载独立博客的高权重外链建设。
              LinkPulse 深度集成 <span className="font-medium text-zinc-900">MiniMax-M3.1-Flash 最新大模型</span>，先通读整篇技术博文论点，再生成高过审率的专业补充评论，并将目标 URL 与锚文本以自然语境（Co-Citation / HTML 锚点 / WordPress 字段）无缝织入。
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
                查看传统社媒与独立博客外链体系对比
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

        {/* Right Column: Interactive Comment & Backlink Preview Card */}
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
                  {activeDemo.articleTitle}
                </p>
              </div>

              <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {activeDemo.expectedRel} 推荐
              </span>
            </div>

            {/* Objective Pills */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-600 block">
                选择你的专业评论互动切入角 (6 大实战意图)：
              </span>
              <div
                role="radiogroup"
                aria-label="选择评论互动意图"
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {HERO_INTENT_DEMOS.map((demo) => {
                  const isSelected = demo.id === selectedObjective;
                  return (
                    <button
                      key={demo.id}
                      role="radio"
                      aria-checked={isSelected}
                      type="button"
                      onClick={() => setSelectedObjective(demo.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer text-xs space-y-1 ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-950 text-white font-medium'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="font-semibold truncate">{demo.label}</div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-500'
                        }`}
                      >
                        {demo.angle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Injected Contextual Draft Box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>MiniMax 生成方案预览 (带自然语境锚文本)</span>
                <span className="text-emerald-700 font-medium">Akismet 安全评分 98/100</span>
              </div>

              <div
                className="text-xs text-zinc-800 leading-relaxed font-mono whitespace-pre-wrap selection:bg-emerald-200"
                dangerouslySetInnerHTML={{ __html: activeDemo.draftCommentHtml }}
              />

              <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">落链目标：</span>
                  <span className="font-mono font-medium text-zinc-900">
                    {activeDemo.targetBrand} ({activeDemo.anchorKeyword})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyDemo}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  {copiedDemo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>已复制评论内容</span>
                    </>
                  ) : (
                    <span>复制文本</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column KPI Strip Below Hero */}
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-zinc-200 bg-zinc-50/50">
        <div className="p-6 md:p-8 space-y-1">
          <div className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-zinc-950">
            94.6%
          </div>
          <div className="text-xs font-semibold text-zinc-900">人工审稿过审率</div>
          <div className="text-xs text-zinc-500">
            基于真实博文论点引用，无废话套话
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-1">
          <div className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-zinc-950">
            100%
          </div>
          <div className="text-xs font-semibold text-zinc-900">独立站白帽外链</div>
          <div className="text-xs text-zinc-500">
            支持 DoFollow / UGC 与 WP Website 字段
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-1">
          <div className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-zinc-950">
            &lt; 15%
          </div>
          <div className="text-xs font-semibold text-zinc-900">Akismet 垃圾指数</div>
          <div className="text-xs text-zinc-500">
            智能规避 40+ 种高危营销拦截词
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-1">
          <div className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-zinc-950">
            3 站点
          </div>
          <div className="text-xs font-semibold text-zinc-900">多站一键切换</div>
          <div className="text-xs text-zinc-500">
            内置 soundtest.pro / jmcy.cn / franvetted.com
          </div>
        </div>
      </div>
    </section>
  );
}
