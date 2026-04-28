import PRCard from './PRCard';

const STAT_COLORS = [
  { from: 'from-indigo-500/20', to: 'to-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  { from: 'from-blue-500/20',   to: 'to-blue-500/5',   border: 'border-blue-500/20',   text: 'text-blue-400',   dot: 'bg-blue-500'   },
  { from: 'from-emerald-500/20',to: 'to-emerald-500/5', border: 'border-emerald-500/20',text: 'text-emerald-400',dot: 'bg-emerald-500' },
  { from: 'from-amber-500/20',  to: 'to-amber-500/5',   border: 'border-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-500'  },
];

export default function AnalysisResult({ analysis, toastAPI }) {
  const { prs, summary, metadata } = analysis;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'codesplit-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
    toastAPI?.add('Report downloaded!');
  };

  const stats = [
    { label: 'Recommended PRs',     value: summary.totalPRs,          suffix: ''    },
    { label: 'Original review time',value: summary.originalReviewTime, suffix: 'min' },
    { label: 'After split',          value: summary.totalReviewTime,    suffix: 'min' },
    { label: 'Time saved',           value: summary.timeSaved,          suffix: 'min' },
  ];

  return (
    <div className="p-8 section-enter">
      {/* ── Result header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm">
              📊
            </span>
            <h2 className="text-xl font-bold text-white">Split Strategy</h2>
          </div>
          <p className="text-sm text-slate-500 ml-10">
            Strategy: <span className="text-indigo-400 font-medium">{summary.strategy}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {metadata.mode === 'fallback' && (
            <span className="badge bg-amber-500/12 text-amber-400 border border-amber-500/25 text-xs">
              Demo Mode
            </span>
          )}
          <span className="badge bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {metadata.processingTime}ms
          </span>
          <button
            id="download-report-btn"
            onClick={handleDownload}
            className="btn-ghost px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => {
          const c = STAT_COLORS[i];
          return (
            <div key={s.label} className={`stat-card p-5 bg-gradient-to-br ${c.from} ${c.to} border ${c.border}`}>
              <div className={`text-3xl font-black mb-1 animate-count ${c.text}`}>
                {s.value}{s.suffix}
              </div>
              <div className="text-xs text-slate-500 font-medium leading-snug">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── PR Cards ── */}
      <div className="space-y-5">
        {prs.map((pr, index) => (
          <div key={index}>
            <PRCard pr={pr} index={index} toastAPI={toastAPI} />

            {index < prs.length - 1 && (
              <div className="divider-arrow py-5 px-4 text-xs text-slate-600">
                <svg className="w-4 h-4 text-indigo-500/50 animate-bounce-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                merge first, then
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
