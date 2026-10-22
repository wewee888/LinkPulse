import { COMPETITOR_COMPARISON } from '../data/seoPresets';
import { ArrowUpRight } from 'lucide-react';

interface CompetitorAnalysisSectionProps {
  onJumpToWorkbench: () => void;
}

export function CompetitorAnalysisSection({
  onJumpToWorkbench,
}: CompetitorAnalysisSectionProps) {
  return (
    <section id="analysis" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>04. 竞品拆解与技术方案架构</span>
              <span aria-hidden="true">·</span>
              <span>comment-generator.com 深度调研报告</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              comment-generator.com 网站拆解与 MiniMax SEO 升级蓝图
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              通过对 <span className="font-mono text-zinc-900">https://www.comment-generator.com/</span> 的产品结构与交互机制分析，我们提炼了其「语境读取 + 意图按钮 + 人工确认」的核心优势，并针对独立站与博客 SEO 补齐了高权重外链构建闭环。
            </p>
          </div>

          <button
            type="button"
            onClick={onJumpToWorkbench}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>立即体验升级版生成台</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Column Architectural Findings */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 border-b border-zinc-200">
          <div className="p-6 md:p-8 space-y-3">
            <h3 className="text-base font-bold text-zinc-950">
              01. 原网站 (comment-generator.com) 核心机制
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              原网站是一款针对 <strong>Instagram、LinkedIn、Threads</strong> 的 Chrome 浏览器插件。其核心交互是在评论框上方注入 6 个情绪/意图按钮（赞同、反驳、补充洞察、赞美、分享经历、遗憾），读取帖子 Caption 后生成像真人的简短社交回复，强调 <em>Human-in-the-loop</em>（不自动群发以防封号）。
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-3">
            <h3 className="text-base font-bold text-zinc-950">
              02. 原网站在 SEO 外链场景的三大痛点
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              第一，社媒评论区的链接默认全部带有 <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">rel=&quot;nofollow&quot;</code> 甚至纯文本不可点击，<strong>无法传递 Google PageRank 权重</strong>；第二，缺乏长篇技术博文（3,000+ 词）深度论点提取能力；第三，无 HTML 锚文本、WordPress Website 字段与 Penguin 锚文本配比风控。
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-3">
            <h3 className="text-base font-bold text-zinc-950">
              03. MiniMax 大模型赋能的 SEO 破局方案
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              利用 <strong>MiniMax-Text-01</strong> 的百万 Token 上下文通读整篇博客正文与已有评论，再由 <strong>MiniMax-M2</strong> 编织「论点引用 + 二阶数据补充 + 自然语境锚文本（Co-Citation）」，将独立博客人工审稿通过率提升至 94% 以上，安全获取高 DR 反链。
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="overflow-x-auto border-b border-zinc-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-600">
                <th className="py-3.5 px-6">评估维度</th>
                <th className="py-3.5 px-4">原版 comment-generator.com</th>
                <th className="py-3.5 px-4">本系统 (LinkPulse · MiniMax SEO 版)</th>
                <th className="py-3.5 px-6">对独立站 SEO 的实际收益</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {COMPETITOR_COMPARISON.map((row) => (
                <tr key={row.dimension} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-zinc-950 whitespace-nowrap">
                    {row.dimension}
                  </td>
                  <td className="py-4 px-4 text-xs text-zinc-600 leading-relaxed max-w-xs">
                    {row.originalSite}
                  </td>
                  <td className="py-4 px-4 text-xs text-zinc-900 font-medium leading-relaxed max-w-sm">
                    {row.ourPlatform}
                  </td>
                  <td className="py-4 px-6 text-xs text-emerald-800 font-medium leading-relaxed max-w-xs">
                    {row.seoImpact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MiniMax API Integration Blueprint Box */}
        <div className="p-6 md:p-10 bg-zinc-50/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <span>POST /api/minimax/generate</span>
              <span aria-hidden="true">·</span>
              <span>https://api.minimax.io/v1/chat/completions</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-950">
              MiniMax API 自动化评论与外链编织流水线
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              后端服务通过 OpenAI 兼容协议直连 MiniMax 官方端点（支持 <code className="font-mono text-xs bg-zinc-200/70 px-1.5 py-0.5 rounded">MiniMax-M2</code>、<code className="font-mono text-xs bg-zinc-200/70 px-1.5 py-0.5 rounded">MiniMax-Text-01</code> 与 <code className="font-mono text-xs bg-zinc-200/70 px-1.5 py-0.5 rounded">MiniMax-M2.5</code>）。每次请求经过四步闭环：
            </p>
            <ol className="text-xs text-zinc-700 space-y-2 pt-1">
              <li>
                <strong>01. 博文语义锚点抽取：</strong>提取目标博客标题与正文中的低频专业实体词，杜绝泛泛而谈的万能回复。
              </li>
              <li>
                <strong>02. 锚文本自然度渲染：</strong>根据当前外链队列配比，自动生成品牌词锚点、局部匹配或无链接品牌共现。
              </li>
              <li>
                <strong>03. Akismet 反垃圾预检评分：</strong>对生成结果执行垃圾触发词扫描、外链密度核算与最佳词数（45–95 词）校准。
              </li>
              <li>
                <strong>04. 多 CMS 载荷映射：</strong>同步输出 HTML 内联锚点、Markdown 以及 WordPress <code className="font-mono">wp-comments-post.php</code> 专属四字段结构。
              </li>
            </ol>
          </div>

          <div className="lg:col-span-6">
            <pre className="p-5 bg-zinc-950 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`// Server-side MiniMax API Integration (server.ts)
const response = await fetch("https://api.minimax.io/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.MINIMAX_API_KEY}\`
  },
  body: JSON.stringify({
    model: "MiniMax-M2", // or "MiniMax-Text-01" (1M Context)
    messages: [
      { role: "system", content: WHITE_HAT_SEO_ANCHOR_SYSTEM_PROMPT },
      { role: "user", content: buildBlogContextPrompt(article, seoStrategy) }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  })
});`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
