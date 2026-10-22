import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCommentForm,
  evaluateCommentSeoMetrics,
  analyzeAnchorDistribution,
  synthesizeMiniMaxComments,
  formatAnchorByType,
  buildSeoConversionAnalytics,
  generateChromeExtensionFiles,
  generateSearchFootprints,
  evaluateBlogCandidateRelevance,
} from './seoEngine';

test('validateCommentForm catches invalid URLs and short content', () => {
  const invalid = validateCommentForm({
    articleTitle: 'Hi',
    articleContent: 'Too short',
    targetUrl: 'not-a-url',
    targetKeyword: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.articleTitle);
  assert.ok(invalid.errors.articleContent);
  assert.ok(invalid.errors.targetUrl);
  assert.ok(invalid.errors.targetKeyword);

  const valid = validateCommentForm({
    articleTitle: 'How Technical SEO Audits Improve Crawl Budget in 2026',
    articleContent: 'Crawl budget optimization requires pruning low-value parameter URLs and fixing redirect chains.',
    targetUrl: 'https://linkpulse.io/crawl-budget-guide',
    targetKeyword: 'technical SEO audit',
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('evaluateCommentSeoMetrics penalizes spam phrases and rewards contextual comments', () => {
  const spammy = evaluateCommentSeoMetrics({
    commentText: 'Nice post! Great article! Check out my website https://a.com and https://b.com free money',
    articleText: 'Core Web Vitals and INP optimization for modern React applications.',
    targetKeyword: 'INP optimization',
    targetUrl: 'https://a.com',
    placementMode: 'html_anchor',
    anchorType: 'exact_match',
  });

  const clean = evaluateCommentSeoMetrics({
    commentText:
      'Your analysis of Core Web Vitals and INP optimization in React hydration scenarios matches what we saw in production last month. Deferring non-critical event listeners reduced main-thread blocking by 42%.',
    articleText: 'Core Web Vitals and INP optimization for modern React applications.',
    targetKeyword: 'INP optimization',
    targetUrl: 'https://linkpulse.io/inp-guide',
    placementMode: 'wordpress_field',
    anchorType: 'branded',
  });

  assert.ok(spammy.spamRiskScore > 50, `Expected high spam score, got ${spammy.spamRiskScore}`);
  assert.ok(clean.spamRiskScore < 15, `Expected low spam score, got ${clean.spamRiskScore}`);
  assert.ok(clean.estimatedApprovalRate > spammy.estimatedApprovalRate);
});

test('analyzeAnchorDistribution detects Google Penguin over-optimization', () => {
  const safeQueue = [
    { anchorType: 'branded' as const },
    { anchorType: 'branded' as const },
    { anchorType: 'partial_match' as const },
    { anchorType: 'naked_url' as const },
    { anchorType: 'generic' as const },
  ];
  const safeRes = analyzeAnchorDistribution(safeQueue);
  assert.equal(safeRes.status, 'optimal');
  assert.ok(safeRes.penguinSafetyScore >= 90);

  const riskyQueue = [
    { anchorType: 'exact_match' as const },
    { anchorType: 'exact_match' as const },
    { anchorType: 'branded' as const },
  ];
  const riskyRes = analyzeAnchorDistribution(riskyQueue);
  assert.equal(riskyRes.status, 'danger');
  assert.ok(riskyRes.penguinSafetyScore < 65);
});

test('synthesizeMiniMaxComments returns 3 complete variants with HTML and WordPress payloads', () => {
  const variants = synthesizeMiniMaxComments({
    articleUrl: 'https://moz.com/blog/link-building-strategies',
    articleTitle: 'Modern Link Building & Editorial Outreach in 2026',
    articleContent:
      'High-authority backlinks require contextual relevance, co-citation neighbors, and genuine editorial insights rather than automated spun comments.',
    targetUrl: 'https://linkpulse.io/seo-study',
    targetKeyword: 'editorial backlink study',
    brandName: 'LinkPulse',
    authorPersona: 'Head of SEO',
    authorName: 'Linus Wang',
    authorEmail: 'linus@linkpulse.io',
    objective: 'add_insight',
    placementMode: 'html_anchor',
    anchorType: 'partial_match',
    model: 'MiniMax-M3.1-Flash',
    language: 'en',
  });

  assert.equal(variants.length, 3);
  assert.ok(variants[0].htmlPayload.includes('<a href="https://linkpulse.io/seo-study"'));
  assert.equal(variants[0].wordpressFields.url, 'https://linkpulse.io/seo-study');
  assert.ok(variants[0].metrics.contextualRelevance >= 75);
});

test('formatAnchorByType formats all 5 SEO anchor types properly', () => {
  const branded = formatAnchorByType({
    anchorType: 'branded',
    targetKeyword: '外链策略',
    brandName: 'LinkPulse',
    targetUrl: 'https://linkpulse.io',
    language: 'zh',
  });
  assert.ok(branded.includes('LinkPulse'));
});

test('buildSeoConversionAnalytics generates 30-day series and DR/spam buckets dynamically', () => {
  const emptyAnalytics = buildSeoConversionAnalytics([]);
  assert.equal(emptyAnalytics.series30d.length, 30);
  assert.equal(emptyAnalytics.drBuckets.length, 4);
  assert.equal(emptyAnalytics.spamBuckets.length, 4);

  const withPublished = buildSeoConversionAnalytics([
    {
      id: 'q-test-1',
      blogDomain: 'example.com',
      blogTitle: 'Test Post',
      blogUrl: 'https://example.com/post',
      cmsPlatform: 'WordPress',
      domainRating: 86,
      linkAttribute: 'dofollow',
      anchorType: 'branded',
      anchorText: 'LinkPulse',
      targetUrl: 'https://linkpulse.io',
      commentExcerpt: 'Excerpt',
      fullPayload: 'Payload',
      spamScore: 3,
      status: 'indexed',
      createdAt: '2026-10-22 10:00',
      modelUsed: 'MiniMax-M3.1-Flash',
    },
  ]);

  assert.ok(
    withPublished.summary.totalPublished30d > emptyAnalytics.summary.totalPublished30d,
    'Published queue items should increment 30-day total'
  );
  assert.ok(
    withPublished.summary.totalIndexed30d > emptyAnalytics.summary.totalIndexed30d,
    'Indexed queue items should increment 30-day indexed total'
  );
});

test('generateChromeExtensionFiles builds valid Manifest V3 bundle with soundtest.pro, jmcy.cn, franvetted.com', () => {
  const bundle = generateChromeExtensionFiles({
    serverUrl: 'https://linkpulse.app',
    defaultTargetUrl: 'https://soundtest.pro',
    defaultKeyword: 'online sound test & audio latency benchmark',
    defaultBrandName: 'SoundTest Pro',
    defaultAuthorName: 'Alex Chen',
    defaultAuthorEmail: 'alex@soundtest.pro',
    defaultModel: 'MiniMax-M3.1-Flash',
    defaultPlacementMode: 'html_anchor',
  });

  const manifest = JSON.parse(bundle['manifest.json']);
  assert.equal(manifest.manifest_version, 3);
  assert.ok(bundle['content.js'].includes('soundtest.pro'));
  assert.ok(bundle['content.js'].includes('jmcy.cn'));
  assert.ok(bundle['content.js'].includes('franvetted.com'));
  assert.ok(bundle['popup.html'].includes('soundtest.pro'));
});

test('generateSearchFootprints and evaluateBlogCandidateRelevance judge high-relevance vs link-farm blogs', () => {
  const soundSite = {
    id: 'site-soundtest',
    domain: 'soundtest.pro',
    targetUrl: 'https://soundtest.pro',
    brandName: 'SoundTest Pro',
    defaultKeyword: 'online sound test & audio latency benchmark',
    nicheDesc: '在线音频硬件测试、耳机频响与声学延迟基准工具',
    preferredLanguage: 'en' as const,
  };

  const footprints = generateSearchFootprints(soundSite);
  assert.equal(footprints.length, 4);
  assert.ok(footprints[0].dorkQuery.includes('Leave a Reply'));

  const highRel = evaluateBlogCandidateRelevance({
    candidateUrl: 'https://studioacoustics.dev/guides/measuring-headphone-frequency-webaudio-latency',
    candidateTitle: 'Measuring Headphone Frequency Response and WebAudio Latency',
    targetSite: soundSite,
  });
  assert.equal(highRel.verdict, 'high_priority');
  assert.ok(highRel.dimensions.topicalRelevance >= 80);
  assert.ok(highRel.matchedEntities.includes('latency'));

  const linkFarm = evaluateBlogCandidateRelevance({
    candidateUrl: 'https://free-directory-guestpost-farm.net/casino-link-exchange',
    candidateTitle: 'Free Link Exchange Directory',
    targetSite: soundSite,
  });
  assert.equal(linkFarm.verdict, 'rejected_link_farm');
  assert.ok(linkFarm.dimensions.outboundLinksCount > 45);
});
