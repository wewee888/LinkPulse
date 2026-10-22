import { evaluateBlogCandidateRelevance, PromotedSiteProfile } from '../../../src/utils/seoEngine';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { candidateUrl, candidateTitle, candidateExcerpt, targetSite } = (await context.request.json()) as {
      candidateUrl?: string;
      candidateTitle?: string;
      candidateExcerpt?: string;
      targetSite?: PromotedSiteProfile;
    };

    if (!candidateUrl || candidateUrl.trim().length < 4) {
      return new Response(JSON.stringify({ error: '请输入需要评估的候选博客文章 URL 或域名' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fallbackSite: PromotedSiteProfile = targetSite || {
      id: 'site-soundtest',
      domain: 'soundtest.pro',
      targetUrl: 'https://soundtest.pro',
      brandName: 'SoundTest Pro',
      defaultKeyword: 'online sound test & audio latency benchmark',
      nicheDesc: '在线音频硬件测试、耳机频响与声学延迟基准工具',
      preferredLanguage: 'en',
    };

    const report = evaluateBlogCandidateRelevance({
      candidateUrl,
      candidateTitle,
      candidateExcerpt,
      targetSite: fallbackSite,
    });

    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || '博客评估审计失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
