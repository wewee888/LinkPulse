import { Zap } from 'lucide-react';
export type NavSectionId =
  | 'workbench'
  | 'extension'
  | 'discovery'
  | 'queue'
  | 'analysis'
  | 'analytics';

interface TopNavProps {
  activeSection: NavSectionId;
  queueCount: number;
  onNavigate: (section: NavSectionId) => void;
  onOpenInstallModal?: () => void;
}

export function TopNav({ activeSection, queueCount, onNavigate, onOpenInstallModal }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('workbench');
          }}
          className="text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0"
        >
          LinkPulse Commenter
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="主导航" className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <button
            type="button"
            onClick={() => onNavigate('workbench')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeSection === 'workbench'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            评论与外链工作台
          </button>
          <button
            type="button"
            onClick={() => onNavigate('extension')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeSection === 'extension'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            Chrome 插件中心
          </button>
          <button
            type="button"
            onClick={() => onNavigate('discovery')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeSection === 'discovery'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            高权重博客机会库
          </button>
          <button
            type="button"
            onClick={() => onNavigate('queue')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeSection === 'queue'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            外链发布队列 ({queueCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeSection === 'analytics'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            SEO 转化效果监控
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onOpenInstallModal) {
                onOpenInstallModal();
              } else {
                onNavigate('extension');
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>一键安装 Chrome 插件</span>
          </button>
        </div>
      </div>
    </header>
  );
}
