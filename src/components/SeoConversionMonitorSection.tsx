import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  BacklinkQueueItem,
  DailyIndexationPoint,
  buildSeoConversionAnalytics,
} from '../utils/seoEngine';

interface SeoConversionMonitorSectionProps {
  queueItems: BacklinkQueueItem[];
}

export function SeoConversionMonitorSection({
  queueItems,
}: SeoConversionMonitorSectionProps) {
  const [dayRange, setDayRange] = useState<30 | 14 | 7>(30);
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');
  const [selectedDay, setSelectedDay] = useState<DailyIndexationPoint | null>(null);

  const trendSvgRef = useRef<SVGSVGElement | null>(null);
  const drSvgRef = useRef<SVGSVGElement | null>(null);
  const spamSvgRef = useRef<SVGSVGElement | null>(null);

  const analytics = useMemo(
    () => buildSeoConversionAnalytics(queueItems),
    [queueItems]
  );

  const visibleSeries = useMemo(
    () => analytics.series30d.slice(30 - dayRange),
    [analytics.series30d, dayRange]
  );

  const activePoint =
    selectedDay && visibleSeries.some((d) => d.date === selectedDay.date)
      ? selectedDay
      : visibleSeries[visibleSeries.length - 1];

  // 1. D3.js 30-Day Backlink Indexation Trend Line Chart
  useEffect(() => {
    const svgEl = trendSvgRef.current;
    if (!svgEl || visibleSeries.length === 0) return;

    const width = 920;
    const height = 290;
    const margin = { top: 24, right: 28, bottom: 38, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint<string>()
      .domain(visibleSeries.map((d) => d.shortDate))
      .range([0, innerWidth])
      .padding(0.2);

    const maxY =
      d3.max(visibleSeries, (d) =>
        chartMode === 'daily' ? d.publishedCount : d.cumulativePublished
      ) || 10;

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxY * 1.15)])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal grid lines
    const yTicks = yScale.ticks(5);
    g.selectAll('.grid-line')
      .data(yTicks)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#E4E4E7')
      .attr('stroke-dasharray', '3,3');

    // Area under Indexed line
    const indexedArea = d3
      .area<DailyIndexationPoint>()
      .x((d) => xScale(d.shortDate) ?? 0)
      .y0(innerHeight)
      .y1((d) =>
        yScale(chartMode === 'daily' ? d.indexedCount : d.cumulativeIndexed)
      )
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(visibleSeries)
      .attr('fill', '#16A34A')
      .attr('fill-opacity', 0.08)
      .attr('d', indexedArea);

    // Line 1: Published Backlinks
    const publishedLine = d3
      .line<DailyIndexationPoint>()
      .x((d) => xScale(d.shortDate) ?? 0)
      .y((d) =>
        yScale(chartMode === 'daily' ? d.publishedCount : d.cumulativePublished)
      )
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(visibleSeries)
      .attr('fill', 'none')
      .attr('stroke', '#71717A')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,4')
      .attr('d', publishedLine);

    // Line 2: Google Indexed Backlinks
    const indexedLine = d3
      .line<DailyIndexationPoint>()
      .x((d) => xScale(d.shortDate) ?? 0)
      .y((d) =>
        yScale(chartMode === 'daily' ? d.indexedCount : d.cumulativeIndexed)
      )
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(visibleSeries)
      .attr('fill', 'none')
      .attr('stroke', '#09090B')
      .attr('stroke-width', 2.5)
      .attr('d', indexedLine);

    // X Axis
    const tickStride = visibleSeries.length > 20 ? 3 : visibleSeries.length > 10 ? 2 : 1;
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        visibleSeries
          .filter((_, idx) => idx % tickStride === 0 || idx === visibleSeries.length - 1)
          .map((d) => d.shortDate)
      )
      .tickSizeOuter(0);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((axisG) => axisG.select('.domain').attr('stroke', '#D4D4D8'))
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#52525B')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '11px')
      );

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSizeOuter(0);
    g.append('g')
      .call(yAxis)
      .call((axisG) => axisG.select('.domain').remove())
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#52525B')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '11px')
      );

    // Data points for Published
    g.selectAll('.dot-published')
      .data(visibleSeries)
      .join('circle')
      .attr('class', 'dot-published')
      .attr('cx', (d) => xScale(d.shortDate) ?? 0)
      .attr('cy', (d) =>
        yScale(chartMode === 'daily' ? d.publishedCount : d.cumulativePublished)
      )
      .attr('r', 3)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#71717A')
      .attr('stroke-width', 1.5);

    // Interactive Data points for Indexed
    g.selectAll('.dot-indexed')
      .data(visibleSeries)
      .join('circle')
      .attr('class', 'dot-indexed')
      .attr('cx', (d) => xScale(d.shortDate) ?? 0)
      .attr('cy', (d) =>
        yScale(chartMode === 'daily' ? d.indexedCount : d.cumulativeIndexed)
      )
      .attr('r', (d) => (activePoint?.date === d.date ? 5.5 : 3.5))
      .attr('fill', (d) => (activePoint?.date === d.date ? '#16A34A' : '#09090B'))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => {
        setSelectedDay(d);
      })
      .on('click', (_event, d) => {
        setSelectedDay(d);
      });
  }, [visibleSeries, chartMode, activePoint]);

  // 2. D3.js Domain Rating (DR) Distribution Grouped Bar Chart
  useEffect(() => {
    const svgEl = drSvgRef.current;
    if (!svgEl) return;

    const width = 440;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 34, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand<string>()
      .domain(analytics.drBuckets.map((d) => d.tier))
      .range([0, innerWidth])
      .paddingInner(0.28)
      .paddingOuter(0.14);

    const x1 = d3
      .scaleBand<string>()
      .domain(['totalLinks', 'dofollowCount'])
      .range([0, x0.bandwidth()])
      .padding(0.12);

    const maxVal = d3.max(analytics.drBuckets, (d) => d.totalLinks) || 10;
    const y = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.2)])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines
    g.selectAll('.dr-grid')
      .data(y.ticks(4))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#E4E4E7')
      .attr('stroke-dasharray', '3,3');

    const bucketGroup = g
      .selectAll('.bucket-group')
      .data(analytics.drBuckets)
      .join('g')
      .attr('class', 'bucket-group')
      .attr('transform', (d) => `translate(${x0(d.tier) ?? 0},0)`);

    // Bar 1: Total Links
    bucketGroup
      .append('rect')
      .attr('x', x1('totalLinks') ?? 0)
      .attr('y', (d) => y(d.totalLinks))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => innerHeight - y(d.totalLinks))
      .attr('rx', 3)
      .attr('fill', '#A1A1AA');

    // Bar 2: DoFollow Links
    bucketGroup
      .append('rect')
      .attr('x', x1('dofollowCount') ?? 0)
      .attr('y', (d) => y(d.dofollowCount))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => innerHeight - y(d.dofollowCount))
      .attr('rx', 3)
      .attr('fill', '#09090B');

    // Value labels above DoFollow bars
    bucketGroup
      .append('text')
      .attr('x', (x1('dofollowCount') ?? 0) + x1.bandwidth() / 2)
      .attr('y', (d) => y(d.dofollowCount) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#09090B')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .text((d) => d.dofollowCount);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call((axisG) => axisG.select('.domain').attr('stroke', '#D4D4D8'))
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#3F3F46')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '11px')
      );

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
      .call((axisG) => axisG.select('.domain').remove())
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#52525B')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '11px')
      );
  }, [analytics.drBuckets]);

  // 3. D3.js Akismet Spam Score Distribution Chart
  useEffect(() => {
    const svgEl = spamSvgRef.current;
    if (!svgEl) return;

    const width = 440;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 34, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand<string>()
      .domain(analytics.spamBuckets.map((d) => d.band))
      .range([0, innerWidth])
      .padding(0.35);

    const maxCount = d3.max(analytics.spamBuckets, (d) => d.count) || 10;
    const y = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxCount * 1.2)])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines
    g.selectAll('.spam-grid')
      .data(y.ticks(4))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#E4E4E7')
      .attr('stroke-dasharray', '3,3');

    // Bars
    g.selectAll('.spam-bar')
      .data(analytics.spamBuckets)
      .join('rect')
      .attr('class', 'spam-bar')
      .attr('x', (d) => x(d.band) ?? 0)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.count))
      .attr('rx', 4)
      .attr('fill', (_, idx) =>
        idx === 0
          ? '#16A34A'
          : idx === 1
          ? '#09090B'
          : idx === 2
          ? '#D97706'
          : '#DC2626'
      );

    // Percentage labels above bars
    g.selectAll('.spam-label')
      .data(analytics.spamBuckets)
      .join('text')
      .attr('x', (d) => (x(d.band) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#18181B')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .text((d) => `${d.count}条 (${d.percentage}%)`);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((axisG) => axisG.select('.domain').attr('stroke', '#D4D4D8'))
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#3F3F46')
          .style('font-family', 'var(--font-sans)')
          .style('font-size', '11px')
      );

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
      .call((axisG) => axisG.select('.domain').remove())
      .call((axisG) =>
        axisG
          .selectAll('text')
          .attr('fill', '#52525B')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '11px')
      );
  }, [analytics.spamBuckets]);

  return (
    <section id="analytics" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1360px] mx-auto border-x border-zinc-200">
        {/* Section Header */}
        <div className="p-6 md:p-10 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>05. SEO 转化效果监控</span>
              <span aria-hidden="true">·</span>
              <span>D3.js 30 天外链收录趋势</span>
              <span aria-hidden="true">·</span>
              <span>DR 权重与垃圾分统计图</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              SEO 转化效果监控与外链收录归因看板
            </h2>
            <p className="text-sm text-zinc-600 max-w-2xl">
              实时追踪过去 30 天通过 MiniMax 生成并发布的博客评论外链收录曲线、获链域名权重（DR）梯度以及 Akismet 垃圾风险分统计。
            </p>
          </div>

          {/* Interactive Controls for D3 Charts */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="选择趋势统计周期"
              className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
            >
              {(
                [
                  { days: 30, label: '过去 30 天' },
                  { days: 14, label: '过去 14 天' },
                  { days: 7, label: '过去 7 天' },
                ] as const
              ).map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setDayRange(item.days)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    dayRange === item.days
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="切换折线图统计维度"
              className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setChartMode('daily')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  chartMode === 'daily'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                单日发布与收录
              </button>
              <button
                type="button"
                onClick={() => setChartMode('cumulative')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  chartMode === 'cumulative'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                30 天累计收录曲线
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 border-b border-zinc-200 bg-zinc-50/40">
          <div className="p-6 space-y-1">
            <span className="text-xs text-zinc-500">30 天累计发布评论外链</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-950">
              {analytics.summary.totalPublished30d} 条
            </p>
            <p className="text-xs text-zinc-500">
              带来长尾引流点击 {analytics.summary.totalReferralClicks30d.toLocaleString()} 次
            </p>
          </div>

          <div className="p-6 space-y-1">
            <span className="text-xs text-zinc-500">Google 已收录外链 / 收录率</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {analytics.summary.totalIndexed30d} 条 ({analytics.summary.indexationRatePct}%)
            </p>
            <p className="text-xs text-zinc-500">平均抓取收录周期 36 小时</p>
          </div>

          <div className="p-6 space-y-1">
            <span className="text-xs text-zinc-500">获链博客加权域名权重 (DR)</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-950">
              DR {analytics.summary.avgDomainRating}
            </p>
            <p className="text-xs text-zinc-500">DR 70+ 高权重独立站点占比 86%</p>
          </div>

          <div className="p-6 space-y-1">
            <span className="text-xs text-zinc-500">平均 Akismet 垃圾风险分</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-950">
              {analytics.summary.avgSpamScore} / 100
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              处于绿灯免审安全区间 (&lt; 10/100)
            </p>
          </div>
        </div>

        {/* Main D3.js 30-Day Indexation Trend Line Chart */}
        <div className="p-6 md:p-8 border-b border-zinc-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-zinc-950">
                过去 {dayRange} 天评论外链发布与 Google 收录趋势图 (D3.js 折线图)
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-950 inline-block" />
                  <span>Google 已收录外链 (实线)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-500 border-b border-dashed border-zinc-500 inline-block" />
                  <span>已发布评论外链 (虚线)</span>
                </span>
              </div>
            </div>

            {activePoint && (
              <div
                aria-live="polite"
                className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono tabular-nums text-zinc-700 flex flex-wrap items-center gap-3"
              >
                <span className="font-semibold text-zinc-950">日期 {activePoint.date}</span>
                <span aria-hidden="true">·</span>
                <span>当日发布: {activePoint.publishedCount} 条</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">
                  当日收录: {activePoint.indexedCount} 条
                </span>
                <span aria-hidden="true">·</span>
                <span>累计收录: {activePoint.cumulativeIndexed} 条</span>
                <span aria-hidden="true">·</span>
                <span>引流点击: {activePoint.referralClicks} 次</span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              ref={trendSvgRef}
              data-testid="d3-indexation-trend-chart"
              role="img"
              aria-label="过去 30 天发布的评论外链收录趋势折线图"
              className="w-full h-auto min-w-[640px] max-h-[310px]"
            />
          </div>
        </div>

        {/* Bottom 2-Column Split: DR Distribution Chart & Spam Score Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {/* Left: Domain Rating (DR) Distribution Chart */}
          <div className="lg:col-span-6 p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-zinc-950">
                  域名权重（DR）梯度与 DoFollow 统计图 (D3.js)
                </h3>
                <p className="text-xs text-zinc-500">
                  对比各 DR 区间段的总获链数（浅灰）与 DoFollow 传递权重外链数（深黑）
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-zinc-600">
                平均 DR {analytics.summary.avgDomainRating}
              </span>
            </div>

            <div className="w-full">
              <svg
                ref={drSvgRef}
                data-testid="d3-dr-distribution-chart"
                role="img"
                aria-label="域名权重 DR 分布与 DoFollow 外链统计柱状图"
                className="w-full h-auto max-h-[240px]"
              />
            </div>

            {/* DR Tier Breakdown Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-200">
              {analytics.drBuckets.map((b) => (
                <div key={b.tier} className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-zinc-950">{b.tier}</p>
                  <p className="text-xs text-zinc-500 truncate">{b.rangeLabel}</p>
                  <p className="text-xs font-mono tabular-nums text-zinc-700">
                    共 {b.totalLinks} · DoFollow {b.dofollowCount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Spam Score Distribution Chart */}
          <div className="lg:col-span-6 p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-zinc-950">
                  Akismet 垃圾风险分数（Spam Score）分布图 (D3.js)
                </h3>
                <p className="text-xs text-zinc-500">
                  统计已发布评论在 4 个垃圾风险分段的占比，确保 90%+ 处于免审与高过审区
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-700 font-semibold">
                均值 {analytics.summary.avgSpamScore}/100
              </span>
            </div>

            <div className="w-full">
              <svg
                ref={spamSvgRef}
                data-testid="d3-spam-score-chart"
                role="img"
                aria-label="Akismet 垃圾风险分数统计柱状图"
                className="w-full h-auto max-h-[240px]"
              />
            </div>

            {/* Spam Band Breakdown Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-200">
              {analytics.spamBuckets.map((b) => (
                <div key={b.band} className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-zinc-950">
                    {b.band} ({b.percentage}%)
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{b.rangeLabel}</p>
                  <p className="text-xs font-mono tabular-nums text-zinc-700">
                    {b.count} 条 · {b.statusLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
