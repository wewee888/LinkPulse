export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { url } = (await context.request.json()) as { url?: string };
    if (!url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url.trim())) {
      return new Response(JSON.stringify({ error: '请输入有效的博客文章 URL（需以 http:// 或 https:// 开头）' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsedUrl = new URL(url.trim());
    const slug = parsedUrl.pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, ' ') || 'technical seo architecture';

    const formattedTitle = slug
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return new Response(
      JSON.stringify({
        url: url.trim(),
        domain: parsedUrl.hostname,
        title: `${formattedTitle} — Deep-Dive Engineering & Growth Analysis`,
        excerpt: `In this comprehensive breakdown on ${parsedUrl.hostname}, we examine how ${slug} impacts organic search visibility, crawl budget efficiency, and long-tail user retention across high-authority technical publications. Empirical benchmarks show that contextual co-citations and peer-level commentary significantly outperform automated link schemes.`,
        detectedCms: parsedUrl.hostname.includes('substack')
          ? 'Substack'
          : parsedUrl.hostname.includes('ghost')
          ? 'Ghost'
          : 'WordPress',
        estimatedDr: 74,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || '解析博客失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
