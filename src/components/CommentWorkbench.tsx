import React, { useState } from 'react';
import {
  AnchorType,
  BlogOpportunity,
  CommentGenerationRequest,
  CommentLanguage,
  CommentObjective,
  GeneratedCommentVariant,
  MiniMaxModelId,
  PlacementMode,
  PromotedSiteProfile,
  validateCommentForm,
} from '../utils/seoEngine';
import { BLOG_OPPORTUNITIES } from '../data/seoPresets';
import { Check, Copy, ExternalLink, Plus, RefreshCw, Search } from 'lucide-react';

interface CommentWorkbenchProps {
  formState: CommentGenerationRequest;
  onChangeForm: React.Dispatch<React.SetStateAction<CommentGenerationRequest>>;
  variants: GeneratedCommentVariant[];
  onUpdateVariants: React.Dispatch<React.SetStateAction<GeneratedCommentVariant[]>>;
  onAddToQueue: (variant: GeneratedCommentVariant, request: CommentGenerationRequest) => void;
  queuedIds: Set<string>;
  siteProfiles: PromotedSiteProfile[];
  onSelectSiteProfile: (site: PromotedSiteProfile) => void;
}

const OBJECTIVES: Array<{ id: CommentObjective; label: string; desc: string }> = [
  { id: 'add_insight', label: '01. 补充实测洞察', desc: '引用正文论据并补充二阶数据' },
  { id: 'case_study', label: '02. 实战案例印证', desc: '用真实项目复盘佐证作者观点' },
  { id: 'politely_disagree', label: '03. 温和思辨探讨', desc: '提出边界条件引发博主回复' },
  { id: 'share_experience', label: '04. 踩坑经验共鸣', desc: '同行视角分享实操心得' },
  { id: 'ask_question', label: '05. 进阶技术追问', desc: '高深度提问提升评论置顶率' },
  { id: 'compliment_expand', label: '06. 赞赏并延展框架', desc: '总结核心价值并延展应用场景' },
];

const PLACEMENT_MODES: Array<{ id: PlacementMode; label: string; sub: string }> = [
  { id: 'html_anchor', label: 'HTML 内联锚文本 (<a href>)', sub: '适用于允许评论区 HTML 的独立博客' },
  { id: 'wordpress_field', label: 'WordPress Website 字段落链', sub: '正文零链接，URL 填入作者网站栏（99% 过审）' },
  { id: 'markdown_link', label: 'Markdown 链接 ([锚文本](URL))', sub: '适用于 Ghost / Substack / 开发者技术社区' },
  { id: 'brand_citation', label: '无链接品牌词共现 (Co-Citation)', sub: '提升 Google 实体权重与 AI 搜索引擎引用率' },
];

const ANCHOR_TYPES: Array<{ id: AnchorType; label: string; ratioHint: string }> = [
  { id: 'branded', label: '品牌词 + 关键词锚文本', ratioHint: '推荐占比 40%' },
  { id: 'partial_match', label: '局部自然语境匹配', ratioHint: '推荐占比 30%' },
  { id: 'naked_url', label: '裸链接 URL', ratioHint: '推荐占比 15%' },
  { id: 'generic', label: '通用自然引导词', ratioHint: '推荐占比 10%' },
  { id: 'exact_match', label: '精准匹配核心词', ratioHint: '建议 ≤ 5%' },
];

