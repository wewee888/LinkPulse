import { useState } from 'react';
import {
  AnchorType,
  BacklinkQueueItem,
  analyzeAnchorDistribution,
} from '../utils/seoEngine';
import { Check, Download, Play, Trash2 } from 'lucide-react';

interface BacklinkQueueSectionProps {
  queueItems: BacklinkQueueItem[];
  onDispatchItem: (id: string) => Promise<void>;
  onDispatchAllQueued: () => Promise<void>;
  onRemoveItem: (id: string) => void;
}

const ANCHOR_LABELS: Record<AnchorType, string> = {
  branded: '品牌词锚文本 (Branded)',
  partial_match: '局部语境匹配 (Partial Match)',
  naked_url: '裸链接 URL (Naked URL)',
  generic: '通用引导词 (Generic)',
  exact_match: '精准匹配词 (Exact Match)',
};

const STATUS_LABELS: Record<BacklinkQueueItem['status'], string> = {
  queued: '待发布 · Queued',
  verifying: '投递校验中 · Verifying',
  published: '已发布待收录 · Published',
  indexed: 'Google 已收录 · Indexed',
};

export function BacklinkQueueSection({
  queueItems,
  onDispatchItem,
  onDispatchAllQueued,
  onRemoveItem,
}: BacklinkQueueSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | BacklinkQueueItem['status']>('all');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isBatchDispatching, setIsBatchDispatching] = useState(false);

  const distribution = analyzeAnchorDistribution(queueItems);

  const filteredItems = queueItems.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter
  );

  const queuedCount = queueItems.filter((i) => i.status === 'queued').length;
  const publishedOrIndexedCount = queueItems.filter(
    (i) => i.status === 'published' || i.status === 'indexed'
  ).length;
  const avgDr = queueItems.length
    ? Math.round(queueItems.reduce((acc, i) => acc + i.domainRating, 0) / queueItems.length)
    : 0;

  const handleSingleDispatch = async (id: string) => {
    setDispatchingId(id);
    try {
      await onDispatchItem(id);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleBatchDispatch = async () => {
    setIsBatchDispatching(true);
    try {
      await onDispatchAllQueued();
    } finally {
      setIsBatchDispatching(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Blog Domain',
      'CMS',
      'DR',
      'Link Attribute',
      'Anchor Type',
      'Anchor Text',
      'Target URL',
      'Spam Score',
      'Status',
      'Model',
    ];
    const rows = queueItems.map((i) => [
      i.id,
      i.blogDomain,
      i.cmsPlatform,
      String(i.domainRating),
      i.linkAttribute,
      i.anchorType,
      `"${i.anchorText.replace(/"/g, '""')}"`,
      i.targetUrl,
      String(i.spamScore),
      i.status,
      i.modelUsed,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkpulse-backlinks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="queue" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Section Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>03. 外链发布策略与风控队列</span>
              <span aria-hidden="true">·</span>
              <span>Google Penguin 锚文本配比监控</span>
              <span aria-hidden="true">·</span>
              <span>半自动投递</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              外链自动化发布策略与锚文本安全图谱
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出外链报表 CSV</span>
            </button>

            <button
              type="button"
              onClick={handleBatchDispatch}
              disabled={queuedCount === 0 || isBatchDispatching}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {isBatchDispatching
                  ? '正在批量投递预检...'
                  : `一键执行待发布外链投递 (${queuedCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* Anchor Distribution & Penguin Safety Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-zinc-200">
          {/* Left: Anchor Type Breakdown */}
          <div className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-zinc-200 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-950">
                五维锚文本分布图谱 (Anchor Text Diversity Matrix)
              </h3>
              <span className="text-xs font-mono tabular-nums text-zinc-500">
                总计 {distribution.total} 条外链任务
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {(
                ['branded', 'partial_match', 'naked_url', 'generic', 'exact_match'] as AnchorType[]
              ).map((type) => {
                const pct = distribution.percentages[type];
                const count = distribution.counts[type];
                return (
                  <div
                    key={type}
                    className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2"
                  >
                    <p className="text-xs font-medium text-zinc-600 truncate">
                      {ANCHOR_LABELS[type]}
                    </p>
                    <div className="flex items-baseline justify-between font-mono tabular-nums">
                      <span className="text-xl font-bold text-zinc-950">{pct}%</span>
                      <span className="text-xs text-zinc-500">{count} 条</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          type === 'exact_match' && pct > 25 ? 'bg-red-600' : 'bg-zinc-950'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              <strong className="text-zinc-900">策略诊断建议：</strong>
              {distribution.recommendation}
            </p>
          </div>

          {/* Right: Summary Telemetry */}
          <div className="lg:col-span-4 p-6 md:p-8 bg-zinc-50/60 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500">Google Penguin 算法安全指数</span>
              <p className="text-3xl font-bold font-mono tabular-nums text-zinc-950">
                {distribution.penguinSafetyScore} / 100
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200">
              <div>
                <span className="text-xs text-zinc-500 block">已生效/已收录外链</span>
                <span className="text-lg font-bold font-mono tabular-nums text-zinc-950">
                  {publishedOrIndexedCount} / {queueItems.length}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">目标站点平均权重</span>
                <span className="text-lg font-bold font-mono tabular-nums text-zinc-950">
                  DR {avgDr}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar for Queue Table */}
        <div className="px-6 py-3.5 border-b border-zinc-200 bg-zinc-50/40 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="按外链发布状态筛选"
            className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
          >
            {(
              [
                { id: 'all', label: `全部任务 (${queueItems.length})` },
                { id: 'queued', label: `待发布 (${queuedCount})` },
                {
                  id: 'published',
                  label: `已发布 (${queueItems.filter((i) => i.status === 'published').length})`,
                },
                {
                  id: 'indexed',
                  label: `已收录 (${queueItems.filter((i) => i.status === 'indexed').length})`,
                },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-500">
            点击「执行自动发布检测」将模拟或触发目标博客 CMS 评论端点校验与投递
          </span>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-600">
                <th className="py-3.5 px-6">目标博客与评论摘要</th>
                <th className="py-3.5 px-4">锚文本与目标着陆页</th>
                <th className="py-3.5 px-4 text-right">DR / 属性</th>
                <th className="py-3.5 px-4">状态与生成模型</th>
                <th className="py-3.5 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center text-sm text-zinc-500">
                    当前筛选状态下暂无外链任务。可在上方「MiniMax 工作台」生成评论并点击「加入外链发布队列」。
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                          <span className="font-semibold text-zinc-900">{item.blogDomain}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.cmsPlatform}</span>
                          <span aria-hidden="true">·</span>
                          <span>Spam {item.spamScore}/100</span>
                        </div>
                        <p className="text-xs font-medium text-zinc-900 line-clamp-1">
                          {item.blogTitle}
                        </p>
                        <p className="text-xs text-zinc-600 line-clamp-2">{item.commentExcerpt}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-zinc-950 truncate">
                          锚文本：{item.anchorText}
                        </p>
                        <p className="text-xs font-mono text-zinc-500 truncate">
                          → {item.targetUrl}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="text-xs font-bold text-zinc-950">DR {item.domainRating}</div>
                      <div className="text-xs text-zinc-500">rel=&quot;{item.linkAttribute}&quot;</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      <div
                        className={
                          item.status === 'indexed' || item.status === 'published'
                            ? 'font-semibold text-emerald-700'
                            : 'font-semibold text-amber-700'
                        }
                      >
                        {STATUS_LABELS[item.status]}
                      </div>
                      <div className="font-mono text-zinc-500 mt-0.5">
                        {item.modelUsed} · {item.createdAt}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {item.status === 'queued' ? (
                          <button
                            type="button"
                            onClick={() => handleSingleDispatch(item.id)}
                            disabled={dispatchingId === item.id}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {dispatchingId === item.id ? '投递中...' : '执行自动发布检测'}
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium text-emerald-800 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>已生效</span>
                          </span>
                        )}

                        <button
                          type="button"
                          aria-label={`删除 ${item.blogDomain} 的外链任务`}
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
