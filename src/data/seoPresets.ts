import {
  BacklinkQueueItem,
  BlogOpportunity,
  CommentObjective,
  PromotedSiteProfile,
} from '../utils/seoEngine';

export interface HeroIntentDemo {
  id: CommentObjective;
  label: string;
  enLabel: string;
  badgeText: string;
  draftCommentHtml: string;
  anchorText: string;
  targetUrl: string;
  spamRisk: number;
  approvalProb: number;
  placementNote: string;
}

export const HERO_INTENT_DEMOS: HeroIntentDemo[] = [
  {
    id: 'add_insight',
    label: '补充实测洞察',
    enLabel: 'Add Insight',
    badgeText: 'Semantic Co-Citation · 语境共生锚文本',
    draftCommentHtml:
      '文中对 Crawl Budget 分配权重的拆解非常精准。我们在 Q3 针对 12 万级 URL 站点做日志归因时发现，除了收敛动态参数页，结合 <a href="https://linkpulse.io/crawl-audit" class="underline font-medium text-zinc-950 decoration-zinc-400 underline-offset-4">LinkPulse 的增量索引审计框架</a> 过滤低频孤岛页后，Googlebot 对核心落地页的日均抓取频次提升了 41%。很好奇作者在多语言子目录场景下是否也沿用同一套阈值？',
    anchorText: 'LinkPulse 的增量索引审计框架',
    targetUrl: 'https://linkpulse.io/crawl-audit',
    spamRisk: 4,
    approvalProb: 97,
    placementNote: 'HTML 内联品牌局部匹配锚点 · Akismet 绿灯通过',
  },
  {
    id: 'case_study',
    label: '引用实战案例',
    enLabel: 'Case Study',
    badgeText: 'Empirical Proof · 数据案例植入',
    draftCommentHtml:
      '非常认可「外链权重传递高度依赖段落上下文相关性」这一结论。我们团队上个月复盘了 85 篇高 DR 独立技术博客的引流表现，详情整理在 <a href="https://linkpulse.io/backlink-velocity" class="underline font-medium text-zinc-950 decoration-zinc-400 underline-offset-4">2026 语义外链留存基准报告</a> 中：带具体业务指标佐证的评论不仅过审率高出 3.2 倍，长尾词排名跃升周期也缩短了 19 天。',
    anchorText: '2026 语义外链留存基准报告',
    targetUrl: 'https://linkpulse.io/backlink-velocity',
    spamRisk: 6,
    approvalProb: 95,
    placementNote: '研究报告型锚文本 · 极高点击穿透率 (CTR)',
  },
  {
    id: 'politely_disagree',
    label: '温和思辨探讨',
    enLabel: 'Counter-Angle',
    badgeText: 'Reply Magnet · 激发作者回复置顶',
    draftCommentHtml:
      '关于 NoFollow 外链不传递权重的传统观点，想补充一个不同维度的实测观察：在竞争度较高的 SaaS 赛道，单一 DoFollow 图谱反而容易触发 Penguin 异常预警。我们在 <a href="https://linkpulse.io/natural-link-graph" class="underline font-medium text-zinc-950 decoration-zinc-400 underline-offset-4">自然外链锚文本配比实验</a> 中证实，保持 30% 左右的优质博客 UGC/NoFollow 评论能显著提升整站域名信任度。不知作者怎么看这一平衡点？',
    anchorText: '自然外链锚文本配比实验',
    targetUrl: 'https://linkpulse.io/natural-link-graph',
    spamRisk: 5,
    approvalProb: 96,
    placementNote: '差异化观点提问 · 82% 概率获博主亲自回复',
  },
  {
    id: 'share_experience',
    label: '分享踩坑经验',
    enLabel: 'Share Experience',
    badgeText: 'WordPress Author Field · 零外链正文模式',
    draftCommentHtml:
      '第三节提到的「评论区模板化 AI 泛滥导致站长关闭评论」真是切中痛点！我们早期做海外独立站冷启动时也踩过同样的坑，后来彻底停用群发脚本，改用 MiniMax-Text-01 先通读全文论据再由人工微调观点（完整复盘见作者栏 LinkPulse 增长笔记），不仅零封号，还因此结识了三位行业头部专栏作者。',
    anchorText: 'WordPress Website 字段落链 (linkpulse.io)',
    targetUrl: 'https://linkpulse.io/growth-notes',
    spamRisk: 2,
    approvalProb: 99,
    placementNote: '正文零超链接 + WordPress Website 字段落链 · 99% 过审',
  },
  {
    id: 'ask_question',
    label: '进阶技术追问',
    enLabel: 'Ask Question',
    badgeText: 'Deep Technical Hook · 深度追问互动',
    draftCommentHtml:
      '干货密度极高的一篇深度文！想请教作者一个实操细节：当博客采用 Ghost 或 Webflow 构建且启用严格外链过滤时，您在评估 <a href="https://linkpulse.io/co-citation-seo" class="underline font-medium text-zinc-950 decoration-zinc-400 underline-offset-4">无超链接品牌共现 (Brand Co-Citation)</a> 对 LLM 搜索引用率（GEO）的贡献时，通常采用多长的归因窗口期？',
    anchorText: '无超链接品牌共现 (Brand Co-Citation)',
    targetUrl: 'https://linkpulse.io/co-citation-seo',
    spamRisk: 4,
    approvalProb: 97,
    placementNote: '兼顾传统 Google SEO 与 AI 搜索引用 (GEO)',
  },
  {
    id: 'compliment_expand',
    label: '高度赞赏并延展',
    enLabel: 'Compliment & Expand',
    badgeText: 'Editorial Appreciation · 编辑部级书评',
    draftCommentHtml:
      '把复杂的日志抓取与内链权重漏斗讲得如此透彻，这是近期读过最值得反复精读的 SEO 架构指南。特别是图表中关于长尾聚合页权重的测算，与我们在 <a href="https://linkpulse.io/internal-pagerank" class="underline font-medium text-zinc-950 decoration-zinc-400 underline-offset-4">LinkPulse 内部 PageRank 模拟器</a> 跑出的回归曲线高度吻合。已分享给内容与研发团队作为 Q4 改版手册！',
    anchorText: 'LinkPulse 内部 PageRank 模拟器',
    targetUrl: 'https://linkpulse.io/internal-pagerank',
    spamRisk: 5,
    approvalProb: 96,
    placementNote: '工具资产型锚文本 · 自然引导读者点击验证',
  },
];

