/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavSectionId, TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { CommentWorkbench } from './components/CommentWorkbench';
import { ExtensionStudioSection } from './components/ExtensionStudioSection';
import { BlogDiscoverySection } from './components/BlogDiscoverySection';
import { BacklinkQueueSection } from './components/BacklinkQueueSection';
import { CompetitorAnalysisSection } from './components/CompetitorAnalysisSection';
import { SeoConversionMonitorSection } from './components/SeoConversionMonitorSection';
import {
  BLOG_OPPORTUNITIES,
  DEFAULT_SITE_PROFILES,
  HeroIntentDemo,
  INITIAL_QUEUE_ITEMS,
} from './data/seoPresets';
import {
  BacklinkQueueItem,
  BlogOpportunity,
  CommentGenerationRequest,
  GeneratedCommentVariant,
  PromotedSiteProfile,
  synthesizeMiniMaxComments,
} from './utils/seoEngine';

const INITIAL_REQUEST: CommentGenerationRequest = {
  articleUrl: BLOG_OPPORTUNITIES[0].url,
  articleTitle: BLOG_OPPORTUNITIES[0].title,
  articleContent: BLOG_OPPORTUNITIES[0].excerpt,
  targetUrl: DEFAULT_SITE_PROFILES[0].targetUrl, // https://soundtest.pro
  targetKeyword: DEFAULT_SITE_PROFILES[0].defaultKeyword,
  brandName: DEFAULT_SITE_PROFILES[0].brandName,
  authorPersona: 'SEO 增长架构师',
  authorName: 'Alex Chen',
  authorEmail: 'alex@soundtest.pro',
  objective: 'add_insight',
  placementMode: 'html_anchor',
  anchorType: 'branded',
  model: 'MiniMax-M2',
  language: DEFAULT_SITE_PROFILES[0].preferredLanguage,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSectionId>('workbench');
  const [siteProfiles, setSiteProfiles] = useState<PromotedSiteProfile[]>(
    DEFAULT_SITE_PROFILES
  );
  const [activeSiteId, setActiveSiteId] = useState<string>(
    DEFAULT_SITE_PROFILES[0].id
  );
  const [opportunities, setOpportunities] = useState<BlogOpportunity[]>(
    BLOG_OPPORTUNITIES
  );

  const [formState, setFormState] = useState<CommentGenerationRequest>(INITIAL_REQUEST);
  const [variants, setVariants] = useState<GeneratedCommentVariant[]>(() =>
    synthesizeMiniMaxComments(INITIAL_REQUEST)
  );
  const [queueItems, setQueueItems] = useState<BacklinkQueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [queuedVariantIds, setQueuedVariantIds] = useState<Set<string>>(new Set());
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const scrollToSection = (sectionId: NavSectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSiteProfile = (site: PromotedSiteProfile) => {
    setActiveSiteId(site.id);
    const updatedReq: CommentGenerationRequest = {
      ...formState,
      targetUrl: site.targetUrl,
      targetKeyword: site.defaultKeyword,
      brandName: site.brandName,
      authorEmail: `alex@${site.domain}`,
      language: site.preferredLanguage,
    };
    setFormState(updatedReq);
    setVariants(synthesizeMiniMaxComments(updatedReq));
    showToast(`已切换推广目标网站为 ${site.domain} (${site.targetUrl})`);
  };

  const handleAddCustomSite = (newSite: PromotedSiteProfile) => {
    setSiteProfiles((prev) => [...prev, newSite]);
    showToast(`已新增自定义推广站点 ${newSite.domain} 并同步至 Chrome 插件配置`);
  };

  const handleAddOpportunity = (newBlog: BlogOpportunity) => {
    setOpportunities((prev) => {
      const exists = prev.some((b) => b.url === newBlog.url);
      if (exists) return prev;
      return [newBlog, ...prev];
    });
    showToast(
      `已将关联博客 ${newBlog.domain} (相关度 ${newBlog.relevanceScore ?? 90}%) 加入高权重外链库`
    );
  };

  const handleApplyHeroDemo = (demo: HeroIntentDemo) => {
    const updatedReq: CommentGenerationRequest = {
      ...formState,
      objective: demo.id,
      placementMode: demo.id === 'share_experience' ? 'wordpress_field' : 'html_anchor',
    };
    setFormState(updatedReq);
    setVariants(synthesizeMiniMaxComments(updatedReq));
    scrollToSection('workbench');
    showToast(`已载入「${demo.label}」意图模板并同步刷新 MiniMax 评论方案`);
  };

  const handleSelectBlogForWorkbench = (blog: BlogOpportunity) => {
    const isChinese = /[\u4e00-\u9fa5]/.test(blog.title);
    const matchedSite = siteProfiles.find((s) => s.domain === blog.matchedSiteDomain);
    if (matchedSite) {
      setActiveSiteId(matchedSite.id);
    }
    const updatedReq: CommentGenerationRequest = {
      ...formState,
      articleUrl: blog.url,
      articleTitle: blog.title,
      articleContent: blog.excerpt,
      targetUrl: matchedSite ? matchedSite.targetUrl : formState.targetUrl,
      targetKeyword: matchedSite ? matchedSite.defaultKeyword : blog.suggestedKeyword,
      brandName: matchedSite ? matchedSite.brandName : formState.brandName,
      language: isChinese ? 'zh' : 'en',
    };
    setFormState(updatedReq);
    setVariants(synthesizeMiniMaxComments(updatedReq));
    scrollToSection('workbench');
    showToast(
      `已载入博客 ${blog.domain} (DR ${blog.domainRating}) 并对齐推广站 ${matchedSite ? matchedSite.domain : formState.targetUrl}`
    );
  };

  const handleAddToQueue = (
    variant: GeneratedCommentVariant,
    request: CommentGenerationRequest
  ) => {
    let domain = 'custom-blog.org';
    try {
      domain = new URL(request.articleUrl).hostname;
    } catch {
      domain = 'independent-blog.io';
    }

    const matchedBlog = opportunities.find((b) => b.url === request.articleUrl);

    const newItem: BacklinkQueueItem = {
      id: `q-${Date.now()}`,
      blogDomain: domain,
      blogTitle: request.articleTitle,
      blogUrl: request.articleUrl,
      cmsPlatform: matchedBlog?.cms || 'WordPress',
      domainRating: matchedBlog?.domainRating || 72,
      linkAttribute: variant.seoAttributes.recommendedRel,
      anchorType: variant.seoAttributes.anchorTypeUsed,
      anchorText: variant.seoAttributes.anchorTextRendered,
      targetUrl: request.targetUrl,
      commentExcerpt: variant.commentBody.slice(0, 110) + '...',
      fullPayload: variant.htmlPayload,
      spamScore: variant.metrics.spamRiskScore,
      status: 'queued',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modelUsed: request.model,
    };

    setQueueItems((prev) => [newItem, ...prev]);
    setQueuedVariantIds((prev) => {
      const next = new Set(prev);
      next.add(variant.id);
      return next;
    });
    showToast(`已将「${variant.strategyLabel}」加入外链自动化发布队列`);
  };

  const handlePushSimulatedCommentToQueue = (newItem: BacklinkQueueItem) => {
    setQueueItems((prev) => [newItem, ...prev]);
    showToast(`已通过 Chrome 插件模拟器发布 ${newItem.targetUrl} 外链评论并记入监控队列`);
  };

  const handleDispatchItem = async (id: string) => {
    try {
      const res = await fetch('/api/backlinks/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setQueueItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'published' } : item))
        );
        showToast('外链评论已通过端点预检并更新为「已发布待收录」状态');
      }
    } catch {
      setQueueItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'published' } : item))
      );
      showToast('外链评论状态已更新为「已发布待收录」');
    }
  };

  const handleDispatchAllQueued = async () => {
    const queued = queueItems.filter((i) => i.status === 'queued');
    for (const item of queued) {
      await handleDispatchItem(item.id);
    }
    showToast(`已完成 ${queued.length} 条待发布博客外链任务的批量投递检测`);
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
    showToast('已从外链队列移除该条记录');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-zinc-950">
      <TopNav
        activeSection={activeSection}
        queueCount={queueItems.length}
        onNavigate={scrollToSection}
      />

      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 border border-zinc-800 rounded-lg shadow-sm"
        >
          {statusBanner}
        </div>
      )}

      <main className="flex-1">
        <HeroSection
          onApplyHeroDemo={handleApplyHeroDemo}
          onOpenCompetitorReport={() => scrollToSection('analysis')}
        />

        <CommentWorkbench
          formState={formState}
          onChangeForm={setFormState}
          variants={variants}
          onUpdateVariants={setVariants}
          onAddToQueue={handleAddToQueue}
          queuedIds={queuedVariantIds}
          siteProfiles={siteProfiles}
          onSelectSiteProfile={handleSelectSiteProfile}
        />

        <ExtensionStudioSection
          siteProfiles={siteProfiles}
          activeSiteId={activeSiteId}
          onSelectSite={handleSelectSiteProfile}
          onAddCustomSite={handleAddCustomSite}
          onPushSimulatedCommentToQueue={handlePushSimulatedCommentToQueue}
        />

        <BlogDiscoverySection
          opportunities={opportunities}
          siteProfiles={siteProfiles}
          activeSiteId={activeSiteId}
          onSelectSite={handleSelectSiteProfile}
          onAddOpportunity={handleAddOpportunity}
          onSelectBlogForWorkbench={handleSelectBlogForWorkbench}
        />

        <BacklinkQueueSection
          queueItems={queueItems}
          onDispatchItem={handleDispatchItem}
          onDispatchAllQueued={handleDispatchAllQueued}
          onRemoveItem={handleRemoveQueueItem}
        />

        <CompetitorAnalysisSection
          onJumpToWorkbench={() => scrollToSection('workbench')}
        />

        <SeoConversionMonitorSection queueItems={queueItems} />
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 py-8 border-x border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="space-y-1">
            <p className="font-bold text-zinc-950">LinkPulse Commenter</p>
            <p>
              基于 MiniMax-M2 与 MiniMax-Text-01 构建的智能博客评论与白帽外链 SEO 增长平台 · 已预置 soundtest.pro / jmcy.cn / franvetted.com
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToSection('workbench')}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              评论与外链工作台
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('extension')}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              Chrome 插件中心
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('discovery')}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              高权重博客机会库
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('queue')}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              外链发布队列
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('analytics')}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              SEO 转化效果监控
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
