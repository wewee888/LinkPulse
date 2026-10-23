import React, { useMemo, useState } from 'react';
import {
  BacklinkQueueItem,
  CommentObjective,
  MINIMAX_MODEL_OPTIONS,
  MiniMaxModelId,
  PlacementMode,
  PromotedSiteProfile,
  generateChromeExtensionFiles,
  synthesizeMiniMaxComments,
} from '../utils/seoEngine';
import { Bookmark, Check, Copy, Download, ExternalLink, Plus, Puzzle, Sparkles, X, Zap } from 'lucide-react';
import { buildExtensionZipBlob, downloadBlob, generateBookmarkletCode, generateUserscriptCode } from '../utils/extensionPacker';

interface ExtensionStudioSectionProps {
  siteProfiles: PromotedSiteProfile[];
  activeSiteId: string;
  onSelectSite: (site: PromotedSiteProfile) => void;
  onAddCustomSite: (site: PromotedSiteProfile) => void;
  onPushSimulatedCommentToQueue: (item: BacklinkQueueItem) => void;
  showInstallModal?: boolean;
  onToggleInstallModal?: (open: boolean) => void;
}

export function ExtensionStudioSection({
  siteProfiles,
  activeSiteId,
  onSelectSite,
  onAddCustomSite,
  onPushSimulatedCommentToQueue,
  showInstallModal: propShowModal,
  onToggleInstallModal: propToggleModal,
}: ExtensionStudioSectionProps) {
  const activeSite =
    siteProfiles.find((s) => s.id === activeSiteId) || siteProfiles[0];

  const [extModel, setExtModel] = useState<MiniMaxModelId>('MiniMax-M3.1-Flash');
  const [extPlacement, setExtPlacement] = useState<PlacementMode>('html_anchor');
  const [activeCodeTab, setActiveCodeTab] = useState<
    'manifest.json' | 'content.js' | 'popup.html' | 'background.js'
  >('content.js');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [internalShowModal, setInternalShowModal] = useState(false);
  const showInstallModal = propShowModal !== undefined ? propShowModal : internalShowModal;
  const setShowInstallModal = propToggleModal || setInternalShowModal;
  const [installMethod, setInstallMethod] = useState<'userscript' | 'bookmarklet' | 'zip'>('userscript');
  const [isPackagingZip, setIsPackagingZip] = useState(false);
  const [copiedExtensionsUrl, setCopiedExtensionsUrl] = useState(false);

  // Add Custom Site Form State
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteBrand, setNewSiteBrand] = useState('');
  const [newSiteKeyword, setNewSiteKeyword] = useState('');
  const [addSiteError, setAddSiteError] = useState<string | null>(null);

  // Simulated Blog Comment Form State (In-Page Extension Demo)
  const [simObjective, setSimObjective] = useState<CommentObjective>('add_insight');
  const [simAuthor, setSimAuthor] = useState('Alex Chen');
  const [simEmail, setSimEmail] = useState(`alex@${activeSite.domain}`);
  const [simWebsiteUrl, setSimWebsiteUrl] = useState(activeSite.targetUrl);
  const [simCommentBody, setSimCommentBody] = useState(() => {
    const initialVariants = synthesizeMiniMaxComments({
      articleUrl: 'https://backlinko-insights.dev/contextual-co-citations-2026',
      articleTitle: 'Why Contextual Co-Citations Outperform Traditional Guest Posts in 2026',
      articleContent:
        'Search engines evaluate the semantic neighborhood surrounding an outbound link or brand mention. Interactive tools and empirical benchmarks earn 3x higher crawl priority.',
      targetUrl: activeSite.targetUrl,
      targetKeyword: activeSite.defaultKeyword,
      brandName: activeSite.brandName,
      authorPersona: 'Growth Lead',
      authorName: 'Alex Chen',
      authorEmail: `alex@${activeSite.domain}`,
      objective: 'add_insight',
      placementMode: 'html_anchor',
      anchorType: 'branded',
      model: 'MiniMax-M3.1-Flash',
      language: activeSite.preferredLanguage,
    });
    return initialVariants[0].htmlPayload;
  });
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [simSubmitted, setSimSubmitted] = useState(false);

  const applySiteToSimulator = (
    site: PromotedSiteProfile,
    objective: CommentObjective = simObjective,
    placement: PlacementMode = extPlacement
  ) => {
    setIsAutoFilling(true);
    setSimSubmitted(false);
    const generated = synthesizeMiniMaxComments({
      articleUrl: 'https://backlinko-insights.dev/contextual-co-citations-2026',
      articleTitle: 'Why Contextual Co-Citations Outperform Traditional Guest Posts in 2026',
      articleContent:
        'Search engines evaluate the semantic neighborhood surrounding an outbound link or brand mention. Interactive tools and empirical benchmarks earn 3x higher crawl priority.',
      targetUrl: site.targetUrl,
      targetKeyword: site.defaultKeyword,
      brandName: site.brandName,
      authorPersona: 'Growth Lead',
      authorName: simAuthor,
      authorEmail: `alex@${site.domain}`,
      objective,
      placementMode: placement,
      anchorType: 'branded',
      model: extModel,
      language: site.preferredLanguage,
    });

    setSimWebsiteUrl(site.targetUrl);
    setSimEmail(`alex@${site.domain}`);
    setSimCommentBody(
      placement === 'wordpress_field'
        ? generated[0].commentBody
        : generated[0].htmlPayload
    );
    setTimeout(() => setIsAutoFilling(false), 180);
  };

  const handleSwitchSite = (site: PromotedSiteProfile) => {
    onSelectSite(site);
    applySiteToSimulator(site, simObjective, extPlacement);
  };

  const handleTriggerExtensionIntent = (
    objective: CommentObjective,
    overridePlacement?: PlacementMode
  ) => {
    const nextPlacement = overridePlacement || extPlacement;
    if (overridePlacement) setExtPlacement(overridePlacement);
    setSimObjective(objective);
    applySiteToSimulator(activeSite, objective, nextPlacement);
  };

  const handleAddSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSiteError(null);

    const rawInput = newSiteUrl.trim();
    if (!rawInput) {
      setAddSiteError('请输入要推广的网站域名或完整链接（如 https://example.com）');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawInput)
      ? rawInput
      : `https://${rawInput}`;

    let parsedDomain = '';
    try {
      parsedDomain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
    } catch {
      setAddSiteError('域名或 URL 格式不正确，请检查');
      return;
    }

    if (!parsedDomain.includes('.')) {
      setAddSiteError('请输入包含有效顶级域名的网址（如 soundtest.pro）');
      return;
    }

    const brand =
      newSiteBrand.trim() ||
      parsedDomain.split('.')[0].charAt(0).toUpperCase() +
        parsedDomain.split('.')[0].slice(1);
    const keyword =
      newSiteKeyword.trim() || `${brand} official platform & benchmark`;
    const isZh = /[\u4e00-\u9fa5]/.test(keyword) || parsedDomain.endsWith('.cn');

    const newProfile: PromotedSiteProfile = {
      id: `site-${Date.now()}`,
      domain: parsedDomain,
      targetUrl: normalizedUrl,
      brandName: brand,
      defaultKeyword: keyword,
      nicheDesc: '自定义添加推广站点',
      preferredLanguage: isZh ? 'zh' : 'en',
    };

    onAddCustomSite(newProfile);
    handleSwitchSite(newProfile);
    setNewSiteUrl('');
    setNewSiteBrand('');
    setNewSiteKeyword('');
  };

  const handleSimulatedBlogSubmit = () => {
    const newItem: BacklinkQueueItem = {
      id: `ext-${Date.now()}`,
      blogDomain: 'backlinko-insights.dev',
      blogTitle: 'Why Contextual Co-Citations Outperform Traditional Guest Posts in 2026',
      blogUrl: 'https://backlinko-insights.dev/contextual-co-citations-2026',
      cmsPlatform: 'WordPress',
      domainRating: 84,
      linkAttribute: 'dofollow',
      anchorType: 'branded',
      anchorText: `${activeSite.brandName} (${activeSite.defaultKeyword})`,
      targetUrl: activeSite.targetUrl,
      commentExcerpt: simCommentBody.replace(/<[^>]+>/g, '').slice(0, 110) + '...',
      fullPayload: simCommentBody,
      spamScore: extPlacement === 'wordpress_field' ? 2 : 4,
      status: 'published',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modelUsed: extModel,
    };
    onPushSimulatedCommentToQueue(newItem);
    setSimSubmitted(true);
  };

  const extensionBundle = useMemo(
    () =>
      generateChromeExtensionFiles({
        serverUrl:
          typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:3000',
        defaultTargetUrl: activeSite.targetUrl,
        defaultKeyword: activeSite.defaultKeyword,
        defaultBrandName: activeSite.brandName,
        defaultAuthorName: simAuthor,
        defaultAuthorEmail: simEmail,
        defaultModel: extModel,
        defaultPlacementMode: extPlacement,
        siteProfiles,
      }),
    [activeSite, simAuthor, simEmail, extModel, extPlacement, siteProfiles]
  );

  const userscriptCode = useMemo(
    () =>
      generateUserscriptCode({
        serverUrl:
          typeof window !== 'undefined'
            ? window.location.origin
            : 'https://linkpulse-3uk.pages.dev',
        defaultTargetUrl: activeSite.targetUrl,
        defaultKeyword: activeSite.defaultKeyword,
        defaultBrandName: activeSite.brandName,
        defaultAuthorName: simAuthor,
        defaultAuthorEmail: simEmail,
        defaultModel: extModel,
        defaultPlacementMode: extPlacement,
        siteProfiles,
      }),
    [activeSite, simAuthor, simEmail, extModel, extPlacement, siteProfiles]
  );

  const bookmarkletCode = useMemo(
    () =>
      generateBookmarkletCode({
        serverUrl:
          typeof window !== 'undefined'
            ? window.location.origin
            : 'https://linkpulse-3uk.pages.dev',
        defaultTargetUrl: activeSite.targetUrl,
        defaultKeyword: activeSite.defaultKeyword,
        defaultBrandName: activeSite.brandName,
        defaultAuthorName: simAuthor,
        defaultAuthorEmail: simEmail,
        defaultModel: extModel,
        defaultPlacementMode: extPlacement,
        siteProfiles,
      }),
    [activeSite, simAuthor, simEmail, extModel, extPlacement, siteProfiles]
  );

  const allCodeFiles = useMemo<Record<string, string>>(() => {
    return {
      'content.js': extensionBundle['content.js'],
      'manifest.json': extensionBundle['manifest.json'],
      'linkpulse.user.js': userscriptCode,
      'bookmarklet.js': bookmarkletCode,
      'popup.html': extensionBundle['popup.html'],
      'background.js': extensionBundle['background.js'],
    };
  }, [extensionBundle, userscriptCode, bookmarkletCode]);

  const handleDownloadZip = async () => {
    setIsPackagingZip(true);
    try {
      const serverUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://linkpulse-3uk.pages.dev';
      const blob = await buildExtensionZipBlob(extensionBundle, serverUrl);
      downloadBlob(blob, 'linkpulse-chrome-extension-v1.3.zip');
    } catch (err) {
      console.error('[Zip Build Error]', err);
    } finally {
      setIsPackagingZip(false);
    }
  };

  const handleCopyExtensionsUrl = () => {
    navigator.clipboard?.writeText('chrome://extensions');
    setCopiedExtensionsUrl(true);
    setTimeout(() => setCopiedExtensionsUrl(false), 2000);
  };

  const handleDownloadSingleFile = (
    filename: keyof typeof extensionBundle,
    content: string
  ) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllExtensionFiles = () => {
    (Object.keys(extensionBundle) as Array<keyof typeof extensionBundle>).forEach(
      (filename, idx) => {
        setTimeout(() => {
          handleDownloadSingleFile(filename, extensionBundle[filename]);
        }, idx * 150);
      }
    );
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 1800);
  };

  return (
    <section id="extension" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Section Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>02. Chrome 浏览器插件形态 (Manifest V3)</span>
              <span aria-hidden="true">·</span>
              <span>支持多站点一键切换 (soundtest.pro / jmcy.cn / franvetted.com)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              Chrome 插件实境注入模拟器与源码打包中心
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              采用无侵入浏览器插件与油猴脚本架构：自动识别任意博客（WordPress / Ghost / Substack）评论框，注入 MiniMax 意图栏，一键切换你的推广站点并自动填入评论与外链字段。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInstallModal(true)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>⚡ 一键安装到浏览器 (油猴/脚本猫/书签)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isPackagingZip}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-zinc-600" />
              <span>{isPackagingZip ? '正在打包 ZIP...' : '下载离线扩展包 (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Instant 1-Click Installation Fast-Track Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-zinc-50 border-b border-zinc-200">
          <div className="max-w-5xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                  1-Click Direct Install
                </span>
                <h3 className="text-base font-bold text-zinc-950">
                  浏览器一键安装极速通道（3 种方式任选，立即启用）
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>查看详细图文教程</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Method 1: Userscript 1-Click Direct */}
              <div className="p-4 bg-white border-2 border-emerald-500/50 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      方案一：油猴 / 脚本猫一键直装
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      最推荐
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    无需解压或手动配环境。已装 Tampermonkey / 脚本猫直接点击下方按钮，浏览器秒级弹出原生安装面板。
                  </p>
                </div>

                <a
                  href="/linkpulse.user.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs text-center flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>立即一键装入浏览器</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Method 2: Drag-and-drop Bookmarklet */}
              <div className="p-4 bg-white border border-zinc-300 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500" />
                      方案二：免安装书签栏
                    </span>
                    <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                      0 依赖
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    无需安装任何扩展插件。按住下方胶囊拖至浏览器顶部书签栏，打开任意博客点一下即可唤起。
                  </p>
                </div>

                <a
                  href={bookmarkletCode}
                  draggable
                  onClick={(e) => {
                    e.preventDefault();
                    alert('请按住此按钮，直接拖动到浏览器顶部的书签栏中即可完成安装！');
                  }}
                  className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg text-xs text-center flex items-center justify-center gap-1.5 shadow-xs cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>按住拖我到书签栏</span>
                </a>
              </div>

              {/* Method 3: Download Offline ZIP */}
              <div className="p-4 bg-white border border-zinc-300 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-600" />
                      方案三：离线扩展包 (.ZIP)
                    </span>
                    <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                      离线加载
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    标准 Chrome Manifest V3 离线包。一键打包下载完整 ZIP 压缩文件，解压后载入开发者模式。
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isPackagingZip}
                  className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold border border-zinc-300 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isPackagingZip ? '正在打包...' : '一键下载扩展 ZIP 包'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Site Profile Switcher & Custom Domain Adder */}
        <div className="p-6 md:p-8 border-b border-zinc-200 bg-zinc-50/50 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-zinc-950">
                当前推广站点矩阵（点击任意域名立即切换插件与生成台外链目标）
              </h3>
              <p className="text-xs text-zinc-500">
                已预置 <code className="font-mono text-zinc-800">soundtest.pro</code>、<code className="font-mono text-zinc-800">jmcy.cn</code>、<code className="font-mono text-zinc-800">franvetted.com</code>，支持随时新增自定义网站链接
              </p>
            </div>

            <span className="text-xs font-mono tabular-nums text-zinc-600">
              当前激活站点：<strong className="text-zinc-950">{activeSite.targetUrl}</strong>
            </span>
          </div>

          {/* Site Cards Grid */}
          <div
            role="group"
            aria-label="选择要推广的目标网站"
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {siteProfiles.map((site) => {
              const isSelected = site.id === activeSite.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleSwitchSite(site)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm truncate">
                      {site.domain}
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        isSelected ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {isSelected ? '已激活' : '点击切换'}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-600'
                    }`}
                  >
                    关键词：{site.defaultKeyword}
                  </p>
                  <p
                    className={`text-xs font-mono truncate ${
                      isSelected ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    {site.targetUrl}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Add Custom Website Form */}
          <form
            onSubmit={handleAddSiteSubmit}
            className="pt-3 border-t border-zinc-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-4">
              <label htmlFor="custom-site-url" className="block text-xs font-medium text-zinc-700 mb-1">
                新增自定义推广网站域名或 URL
              </label>
              <input
                id="custom-site-url"
                type="text"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                placeholder="例如：https://soundtest.pro/mic-test"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="custom-site-brand" className="block text-xs font-medium text-zinc-700 mb-1">
                品牌名称 (可选)
              </label>
              <input
                id="custom-site-brand"
                type="text"
                value={newSiteBrand}
                onChange={(e) => setNewSiteBrand(e.target.value)}
                placeholder="例如：SoundTest Pro"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="custom-site-keyword" className="block text-xs font-medium text-zinc-700 mb-1">
                默认 SEO 锚文本关键词
              </label>
              <input
                id="custom-site-keyword"
                type="text"
                value={newSiteKeyword}
                onChange={(e) => setNewSiteKeyword(e.target.value)}
                placeholder="例如：audio latency test"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加推广站点</span>
              </button>
            </div>
          </form>

          {addSiteError && (
            <p role="alert" className="text-xs text-red-600">
              {addSiteError}
            </p>
          )}
        </div>

        {/* 2-Column Main Split: Left = In-Page Blog Extension Simulator, Right = Manifest V3 Code Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column (6 cols): Live In-Page Blog Comment Overlay Simulator */}
          <div className="lg:col-span-6 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-zinc-200 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>插件实境注入预览（模拟你在浏览任意第三方 WordPress 独立博客）</span>
                <span className="font-mono text-emerald-700 font-medium">Content Script 已挂载</span>
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                体验插件在第三方博客评论框上方自动浮现并一键填表
              </h3>
            </div>

            {/* Simulated Browser Window of Target Blog */}
            <div className="border border-zinc-300 rounded-xl overflow-hidden bg-white">
              {/* Browser Address Bar */}
              <div className="px-4 py-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between gap-2 text-xs font-mono text-zinc-600">
                <span className="truncate">
                  https://backlinko-insights.dev/contextual-co-citations-2026#respond
                </span>
                <span className="text-zinc-900 font-semibold shrink-0 flex items-center gap-1">
                  <Puzzle className="w-3.5 h-3.5" />
                  <span>LinkPulse Extension v1.3</span>
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Simulated Blog Excerpt */}
                <div className="pb-3 border-b border-zinc-200 space-y-1">
                  <p className="text-xs font-semibold text-zinc-900">
                    Leave a Reply on &ldquo;Why Contextual Co-Citations Outperform Guest Posts&rdquo;
                  </p>
                  <p className="text-xs text-zinc-500">
                    Your email address will not be published. Required fields are marked *
                  </p>
                </div>

                {/* INJECTED LINKPULSE EXTENSION TOOLBAR (Exactly what content.js injects!) */}
                <div className="p-3.5 bg-zinc-950 text-white rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>LinkPulse · MiniMax 插件悬浮栏</span>
                    </div>

                    <select
                      aria-label="插件内切换当前推广网站"
                      value={activeSite.id}
                      onChange={(e) => {
                        const found = siteProfiles.find((s) => s.id === e.target.value);
                        if (found) handleSwitchSite(found);
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md focus:outline-none"
                    >
                      {siteProfiles.map((s) => (
                        <option key={s.id} value={s.id}>
                          推广: {s.domain} ({s.defaultKeyword.slice(0, 18)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Intent Buttons inside Extension Bar */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        {
                          id: 'add_insight',
                          label: '补充实测洞察 (HTML 锚点)',
                          mode: 'html_anchor',
                        },
                        {
                          id: 'case_study',
                          label: '实战案例印证 (HTML 锚点)',
                          mode: 'html_anchor',
                        },
                        {
                          id: 'politely_disagree',
                          label: '温和思辨提问',
                          mode: 'html_anchor',
                        },
                        {
                          id: 'share_experience',
                          label: 'WP 网站栏落链 (正文零链接)',
                          mode: 'wordpress_field',
                        },
                      ] as const
                    ).map((btn) => {
                      const isActive =
                        simObjective === btn.id && extPlacement === btn.mode;
                      return (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() =>
                            handleTriggerExtensionIntent(btn.id, btn.mode)
                          }
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500 text-zinc-950 font-semibold'
                              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                    <span>自动填入 URL: {activeSite.targetUrl}</span>
                    <span>
                      {isAutoFilling ? '正在填入表单...' : 'Akismet 绿灯通过'}
                    </span>
                  </div>
                </div>

                {/* Simulated WordPress Comment Form Fields Auto-Filled by Extension */}
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="sim-wp-comment"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Comment (评论正文 — 插件已自动织入 {activeSite.domain} 语境) *
                    </label>
                    <textarea
                      id="sim-wp-comment"
                      rows={4}
                      value={simCommentBody}
                      onChange={(e) => setSimCommentBody(e.target.value)}
                      className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-mono leading-relaxed focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label
                        htmlFor="sim-wp-author"
                        className="block text-xs font-medium text-zinc-700 mb-1"
                      >
                        Name *
                      </label>
                      <input
                        id="sim-wp-author"
                        type="text"
                        value={simAuthor}
                        onChange={(e) => setSimAuthor(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sim-wp-email"
                        className="block text-xs font-medium text-zinc-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        id="sim-wp-email"
                        type="email"
                        value={simEmail}
                        onChange={(e) => setSimEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sim-wp-url"
                        className="block text-xs font-medium text-emerald-800 mb-1"
                      >
                        Website (外链 URL 字段)
                      </label>
                      <input
                        id="sim-wp-url"
                        type="url"
                        value={simWebsiteUrl}
                        onChange={(e) => setSimWebsiteUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-emerald-50/70 border border-emerald-300 rounded-lg font-mono font-semibold text-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-zinc-500">
                      Human-in-the-loop：确认无误后点击右侧按钮提交
                    </span>

                    <button
                      type="button"
                      onClick={handleSimulatedBlogSubmit}
                      className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      {simSubmitted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>已发布并记入 {activeSite.domain} 外链队列</span>
                        </>
                      ) : (
                        <span>Post Comment (发布并同步至外链队列)</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (6 cols): Chrome Manifest V3 Code Inspector & Installation Guide */}
          <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-zinc-500">
                    已内置 {siteProfiles.map((s) => s.domain).join(' / ')} 站点配置
                  </span>
                  <h3 className="text-base font-bold text-zinc-950">
                    Chrome 扩展程序源码 (Manifest V3 标准结构)
                  </h3>
                </div>

                {/* File Tabs */}
                <div
                  role="tablist"
                  aria-label="Chrome 插件源码文件切换"
                  className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
                >
                  {(
                    [
                      'content.js',
                      'manifest.json',
                      'popup.html',
                      'background.js',
                    ] as const
                  ).map((file) => (
                    <button
                      key={file}
                      role="tab"
                      aria-selected={activeCodeTab === file}
                      type="button"
                      onClick={() => setActiveCodeTab(file)}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeCodeTab === file
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="relative">
                <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[290px] leading-relaxed">
                  {allCodeFiles[activeCodeTab] || ''}
                </pre>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(activeCodeTab, allCodeFiles[activeCodeTab] || '')
                      }
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedFile === activeCodeTab ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>已复制 {activeCodeTab}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制 {activeCodeTab} 源码</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadSingleFile(
                          activeCodeTab,
                          extensionBundle[activeCodeTab]
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>单独下载 {activeCodeTab}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="ext-model-picker" className="text-xs text-zinc-500">
                      插件默认模型:
                    </label>
                    <select
                      id="ext-model-picker"
                      value={extModel}
                      onChange={(e) => setExtModel(e.target.value as MiniMaxModelId)}
                      className="px-2.5 py-1 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-md"
                    >
                      {MINIMAX_MODEL_OPTIONS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.badge})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Step Chrome Extension Installation Instructions */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-950">
                三步在 Chrome / Edge 浏览器安装此插件：
              </h4>
              <ol className="text-xs text-zinc-600 space-y-1.5 leading-relaxed">
                <li>
                  <strong>01. 导出文件：</strong>点击右上角「一键下载 Chrome 插件包」，将下载的 <code className="font-mono text-zinc-900">manifest.json</code>、<code className="font-mono text-zinc-900">content.js</code>、<code className="font-mono text-zinc-900">background.js</code>、<code className="font-mono text-zinc-900">popup.html</code> 放入同一个新建文件夹。
                </li>
                <li>
                  <strong>02. 加载扩展：</strong>在浏览器地址栏输入 <code className="font-mono text-zinc-900">chrome://extensions</code>，开启右上角「开发者模式 (Developer mode)」，点击左上角「加载已解压的扩展程序 (Load unpacked)」选择该文件夹。
                </li>
                <li>
                  <strong>03. 实境使用：</strong>打开任意 WordPress / Ghost / Substack 博客文章底部评论区，插件会自动浮现并允许一键切换 <code className="font-mono text-zinc-900">soundtest.pro</code>、<code className="font-mono text-zinc-900">jmcy.cn</code>、<code className="font-mono text-zinc-900">franvetted.com</code> 自动填入高过审外链评论。
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 1-Click Browser Install Modal */}
      {showInstallModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Zap className="w-5 h-5 fill-emerald-500 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">一键安装 LinkPulse 浏览器插件</h3>
                  <p className="text-xs text-zinc-500">支持 Chrome、Edge、Brave、Firefox 等所有主流浏览器</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-200/70 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Install Method Tabs */}
            <div className="p-3 bg-zinc-100/70 border-b border-zinc-200 grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setInstallMethod('userscript')}
                className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                  installMethod === 'userscript'
                    ? 'bg-white text-zinc-950 shadow-xs font-bold border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                🚀 油猴/脚本猫 (一键直装)
              </button>
              <button
                type="button"
                onClick={() => setInstallMethod('bookmarklet')}
                className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                  installMethod === 'bookmarklet'
                    ? 'bg-white text-zinc-950 shadow-xs font-bold border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                ⚡ 免安装书签 (拖拽即用)
              </button>
              <button
                type="button"
                onClick={() => setInstallMethod('zip')}
                className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                  installMethod === 'zip'
                    ? 'bg-white text-zinc-950 shadow-xs font-bold border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                📦 离线扩展包 (.ZIP)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {installMethod === 'userscript' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">方式一：油猴 / 脚本猫一键直装 (推荐 · 0配置)</span>
                      <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">1秒生效</span>
                    </div>

                    <a
                      href="/linkpulse.user.js"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                      <span>点击立即一键安装进浏览器</span>
                      <ExternalLink className="w-4 h-4 opacity-75" />
                    </a>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600">
                    <p className="font-semibold text-zinc-900">安装步骤说明：</p>
                    <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                      <li>如果浏览器已安装 <strong>Tampermonkey (油猴)</strong> 或 <strong>脚本猫</strong>，点击上方绿色大按钮，浏览器将自动弹出脚本安装界面。</li>
                      <li>在弹出的界面中点击右上角「安装 (Install)」按钮即可完成！</li>
                      <li>安装后打开任意第三方博客（WordPress、Ghost、Substack 评论区），评论框上方会自动浮现 MiniMax 意图栏！</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-500 space-y-1">
                    <p className="font-medium text-zinc-700">尚未安装油猴？仅需在官方扩展商店添加一次：</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Chrome 官方商店安装 Tampermonkey</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-zinc-300">|</span>
                      <a
                        href="https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Edge 官方商店安装 Tampermonkey</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {installMethod === 'bookmarklet' && (
                <div className="space-y-4">
                  <div className="p-6 bg-zinc-50 border-2 border-dashed border-emerald-300 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-xs font-medium text-zinc-700">
                      按住下方绿色胶囊按钮，<strong>直接拖拽至您的浏览器书签栏（Bookmarks Bar）</strong>：
                    </p>

                    <a
                      href={bookmarkletCode}
                      draggable
                      onClick={(e) => {
                        e.preventDefault();
                        alert('请按住此按钮，直接拖动到浏览器顶部的书签栏中即可完成安装！');
                      }}
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full text-sm shadow-md cursor-grab active:cursor-grabbing transition-transform active:scale-95 inline-flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 fill-zinc-950" />
                      <span>⚡ LinkPulse 智能评论条 (拖我到书签栏)</span>
                    </a>

                    <p className="text-[11px] text-zinc-500 max-w-md">
                      如果书签栏未显示，可在 Chrome 按 <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded font-mono text-[10px]">Ctrl+Shift+B</kbd>（Mac: <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded font-mono text-[10px]">Cmd+Shift+B</kbd>）显示书签栏。
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600">
                    <p className="font-semibold text-zinc-900">使用方法：</p>
                    <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                      <li>打开任意带有评论框的独立博客（WordPress / Ghost / Substack 等）。</li>
                      <li>在浏览器书签栏上点击一下【⚡ LinkPulse 智能评论条】。</li>
                      <li>评论框上方会立即唤起 MiniMax 智能意图悬浮条，一键自动织入高质量外链！</li>
                    </ol>
                  </div>
                </div>
              )}

              {installMethod === 'zip' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      disabled={isPackagingZip}
                      className="w-full py-3.5 px-6 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isPackagingZip ? '正在打包 ZIP 文件...' : '一键下载扩展安装包 (linkpulse-extension-v1.3.zip)'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-zinc-600">
                    <p className="font-semibold text-zinc-900">三步加载进浏览器：</p>
                    <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                      <li>
                        <strong>解压文件：</strong>将下载的 ZIP 包解压至本地任意固定文件夹。
                      </li>
                      <li>
                        <strong>访问扩展页：</strong>在新标签页打开浏览器扩展管理中心：
                        <div className="flex items-center gap-2 mt-1.5">
                          <code className="px-2.5 py-1 bg-zinc-100 rounded font-mono text-zinc-900">chrome://extensions</code>
                          <button
                            type="button"
                            onClick={handleCopyExtensionsUrl}
                            className="px-2.5 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 rounded font-medium text-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            {copiedExtensionsUrl ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>复制网址</span>
                              </>
                            )}
                          </button>
                        </div>
                      </li>
                      <li>
                        <strong>开启并加载：</strong>开启页面右上角的「开发者模式 (Developer mode)」，点击左上角「加载已解压的扩展程序」，选择刚才解压出来的文件夹即可！
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <span>预置推广站点：soundtest.pro / jmcy.cn / franvetted.com</span>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="px-3.5 py-1.5 font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