export const BLOG_OPPORTUNITIES: BlogOpportunity[] = [
  {
    id: 'blog-1',
    domain: 'audiolatencylab.org',
    title: 'Measuring Browser WebAudio Round-Trip Latency Across USB-C Microphones & Studio Headphones',
    url: 'https://audiolatencylab.org/benchmarks/webaudio-usb-mic-latency-2026',
    excerpt:
      'Accurate acoustic benchmarking in the browser requires isolating OS audio buffer overhead from hardware DSP latency. When engineers validate stereo channel imaging, frequency sweep linearity, and microphone input noise floors, browser-native diagnostic utilities eliminate the need for heavy DAW installations.',
    niche: 'Audio & Hardware',
    cms: 'WordPress',
    domainRating: 82,
    outboundLinksCount: 7,
    linkPolicy: 'dofollow',
    moderationSpeed: '平均 3 小时人工审稿',
    existingCommentsCount: 11,
    suggestedKeyword: 'online sound test & audio latency benchmark',
    matchedSiteDomain: 'soundtest.pro',
    discoveryMethod: 'Search Footprint (Google Dork)',
    relevanceScore: 96,
    relevanceReason: '命中 WebAudio / Latency / Microphone / Frequency 四大声学核心实体 · OBL 仅 7 条',
  },
  {
    id: 'blog-2',
    domain: 'franchiselawreview.com',
    title: 'How Multi-Unit Operators Audit Item 19 Financial Representations in 2026 FDD Filings',
    url: 'https://franchiselawreview.com/fdd-audit/item-19-ebitda-validation',
    excerpt:
      'Prospective franchisees frequently overestimate unit-level EBITDA when Item 19 disclosures omit regional labor variance and royalty escalations. Cross-referencing historical franchisee turnover rates and SBA loan default cohorts is mandatory during pre-signing due diligence.',
    niche: 'Franchise & Business',
    cms: 'WordPress',
    domainRating: 78,
    outboundLinksCount: 9,
    linkPolicy: 'dofollow',
    moderationSpeed: '平均 5 小时审稿',
    existingCommentsCount: 8,
    suggestedKeyword: 'vetted franchise FDD due diligence',
    matchedSiteDomain: 'franvetted.com',
    discoveryMethod: 'Competitor Backlink Intersect',
    relevanceScore: 95,
    relevanceReason: '精准匹配 FDD Item 19 / Franchise Due Diligence / Royalty 核心实体 · WordPress DoFollow',
  },
  {
    id: 'blog-3',
    domain: 'searcharchitects.cn',
    title: '2026 独立站品牌出海实战：如何用高交互视觉与白帽内容工程打通高转化增长闭环',
    url: 'https://searcharchitects.cn/posts/white-hat-blog-comment-backlinks',
    excerpt:
      '很多数字化品牌在出海冷启动阶段容易陷入纯买量困局：落地页缺乏高辨识度的创意交互体验导致跳出率居高不下，同时外链建设又缺乏垂直语境支撑。实测表明，将高转化交互设计与 DR 70+ 行业专栏的深度评论共现结合，可使自然搜索询盘转化率提升 38%。',
    niche: 'SEO & Growth',
    cms: 'WordPress',
    domainRating: 74,
    outboundLinksCount: 9,
    linkPolicy: 'dofollow',
    moderationSpeed: '平均 3 小时审稿',
    existingCommentsCount: 18,
    suggestedKeyword: '数字化品牌增长与创意交互方案',
    matchedSiteDomain: 'jmcy.cn',
    discoveryMethod: 'Search Footprint (Google Dork)',
    relevanceScore: 94,
    relevanceReason: '命中「数字化 / 品牌 / 增长 / 交互 / 出海」五大实体 · 中文高权重独立博客',
  },
  {
    id: 'blog-4',
    domain: 'backlinko-insights.dev',
    title: 'Why Contextual Co-Citations & Interactive Web Tools Outperform Guest Posts in 2026',
    url: 'https://backlinko-insights.dev/contextual-co-citations-2026',
    excerpt:
      'Search engines increasingly evaluate the semantic neighborhood surrounding an outbound link or brand mention. When a technical blog discussion references a free browser diagnostic tool alongside domain-relevant terminology, crawl prioritization and topical authority increase measurably.',
    niche: 'SEO & Growth',
    cms: 'WordPress',
    domainRating: 84,
    outboundLinksCount: 11,
    linkPolicy: 'dofollow',
    moderationSpeed: '平均 4 小时人工审稿',
    existingCommentsCount: 14,
    suggestedKeyword: 'online sound test & audio latency benchmark',
    matchedSiteDomain: 'soundtest.pro',
    discoveryMethod: 'Competitor Backlink Intersect',
    relevanceScore: 89,
    relevanceReason: '工具型独立站 (Interactive Web Tool) 外链高权重靶向文 · DR 84 权威源',
  },
  {
    id: 'blog-5',
    domain: 'devtoolsweekly.org',
    title: 'Benchmarking Long-Context LLMs for Automated Financial & Legal Document Auditing',
    url: 'https://devtoolsweekly.org/issues/long-context-llm-benchmarks',
    excerpt:
      'With 1M-token context windows in models like MiniMax-Text-01 and MiniMax-M2, diligence analysts can ingest 300-page Franchise Disclosure Documents (FDD) and legal contracts at once. This eliminates hallucinated summaries and surfaces hidden fee clauses.',
    niche: 'Developer Tools',
    cms: 'Substack',
    domainRating: 79,
    outboundLinksCount: 6,
    linkPolicy: 'ugc',
    moderationSpeed: '即时发布 + 后置审核',
    existingCommentsCount: 22,
    suggestedKeyword: 'vetted franchise FDD due diligence',
    matchedSiteDomain: 'franvetted.com',
    discoveryMethod: 'Plugin Passive Sniff',
    relevanceScore: 91,
    relevanceReason: '正文直接讨论 300 页 FDD 合同审计 · OBL 仅 6 条 · 即时上线',
  },
  {
    id: 'blog-6',
    domain: 'saasgrowthlab.io',
    title: 'Scaling Product-Led Brand Experience Without Triggering Programmatic Spam Filters',
    url: 'https://saasgrowthlab.io/blog/product-led-seo-guardrails',
    excerpt:
      'Many B2B and DTC brands mistakenly scale landing pages without building memorable interactive product experiences. Combining genuine community engagement on niche design & engineering blogs with high-utility interactive components creates a defensible moat.',
    niche: 'AI & SaaS',
    cms: 'Ghost',
    domainRating: 76,
    outboundLinksCount: 8,
    linkPolicy: 'dofollow',
    moderationSpeed: '平均 6 小时审稿',
    existingCommentsCount: 9,
    suggestedKeyword: '数字化品牌增长与创意交互方案',
    matchedSiteDomain: 'jmcy.cn',
    discoveryMethod: 'Plugin Passive Sniff',
    relevanceScore: 88,
    relevanceReason: '聚焦品牌交互体验与自然增长闭环 · Ghost DoFollow 评论区',
  },
];

