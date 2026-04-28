import { useState } from 'react';

const RISK_STYLES = {
  LOW:    { cls: 'risk-low',    icon: '▲', label: 'Low risk'    },
  MEDIUM: { cls: 'risk-medium', icon: '◆', label: 'Medium risk' },
  HIGH:   { cls: 'risk-high',   icon: '●', label: 'High risk'   },
};

const PR_ACCENT_COLORS = [
  'from-indigo-600 to-purple-600',
  'from-blue-600 to-indigo-600',
  'from-violet-600 to-fuchsia-600',
  'from-sky-600 to-blue-600',
  'from-purple-600 to-pink-600',
];

export default function PRCard({ pr, index, toastAPI }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const risk    = RISK_STYLES[pr.riskLevel] || RISK_STYLES.LOW;
  const accent  = PR_ACCENT_COLORS[index % PR_ACCENT_COLORS.length];

  const handleCopyFiles = () => {
    navigator.clipboard.writeText(pr.files.join('\n'));
    setCopied(true);
    toastAPI?.add('File list copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 group">
      {/* Card header */}
      <div className={`bg-gradient-to-r ${accent} p-5 flex items-start justify-between gap-3`}>
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-white text-sm flex-shrink-0 border border-white/20">
            {index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white leading-snug truncate">{pr.title}</h3>
            <p className="text-xs text-white/60 mt-0.5 font-mono">PR #{index + 1} of this series</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all flex-shrink-0 border border-white/10"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-0' : 'rotate-180'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>

      {/* Collapsed summary strip */}
      {!expanded && (
        <div className="px-5 py-3 flex items-center gap-4 text-xs text-slate-500 border-t border-white/5">
          <span>{pr.files.length} file{pr.files.length !== 1 ? 's' : ''}</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="text-blue-400">+{pr.linesAdded} added</span>
          <span className="w-px h-3 bg-white/10" />
          <span>{pr.reviewTimeMinutes}min review</span>
          <span className="w-px h-3 bg-white/10" />
          <span className={`badge text-xs ${risk.cls}`}>{risk.label}</span>
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="p-5 space-y-5">
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Lines added',   value: `+${pr.linesAdded}`,        color: 'text-emerald-400' },
              { label: 'Modified',      value: `~${pr.linesModified}`,     color: 'text-blue-400'    },
              { label: 'Review time',   value: `${pr.reviewTimeMinutes}m`, color: 'text-purple-400'  },
            ].map(s => (
              <div key={s.label} className="stat-card p-4 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Files */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Files
                <span className="badge bg-slate-700/60 text-slate-400 border-slate-600/40 text-xs">
                  {pr.files.length}
                </span>
              </h4>
              <button
                onClick={handleCopyFiles}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                {copied ? (
                  <><span className="text-emerald-400">✓</span> Copied</>
                ) : (
                  <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy</>
                )}
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {pr.files.map((file, i) => (
                <div key={i} className="file-tag">
                  <svg className="w-3 h-3 text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why this order */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
              Why this order
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed p-4 rounded-xl bg-white/3 border border-white/5">
              {pr.whyThisOrder}
            </p>
          </div>

          {/* Dependencies */}
          {pr.dependencies?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Dependencies
              </h4>
              <ul className="space-y-1.5">
                {pr.dependencies.map((dep, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="text-indigo-500 mt-0.5 text-xs font-mono">→</span>
                    {dep}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk & Testing */}
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-slate-400">Risk:</span>
              <span className={`badge text-xs ${risk.cls}`}>
                <span className="text-xs">{risk.icon}</span>
                {risk.label}
              </span>
              {pr.riskReason && (
                <span className="text-xs text-slate-600 italic">— {pr.riskReason}</span>
              )}
            </div>
          </div>

          {pr.testingSteps?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Testing checklist
              </h4>
              <ol className="space-y-2">
                {pr.testingSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
