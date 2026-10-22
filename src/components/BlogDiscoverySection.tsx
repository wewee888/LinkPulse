import { useState } from 'react';
import {
  BlogCandidateAuditReport,
  BlogOpportunity,
  PromotedSiteProfile,
  evaluateBlogCandidateRelevance,
  generateSearchFootprints,
} from '../utils/seoEngine';
import {
  ArrowUpRight,
  Check,
  Copy,
  Plus,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface BlogDiscoverySectionProps {
  opportunities: BlogOpportunity[];
  siteProfiles: PromotedSiteProfile[];
  activeSiteId: string;
  onSelectSite: (site: PromotedSiteProfile) => void;
  onAddOpportunity: (blog: BlogOpportunity) => void;
  onSelectBlogForWorkbench: (blog: BlogOpportunity) => void;
}

const SAMPLE_CANDIDATES = [
  {
    label: '测试 soundtest.pro 相关博客 (声学工程)',
    siteDomain: 'soundtest.pro',
    url: 'https://studioacoustics.dev/guides/measuring-headphone-frequency-response-webaudio-latency',
    title: 'Measuring Headphone Frequency Response and WebAudio Round-Trip Latency in Browsers',
  },
  {
    label: '测试 jmcy.cn 相关博客 (品牌增长与交互)',
    siteDomain: 'jmcy.cn',
    url: 'https://martech-china.org/insights/digital-brand-interactive-ux-conversion-growth',
    title: '2026 数字化品牌出海：如何用高转化视觉交互设计提升独立站自然搜索增长',
  },
  {
    label: '测试 franvetted.com 相关博客 (特许经营 FDD)',
    siteDomain: 'franvetted.com',
    url: 'https://franchiseinvestordigest.com/fdd-diligence/evaluating-multi-unit-royalty-sba-roi',
    title: 'Evaluating Multi-Unit Franchise FDD Disclosures, Royalty Fees, and SBA Loan ROI',
  },
  {
    label: '测试低质外链农场拦截 (OBL > 50 反例)',
    siteDomain: 'soundtest.pro',
    url: 'https://free-directory-guestpost-farm.net/casino-link-exchange-list',
    title: 'Free Link Exchange Directory 1000+ Outbound Links Auto Approve',
  },
];

export function BlogDiscoverySection({
  opportunities,
  siteProfiles,
  activeSiteId,
  onSelectSite,
  onAddOpportunity,
  onSelectBlogForWorkbench,
}: BlogDiscoverySectionProps) {
  const activeSite =
    siteProfiles.find((s) => s.id === activeSiteId) || siteProfiles[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [policyFilter, setPolicyFilter] = useState<'all' | 'dofollow' | 'ugc' | 'nofollow'>('all');
  const [cmsFilter, setCmsFilter] = useState<string>('all');
  const [copiedDorkId, setCopiedDorkId] = useState<string | null>(null);

  // Candidate URL Auditor State
  const [candidateUrl, setCandidateUrl] = useState(
    'https://studioacoustics.dev/guides/measuring-headphone-frequency-response-webaudio-latency'
  );
  const [candidateTitle, setCandidateTitle] = useState(
    'Measuring Headphone Frequency Response and WebAudio Round-Trip Latency in Browsers'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<BlogCandidateAuditReport>(() =>
    evaluateBlogCandidateRelevance({
      candidateUrl:
        'https://studioacoustics.dev/guides/measuring-headphone-frequency-response-webaudio-latency',
      candidateTitle:
        'Measuring Headphone Frequency Response and WebAudio Round-Trip Latency in Browsers',
      targetSite: activeSite,
    })
  );

  const footprints = generateSearchFootprints(activeSite);

  const handleCopyDork = async (id: string, query: string) => {
    try {
      await navigator.clipboard.writeText(query);
    } catch {
      // Fallback
    }
    setCopiedDorkId(id);
    setTimeout(() => {
      setCopiedDorkId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const handleRunAudit = async (
    urlOverride?: string,
    titleOverride?: string,
    siteOverride?: PromotedSiteProfile
  ) => {
    const targetUrlToAudit = (urlOverride ?? candidateUrl).trim();
    const targetTitleToAudit = (titleOverride ?? candidateTitle).trim();
    const siteToUse = siteOverride ?? activeSite;

    if (!targetUrlToAudit || targetUrlToAudit.length < 4) {
      setAuditError('请输入需要检测关联度与外链质量的候选博客 URL');
      return;
    }

    setAuditError(null);
    setIsAuditing(true);
    try {
      const res = await fetch('/api/opportunities/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateUrl: targetUrlToAudit,
          candidateTitle: targetTitleToAudit,
          targetSite: siteToUse,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as BlogCandidateAuditReport;
        setAuditReport(data);
      } else {
        setAuditReport(
          evaluateBlogCandidateRelevance({
            candidateUrl: targetUrlToAudit,
            candidateTitle: targetTitleToAudit,
            targetSite: siteToUse,
          })
        );
      }
    } catch {
      setAuditReport(
        evaluateBlogCandidateRelevance({
          candidateUrl: targetUrlToAudit,
          candidateTitle: targetTitleToAudit,
          targetSite: siteToUse,
        })
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLoadSampleCandidate = (sample: (typeof SAMPLE_CANDIDATES)[number]) => {
    const matchedSite =
      siteProfiles.find((s) => s.domain === sample.siteDomain) || activeSite;
    if (matchedSite.id !== activeSite.id) {
      onSelectSite(matchedSite);
    }
    setCandidateUrl(sample.url);
    setCandidateTitle(sample.title);
    handleRunAudit(sample.url, sample.title, matchedSite);
  };

  const handleSaveAuditedBlog = (loadIntoWorkbenchAfter: boolean) => {
    onAddOpportunity(auditReport.opportunityRecord);
    if (loadIntoWorkbenchAfter) {
      onSelectBlogForWorkbench(auditReport.opportunityRecord);
    }
  };

  const filteredBlogs = opportunities.filter((blog) => {
    const matchesSite =
      siteFilter === 'all' || blog.matchedSiteDomain === siteFilter;
    const matchesPolicy = policyFilter === 'all' || blog.linkPolicy === policyFilter;
    const matchesCms = cmsFilter === 'all' || blog.cms === cmsFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      blog.domain.toLowerCase().includes(q) ||
      blog.title.toLowerCase().includes(q) ||
      blog.niche.toLowerCase().includes(q) ||
      blog.suggestedKeyword.toLowerCase().includes(q) ||
      (blog.matchedSiteDomain || '').toLowerCase().includes(q);
    return matchesSite && matchesPolicy && matchesCms && matchesQuery;
  });

  return (
    <section id="discovery" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>02. 外链寻源机制与相关性判定引擎</span>
              <span aria-hidden="true">·</span>
              <span>解答「博客外链库如何发现」与「如何新增/判定关联网站」</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              高 DR 独立博客外链发现库与五维相关性探测台
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              通过 <strong>Google Search Dorks 评论框特征脚印</strong>、<strong>同行反向外链交叉提取</strong> 与 <strong>Chrome 插件被动漫游嗅探</strong> 持续发现高权重独立博客；并通过 <strong>MiniMax 五维关联度算法</strong> 自动拦截低质外链农场。
            </p>
          </div>

          {/* Active Site Selector for Discovery & Audit */}
          <div className="flex flex-col items-start lg:items-end gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500">
              切换当前寻源与关联度判定的目标网站：
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 rounded-lg">
              {siteProfiles.map((site) => {
                const isActive = site.id === activeSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => {
                      onSelectSite(site);
                      handleRunAudit(candidateUrl, candidateTitle, site);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-700 hover:text-zinc-950'
                    }`}
                  >
                    {site.domain}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Discovery & Relevance Evaluation Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-zinc-200">
          {/* Left 5 Cols: How the Library is Discovered (4 Pipelines + Live Google Dorks) */}
          <div className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/40 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  机制拆解 A · 外链库是在什么情况下被发现的？
                </span>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  当前靶向: {activeSite.domain}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                四大外链寻源管道 + Google 评论框探测脚印
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                系统并非随机抓取网页，而是围绕你的目标站点关键词（<span className="font-mono text-zinc-900">{activeSite.defaultKeyword}</span>）通过以下 4 种场景发现可留外链的独立博客：
              </p>
            </div>

            {/* 4 Discovery Scenarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1">
                <p className="font-bold text-zinc-950">1. 搜索引擎特征脚印 (Dorks)</p>
                <p className="text-zinc-600 leading-relaxed">
                  检索带有 <code className="font-mono text-zinc-900">&quot;Leave a Reply&quot; &quot;Website&quot;</code> 且包含行业词的 WordPress/Ghost 博文。
                </p>
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1">
                <p className="font-bold text-zinc-950">2. 竞品反链交叉提取</p>
                <p className="text-zinc-600 leading-relaxed">
                  反查同赛道竞品已收录的 Blog Comment 反链源，直接复用已被验证放行外链的独立博客。
                </p>
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1">
                <p className="font-bold text-zinc-950">3. Chrome 插件被动漫游嗅探</p>
                <p className="text-zinc-600 leading-relaxed">
                  当你日常阅读行业文章时，插件检测到开放 <code className="font-mono text-zinc-900">#commentform</code> 且导出链接少时自动入库。
                </p>
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1">
                <p className="font-bold text-zinc-950">4. 语义实体聚类召回</p>
                <p className="text-zinc-600 leading-relaxed">
                  通过 MiniMax 提取与 <span className="font-mono text-zinc-900">{activeSite.domain}</span> 实体词高度共现的新近技术专栏。
                </p>
              </div>
            </div>

            {/* Live Generated Google Search Footprints for Active Site */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-950">
                  针对 {activeSite.domain} 自动生成的探测指令 (点击复制去搜索)：
                </span>
              </div>
              <div className="space-y-2">
                {footprints.map((fp) => {
                  const isCopied = copiedDorkId === fp.id;
                  return (
                    <div
                      key={fp.id}
                      className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-900">
                          {fp.title}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {fp.expectedLinkType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-zinc-950 text-zinc-100 px-3 py-2 rounded-md font-mono text-[11px]">
                        <span className="truncate">{fp.dorkQuery}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyDork(fp.id, fp.dorkQuery)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded shrink-0 cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>复制指令</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: How to Add & Judge Associated Websites (Live 5-Dimensional Relevance Judge) */}
          <div className="lg:col-span-7 p-6 md:p-8 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  机制拆解 B · 如何新增候选博客并判断它与目标网站是否强相关？
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900">
                  <Radar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>五维关联度与反垃圾审计引擎</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                输入任意候选博客 URL · 实时评估与 {activeSite.domain} 的语义相关性及外链价值
              </h3>
              <p className="text-xs text-zinc-600">
                判断一个外部博客是否值得给 <strong className="font-mono text-zinc-950">{activeSite.domain}</strong> 发外链，核心看 <strong>5 个硬指标</strong>：① 语义实体重合度 (≥65%)、② 评论框具备 Website/HTML 锚点能力、③ 域名权重 DR、④ 单页导出外链数 (OBL &lt; 25 防权重稀释)、⑤ DoFollow/UGC 属性。
              </p>
            </div>

            {/* Quick Sample Test Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-500">
                一键载入典型候选博客样本测试判定逻辑：
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CANDIDATES.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    onClick={() => handleLoadSampleCandidate(sample)}
                    className="px-2.5 py-1 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate URL Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 space-y-1">
                <label
                  htmlFor="candidate-blog-url"
                  className="block text-xs font-semibold text-zinc-700"
                >
                  候选外部博客文章 URL
                </label>
                <input
                  id="candidate-blog-url"
                  type="url"
                  value={candidateUrl}
                  onChange={(e) => setCandidateUrl(e.target.value)}
                  placeholder="https://example-blog.com/post-slug"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 font-mono"
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label
                  htmlFor="candidate-blog-title"
                  className="block text-xs font-semibold text-zinc-700"
                >
                  文章标题或主题词 (可选，增强语义比对)
                </label>
                <input
                  id="candidate-blog-title"
                  type="text"
                  value={candidateTitle}
                  onChange={(e) => setCandidateTitle(e.target.value)}
                  placeholder="例如：USB Microphone Latency Benchmark"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  type="button"
                  disabled={isAuditing}
                  onClick={() => handleRunAudit()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAuditing ? '检测中...' : '评估关联度'}</span>
                </button>
              </div>
            </div>

            {auditError && (
              <p className="text-xs text-red-600 font-medium">{auditError}</p>
            )}

            {/* Live 5-Dimensional Audit Verdict Card */}
            <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {auditReport.verdict === 'high_priority' ||
                    auditReport.verdict === 'qualified' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-bold ${
                        auditReport.verdict === 'high_priority'
                          ? 'text-emerald-700'
                          : auditReport.verdict === 'qualified'
                          ? 'text-zinc-900'
                          : 'text-red-600'
                      }`}
                    >
                      {auditReport.verdictLabel}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-500">
                    检测域名: <strong className="text-zinc-900">{auditReport.domain}</strong> → 推广目标站: <strong className="text-zinc-900">{auditReport.matchedSiteDomain}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[11px] text-zinc-500">综合外链价值得分</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-zinc-950">
                      {auditReport.overallScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Dimensions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                  <span className="block text-[11px] text-zinc-500">1. 语义相关度</span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      auditReport.dimensions.topicalRelevance >= 70
                        ? 'text-emerald-700'
                        : auditReport.dimensions.topicalRelevance >= 55
                        ? 'text-amber-700'
                        : 'text-red-600'
                    }`}
                  >
                    {auditReport.dimensions.topicalRelevance}%
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                  <span className="block text-[11px] text-zinc-500">2. 评论框与CMS</span>
                  <span className="text-sm font-bold font-mono text-zinc-950">
                    {auditReport.dimensions.detectedCms}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                  <span className="block text-[11px] text-zinc-500">3. 预估域名权重</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-zinc-950">
                    DR {auditReport.dimensions.estimatedDr}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                  <span className="block text-[11px] text-zinc-500">4. 导出外链 (OBL)</span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      auditReport.dimensions.outboundLinksCount <= 20
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {auditReport.dimensions.outboundLinksCount} 条
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-lg col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-zinc-500">5. 链接属性</span>
                  <span className="text-sm font-bold font-mono text-zinc-950">
                    {auditReport.dimensions.linkPolicy}
                  </span>
                </div>
              </div>

              {/* Entities & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-1 text-xs text-zinc-600 max-w-xl">
                  <p>
                    <strong className="text-zinc-900">命中的关联实体词：</strong>
                    {auditReport.matchedEntities.length > 0
                      ? auditReport.matchedEntities.join(' · ')
                      : '未检测到显著垂直实体重合'}
                  </p>
                  <p className="leading-relaxed">{auditReport.recommendation}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveAuditedBlog(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>加入下方外链库</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAuditedBlog(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>入库并立即写评论</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Filter Bar */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600">
              按关联推广站点筛选外链库 ({filteredBlogs.length} 条)：
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setSiteFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  siteFilter === 'all'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                全部站点
              </button>
              {siteProfiles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSiteFilter(s.domain)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                    siteFilter === s.domain
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {s.domain}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                aria-label="搜索高权重博客域名或主题"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索域名、行业或关键词..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950 w-48"
              />
            </div>

            <div
              role="group"
              aria-label="按外链属性筛选"
              className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
            >
              {(
                [
                  { id: 'all', label: '全部属性' },
                  { id: 'dofollow', label: 'DoFollow' },
                  { id: 'ugc', label: 'UGC' },
                  { id: 'nofollow', label: 'NoFollow' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPolicyFilter(item.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    policyFilter === item.id
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <select
              aria-label="按博客建站系统筛选"
              value={cmsFilter}
              onChange={(e) => setCmsFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
            >
              <option value="all">所有 CMS 平台</option>
              <option value="WordPress">WordPress</option>
              <option value="Ghost">Ghost</option>
              <option value="Substack">Substack</option>
              <option value="Webflow">Webflow</option>
            </select>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-600">
                <th className="py-3.5 px-6">目标博客与发现来源</th>
                <th className="py-3.5 px-4">适配推广站与语义判定依据</th>
                <th className="py-3.5 px-4 text-right">语义相关度</th>
                <th className="py-3.5 px-4 text-right">DR / 导出外链</th>
                <th className="py-3.5 px-4">链接属性与审稿周期</th>
                <th className="py-3.5 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-sm text-zinc-500">
                    未找到匹配的博客机会，请尝试切换上方站点筛选或在右侧输入框新增候选 URL。
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    <td className="py-4 px-6 max-w-md">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                          <span className="font-semibold text-zinc-900">{blog.domain}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans text-zinc-600">
                            {blog.discoveryMethod || 'Search Footprint (Google Dork)'}
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-950 line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1">
                          推荐锚文本词根：{blog.suggestedKeyword}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-zinc-950">
                            {blog.matchedSiteDomain || 'soundtest.pro'}
                          </span>
                          <span className="text-zinc-400">·</span>
                          <span className="text-zinc-600">{blog.niche}</span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">
                          {blog.relevanceReason || '行业核心实体词与段落上下文高度共现'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-bold text-emerald-700">
                        {blog.relevanceScore ?? 90}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-bold text-zinc-950">DR {blog.domainRating}</span>
                      <span className="text-zinc-400 mx-1.5">/</span>
                      <span className="text-xs text-zinc-600">OBL {blog.outboundLinksCount}</span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-zinc-600">
                      <span
                        className={
                          blog.linkPolicy === 'dofollow'
                            ? 'font-mono font-semibold text-emerald-700'
                            : 'font-mono font-medium text-zinc-800'
                        }
                      >
                        rel=&quot;{blog.linkPolicy}&quot;
                      </span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{blog.cms}</span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectBlogForWorkbench(blog)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>载入生成台写评论</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