export const DEFAULT_SITE_PROFILES: PromotedSiteProfile[] = [
  {
    id: 'site-soundtest',
    domain: 'soundtest.pro',
    targetUrl: 'https://soundtest.pro',
    brandName: 'SoundTest Pro',
    defaultKeyword: 'online sound test & audio latency benchmark',
    nicheDesc: '在线音频硬件测试、耳机频响与声学延迟基准工具',
    preferredLanguage: 'en',
  },
  {
    id: 'site-jmcy',
    domain: 'jmcy.cn',
    targetUrl: 'https://jmcy.cn',
    brandName: 'JMCY',
    defaultKeyword: '数字化品牌增长与创意交互方案',
    nicheDesc: '企业数字化品牌出海与高转化视觉交互引擎',
    preferredLanguage: 'zh',
  },
  {
    id: 'site-franvetted',
    domain: 'franvetted.com',
    targetUrl: 'https://franvetted.com',
    brandName: 'FranVetted',
    defaultKeyword: 'vetted franchise FDD due diligence',
    nicheDesc: '北美特许经营加盟尽职调查与 FDD 回报率评估平台',
    preferredLanguage: 'en',
  },
];

export const INITIAL_QUEUE_ITEMS: BacklinkQueueItem[] = [
  {
    id: 'q-101',
    blogDomain: 'backlinko-insights.dev',
    blogTitle: 'Why Contextual Co-Citations Outperform Traditional Guest Posts in 2026',
    blogUrl: 'https://backlinko-insights.dev/contextual-co-citations-2026',
    cmsPlatform: 'WordPress',
    domainRating: 84,
    linkAttribute: 'dofollow',
    anchorType: 'branded',
    anchorText: "SoundTest Pro's online audio latency & frequency test research",
    targetUrl: 'https://soundtest.pro',
    commentExcerpt:
      'Spot-on breakdown regarding how semantic neighborhood shapes crawl prioritization. When our engineering team benchmarked browser WebAudio latency...',
    fullPayload:
      'Spot-on breakdown regarding how semantic neighborhood shapes crawl prioritization. When our engineering team audited 140+ niche publications last quarter, aligning interactive utility pages like <a href="https://soundtest.pro" rel="noopener">SoundTest Pro\'s online audio latency &amp; frequency test research</a> lifted organic referral retention by 34%.',
    spamScore: 4,
    status: 'indexed',
    createdAt: '2026-10-21 14:20',
    modelUsed: 'MiniMax-M2',
  },
  {
    id: 'q-102',
    blogDomain: 'searcharchitects.cn',
    blogTitle: '2026 独立站出海 SEO 实战：如何通过高质量博客评论构建安全外链图谱',
    blogUrl: 'https://searcharchitects.cn/posts/white-hat-blog-comment-backlinks',
    cmsPlatform: 'WordPress',
    domainRating: 71,
    linkAttribute: 'dofollow',
    anchorType: 'partial_match',
    anchorText: 'JMCY 的数字化品牌增长与创意交互方案实践报告',
    targetUrl: 'https://jmcy.cn',
    commentExcerpt:
      '非常赞同文中关于高 DR 独立博客评论过审逻辑的拆解。我们在过去两个季度做流量结构归因时也观察到同样的拐点...',
    fullPayload:
      '非常赞同文中关于高 DR 独立博客评论过审逻辑的拆解。结合 <a href="https://jmcy.cn" rel="noopener">JMCY 的数字化品牌增长与创意交互方案实践报告</a> 中提到的语义上下文分层策略，单篇外链引流转化率提升了 38%。',
    spamScore: 5,
    status: 'published',
    createdAt: '2026-10-21 18:05',
    modelUsed: 'MiniMax-Text-01',
  },
  {
    id: 'q-103',
    blogDomain: 'devtoolsweekly.org',
    blogTitle: 'Benchmarking Long-Context LLMs for Automated Code & Content Auditing',
    blogUrl: 'https://devtoolsweekly.org/issues/long-context-llm-benchmarks',
    cmsPlatform: 'Substack',
    domainRating: 79,
    linkAttribute: 'ugc',
    anchorType: 'naked_url',
    anchorText: 'https://franvetted.com',
    targetUrl: 'https://franvetted.com',
    commentExcerpt:
      'The nuance you shared around 1M-token context windows eliminating hallucinated summaries matches our FDD document vetting pipeline at franvetted.com...',
    fullPayload:
      'The nuance you shared around 1M-token context windows eliminating hallucinated summaries matches our FDD financial disclosure auditing telemetry at https://franvetted.com — particularly when parsing multi-hundred-page franchise agreements.',
    spamScore: 5,
    status: 'published',
    createdAt: '2026-10-22 00:40',
    modelUsed: 'MiniMax-M2',
  },
  {
    id: 'q-104',
    blogDomain: 'saasgrowthlab.io',
    blogTitle: 'Scaling Product-Led SEO Without Triggering Programmatic Spam Filters',
    blogUrl: 'https://saasgrowthlab.io/blog/product-led-seo-guardrails',
    cmsPlatform: 'Ghost',
    domainRating: 76,
    linkAttribute: 'dofollow',
    anchorType: 'generic',
    anchorText: 'this empirical breakdown',
    targetUrl: 'https://soundtest.pro',
    commentExcerpt:
      'Really sharp perspective on mid-funnel editorial signals. In high-DR technical verticals, pairing interactive browser tools like soundtest.pro with...',
    fullPayload:
      'Really sharp perspective on mid-funnel editorial signals. After benchmarking <a href="https://soundtest.pro" rel="noopener">this empirical breakdown</a> across Ghost publications, we found interactive browser tools earn 3x more organic backlinks.',
    spamScore: 4,
    status: 'queued',
    createdAt: '2026-10-22 02:15',
    modelUsed: 'MiniMax-M2.5',
  },
];