export function CommentWorkbench({
  formState,
  onChangeForm,
  variants,
  onUpdateVariants,
  onAddToQueue,
  queuedIds,
  siteProfiles,
  onSelectSiteProfile,
}: CommentWorkbenchProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [activePayloadTab, setActivePayloadTab] = useState<
    'preview' | 'html' | 'wordpress' | 'markdown'
  >('preview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<string>('');
  const [lastModelUsed, setLastModelUsed] = useState<string>('MiniMax-M3.1-Flash');

  const handleLoadPresetBlog = (blog: BlogOpportunity) => {
    setFieldErrors({});
    setServerError(null);
    const isChinese = /[\u4e00-\u9fa5]/.test(blog.title);
    onChangeForm((prev) => ({
      ...prev,
      articleUrl: blog.url,
      articleTitle: blog.title,
      articleContent: blog.excerpt,
      targetKeyword: blog.suggestedKeyword,
      language: isChinese ? 'zh' : 'en',
    }));
  };

  const handleExtractUrl = async () => {
    if (!formState.articleUrl || !/^https?:\/\//i.test(formState.articleUrl.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        articleUrl: '请输入以 http:// 或 https:// 开头的目标博客 URL',
      }));
      return;
    }

    setIsExtracting(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const res = await fetch('/api/minimax/extract-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formState.articleUrl }),
      });
      const data = (await res.json()) as { error?: string; title?: string; excerpt?: string };
      if (!res.ok) {
        setServerError(data.error || 'URL 抓取失败');
      } else {
        onChangeForm((prev) => ({
          ...prev,
          articleTitle: data.title || '',
          articleContent: data.excerpt || '',
        }));
      }
    } catch {
      setServerError('解析博客 URL 失败，请直接粘贴文章标题与摘要');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateCommentForm({
      articleTitle: formState.articleTitle,
      articleContent: formState.articleContent,
      targetUrl: formState.targetUrl,
      targetKeyword: formState.targetKeyword,
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setIsGenerating(true);

    try {
      const response = await fetch('/api/minimax/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = (await response.json()) as { error?: string; fieldErrors?: Record<string, string>; variants?: GeneratedCommentVariant[]; model?: string };
      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setServerError(data.error || 'MiniMax 生成请求失败');
      } else if (Array.isArray(data.variants)) {
        onUpdateVariants(data.variants);
        setLastModelUsed(data.model || formState.model);
      }
    } catch {
      setServerError('网络请求异常，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleStartEdit = (variant: GeneratedCommentVariant) => {
    setEditingVariantId(variant.id);
    setEditDraft(variant.commentBody);
  };

  const handleSaveEdit = (variantId: string) => {
    onUpdateVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              commentBody: editDraft,
              htmlPayload: editDraft,
              wordpressFields: { ...v.wordpressFields, comment: editDraft },
            }
          : v
      )
    );
    setEditingVariantId(null);
  };

  return (
    <section id="workbench" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Section Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>01. 核心工作台</span>
              <span aria-hidden="true">·</span>
              <span>MiniMax API 实时语境推理</span>
              <span aria-hidden="true">·</span>
              <span>Human-in-the-Loop 审校</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight text-zinc-950">
              MiniMax 博客评论与 SEO 外链生成工作台
            </h2>
          </div>

          {/* Preset Quick-Load Bar */}
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-500 block">一键载入高 DR 真实博文样本：</span>
            <div className="flex flex-wrap items-center gap-2">
              {BLOG_OPPORTUNITIES.slice(0, 4).map((blog) => (
                <button
                  key={blog.id}
                  type="button"
                  onClick={() => handleLoadPresetBlog(blog)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    formState.articleUrl === blog.url
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {blog.domain} (DR {blog.domainRating})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main 12-Column Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column (5 cols): Blog Input + MiniMax & Backlink Config Form */}
          <form
            onSubmit={handleGenerate}
            noValidate
            className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-zinc-200 space-y-6 bg-zinc-50/40"
          >
            {/* Step 1: Target Blog Post Context */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-950">
                  第一步：目标博客文章语境输入
                </h3>
                <span className="text-xs text-zinc-500">支持 URL 解析或手动粘贴</span>
              </div>

              <div>
                <label htmlFor="article-url-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  目标博客文章 URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="article-url-input"
                    type="url"
                    value={formState.articleUrl}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, articleUrl: e.target.value }))
                    }
                    placeholder="https://backlinko-insights.dev/post-slug"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={handleExtractUrl}
                    disabled={isExtracting}
                    className="px-3 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isExtracting ? '解析中...' : '智能抓取正文'}</span>
                  </button>
                </div>
                {fieldErrors.articleUrl && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.articleUrl}</p>
                )}
              </div>

              <div>
                <label htmlFor="article-title-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  目标博文标题 <span className="text-red-600">*</span>
                </label>
                <input
                  id="article-title-input"
                  type="text"
                  value={formState.articleTitle}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, articleTitle: e.target.value }))
                  }
                  placeholder="输入博客文章标题..."
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                />
                {fieldErrors.articleTitle && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.articleTitle}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="article-content-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  博文核心段落 / 摘要内容 <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="article-content-input"
                  rows={3}
                  value={formState.articleContent}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, articleContent: e.target.value }))
                  }
                  placeholder="粘贴博文核心论点段落，MiniMax 将自动提取关键术语并生成强相关评论..."
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 leading-relaxed"
                />
                {fieldErrors.articleContent && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.articleContent}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-zinc-200" />

            {/* Step 2: Backlink & Anchor Text Strategy */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-950">
                    第二步：外链目标 URL 与锚文本 SEO 策略
                  </h3>
                  <span className="text-xs text-zinc-500">支持一键切换预设或输入自定义链接</span>
                </div>

                {/* Quick-Switch Bar for soundtest.pro / jmcy.cn / franvetted.com */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-zinc-500 mr-1">快捷推广站点：</span>
                  {siteProfiles.map((site) => {
                    const isCurrent = formState.targetUrl === site.targetUrl;
                    return (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => onSelectSiteProfile(site)}
                        className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {site.domain}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="target-url-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    推广外链目标 URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="target-url-input"
                    type="url"
                    value={formState.targetUrl}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, targetUrl: e.target.value }))
                    }
                    placeholder="https://yourbrand.io/seo-guide"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 font-mono"
                  />
                  {fieldErrors.targetUrl && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {fieldErrors.targetUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="target-keyword-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    目标核心关键词 / 锚文本词根 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="target-keyword-input"
                    type="text"
                    value={formState.targetKeyword}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, targetKeyword: e.target.value }))
                    }
                    placeholder="例如：contextual backlink audit"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                  {fieldErrors.targetKeyword && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {fieldErrors.targetKeyword}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="brand-name-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    品牌名称 (Brand)
                  </label>
                  <input
                    id="brand-name-input"
                    type="text"
                    value={formState.brandName}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, brandName: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label htmlFor="author-name-input" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    评论者署名 (Author)
                  </label>
                  <input
                    id="author-name-input"
                    type="text"
                    value={formState.authorName}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, authorName: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label htmlFor="language-select" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    评论输出语言
                  </label>
                  <select
                    id="language-select"
                    value={formState.language}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        language: e.target.value as CommentLanguage,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  >
                    <option value="zh">简体中文 (Chinese)</option>
                    <option value="en">English (英文博客推荐)</option>
                    <option value="es">Español (西班牙语)</option>
                    <option value="de">Deutsch (德语)</option>
                    <option value="ja">日本語 (日语)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="placement-mode-select" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    外链植入方式 (Link Placement)
                  </label>
                  <select
                    id="placement-mode-select"
                    value={formState.placementMode}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        placementMode: e.target.value as PlacementMode,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  >
                    {PLACEMENT_MODES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="anchor-type-select" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    锚文本类型 (Penguin 风控)
                  </label>
                  <select
                    id="anchor-type-select"
                    value={formState.anchorType}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        anchorType: e.target.value as AnchorType,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  >
                    {ANCHOR_TYPES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} ({a.ratioHint})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-zinc-200" />

            {/* Step 3: MiniMax Model & Comment Objective */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="minimax-model-select" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    MiniMax 大模型底座选择
                  </label>
                  <select
                    id="minimax-model-select"
                    value={formState.model}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        model: e.target.value as MiniMaxModelId,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 font-mono"
                  >
                    <option value="MiniMax-M2">MiniMax-M2 (深度推理与锚点编织)</option>
                    <option value="MiniMax-Text-01">MiniMax-Text-01 (1M 超长博文上下文)</option>
                    <option value="MiniMax-M2.5">MiniMax-M2.5 (极速批量外链生成)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="objective-select" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    评论互动意图 (Objective)
                  </label>
                  <select
                    id="objective-select"
                    value={formState.objective}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        objective: e.target.value as CommentObjective,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  >
                    {OBJECTIVES.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.label} — {obj.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {serverError && (
                <div role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>
                  {isGenerating
                    ? `正在通过 ${formState.model} 推理博文语境并编织外链...`
                    : `使用 ${formState.model} 生成评论方案`}
                </span>
              </button>
            </div>
          </form>

          {/* Right Column (7 cols): Generated Comment Variants & Multi-Format Export */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Top Output Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>生成引擎：{lastModelUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{variants.length} 套差异化外链方案</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">
                    专家级博客评论与外链载荷 (支持二次审校与入队)
                  </h3>
                </div>

                {/* Interactive Segmented Format Switcher */}
                <div
                  role="tablist"
                  aria-label="输出格式切换"
                  className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
                >
                  {(
                    [
                      { id: 'preview', label: '可读预览' },
                      { id: 'html', label: 'HTML 源码' },
                      { id: 'wordpress', label: 'WP 四字段' },
                      { id: 'markdown', label: 'Markdown' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activePayloadTab === tab.id}
                      type="button"
                      onClick={() => setActivePayloadTab(tab.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activePayloadTab === tab.id
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variants List */}
              <div className="space-y-4">
                {variants.map((variant, index) => {
                  const isQueued = queuedIds.has(variant.id);
                  const isEditing = editingVariantId === variant.id;

                  const displayPayload =
                    activePayloadTab === 'html'
                      ? variant.htmlPayload
                      : activePayloadTab === 'markdown'
                      ? variant.markdownPayload
                      : activePayloadTab === 'wordpress'
                      ? `Author: ${variant.wordpressFields.author}\nEmail: ${variant.wordpressFields.email}\nWebsite (Backlink URL): ${variant.wordpressFields.url}\nComment Body:\n${variant.wordpressFields.comment}`
                      : variant.commentBody;

                  return (
                    <article
                      key={variant.id}
                      className="border border-zinc-200 rounded-xl p-5 bg-white hover:border-zinc-300 transition-colors space-y-4"
                    >
                      {/* Variant Header & Unboxed Metadata */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-zinc-950">
                            0{index + 1}. {variant.strategyLabel}
                          </h4>
                          <p className="text-xs text-zinc-500">{variant.angleSummary}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-zinc-600">
                          <span
                            className={
                              variant.metrics.spamRiskScore <= 15
                                ? 'text-emerald-700 font-semibold'
                                : 'text-amber-700 font-semibold'
                            }
                          >
                            垃圾风险 {variant.metrics.spamRiskScore}/100
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>语境相关 {variant.metrics.contextualRelevance}%</span>
                          <span aria-hidden="true">·</span>
                          <span>预估过审 {variant.metrics.estimatedApprovalRate}%</span>
                        </div>
                      </div>

                      {/* Main Comment Body or Editor */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <label htmlFor={`edit-${variant.id}`} className="sr-only">
                            编辑评论内容
                          </label>
                          <textarea
                            id={`edit-${variant.id}`}
                            rows={4}
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            className="w-full p-3 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingVariantId(null)}
                              className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(variant.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 rounded-md cursor-pointer"
                            >
                              保存人工微调
                            </button>
                          </div>
                        </div>
                      ) : activePayloadTab === 'preview' ? (
                        <div className="p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-lg space-y-2">
                          <p className="text-sm text-zinc-800 leading-relaxed">
                            {variant.commentBody}
                          </p>
                          <div className="pt-2 border-t border-zinc-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                            <span>
                              植入锚文本：
                              <strong className="text-zinc-900 ml-1">
                                {variant.seoAttributes.anchorTextRendered}
                              </strong>
                            </span>
                            <span className="font-mono">
                              推荐属性: rel=&quot;{variant.seoAttributes.recommendedRel}&quot; · 词数:{' '}
                              {variant.metrics.wordCount}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <pre className="p-4 bg-zinc-950 text-zinc-100 text-xs font-mono rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {displayPayload}
                        </pre>
                      )}

                      {/* Variant Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyText(variant.id, displayPayload)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                          >
                            {copiedId === variant.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>已复制载荷</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>复制当前格式</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(variant)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            人工微调文案
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={formState.articleUrl || '#workbench'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <span>直达原博文</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onAddToQueue(variant, formState)}
                            disabled={isQueued}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                              isQueued
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-zinc-950 text-white hover:bg-zinc-800'
                            }`}
                          >
                            {isQueued ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>已加入外链发布队列</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>加入外链发布队列</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Bottom SEO Guardrail Notice */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-600">
              <div>
                <strong className="text-zinc-900">白帽外链发布建议：</strong>
                同一目标 URL 在单日内建议混用「品牌锚文本」与「WordPress Website 字段落链」，避免触发 Akismet 域名黑名单。
              </div>
              <span className="font-mono tabular-nums text-zinc-500 shrink-0">
                MiniMax-M3.1-Flash 语义防重已启用
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