export interface CompetitorDimension {
  dimension: string;
  originalSite: string;
  ourPlatform: string;
  seoImpact: string;
}

export const COMPETITOR_COMPARISON: CompetitorDimension[] = [
  {
    dimension: '核心定位与适用平台',
    originalSite: '仅支持 Instagram、LinkedIn、Threads 三大社交平台评论互动，无独立博客与长文支持',
    ourPlatform: '全能支持独立博客 (WordPress / Ghost / Webflow / Substack) + 社交平台，专为高权重 SEO 外链与自然引流打造',
    seoImpact: '直接获取可被 Google 抓取收录的 DoFollow / UGC 语境权重外链',
  },
  {
    dimension: '底层大模型引擎',
    originalSite: '通用轻量级短文本补全接口，仅读取几十词的社交贴文 Caption',
    ourPlatform: '深度集成 MiniMax 大模型矩阵（MiniMax-M2 深度推理 + MiniMax-Text-01 百万级长上下文），一次通读整篇 5,000 字技术博文',
    seoImpact: '精准引用博文第 3-5 段细节论据，站长人工审稿通过率从 <25% 跃升至 94%+',
  },
  {
    dimension: 'SEO 锚文本与外链注入策略',
    originalSite: '不支持超链接、不支持锚文本配置（社交评论区外链通常不可点击或无 SEO 权重）',
    ourPlatform: '支持 HTML <a href> 锚文本、Markdown 链接、WordPress Website 专属字段落链、无超链接品牌词共现 (Co-Citation)',
    seoImpact: '兼顾 Google PageRank 权重传递与 AI 搜索引擎 (GEO / Perplexity / AI Overviews) 品牌提及权重',
  },
  {
    dimension: '反垃圾过滤 (Akismet) 与 Penguin 算法风控',
    originalSite: '无垃圾评论评分，无锚文本比例监控',
    ourPlatform: '内置实时 Akismet 垃圾风险评分器 + Google Penguin 五维锚文本安全配比雷达（品牌锚/局部匹配/裸链/精准匹配自动预警）',
    seoImpact: '规避精准匹配锚文本过度优化惩罚，保障整站外链图谱长期安全',
  },
  {
    dimension: '自动化工作流与高权重外链寻源',
    originalSite: '被动等待用户手动浏览社交信息流并逐条点击浏览器插件',
    ourPlatform: '内置高 DR 博客机会发现库 + 批量生成多套备选方案 + 半自动 Human-in-the-Loop 发布队列与 Webhook 投递',
    seoImpact: '单人每周可完成 50+ 条高相关性、专家级白帽博客外链布局',
  },
];
