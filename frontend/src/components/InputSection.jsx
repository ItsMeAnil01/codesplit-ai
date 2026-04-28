export default function InputSection({
  diffContent,
  setDiffContent,
  onAnalyze,
  onLoadExample,
  loading,
  loadingStatus,
}) {
  const lineCount  = diffContent ? diffContent.split('\n').length : 0;
  const fileCount  = diffContent ? diffContent.split('diff --git').length - 1 : 0;
  const charCount  = diffContent.length;
  const limitPct   = Math.min((charCount / 15000) * 100, 100);
  const nearLimit  = charCount > 12000;

  return (
    <div className="p-8 border-b border-white/5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm">
              📄
            </span>
            Paste your diff
          </h2>
          <p className="text-sm text-slate-500 mt-1 ml-10">
            Git diff, raw patch, or any unified diff format
          </p>
        </div>

        <button
          id="load-example-btn"
          onClick={onLoadExample}
          disabled={loading}
          className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
        >
          <span>✨</span>
          Load example
        </button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="diff-input"
          value={diffContent}
          onChange={(e) => setDiffContent(e.target.value)}
          placeholder={`Paste your git diff here…\n\ndiff --git a/src/index.js b/src/index.js\nindex 1234567..abcdefg 100644\n--- a/src/index.js\n+++ b/src/index.js\n@@ -1,3 +1,5 @@\n+import something from 'somewhere';\n …`}
          className="code-input w-full h-72 p-5 rounded-2xl"
          disabled={loading}
          spellCheck={false}
        />

        {/* Floating char count badge */}
        {diffContent && (
          <div className={`absolute bottom-4 right-4 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
            nearLimit
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : 'bg-slate-800/80 border-white/8 text-slate-500'
          }`}>
            {charCount.toLocaleString()} / 15,000
          </div>
        )}
      </div>

      {/* Limit progress bar */}
      {diffContent && (
        <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              nearLimit
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${limitPct}%` }}
          />
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-4">
          {diffContent && !loading && (
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {lineCount.toLocaleString()} lines
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {fileCount} file{fileCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {loading && loadingStatus && (
            <div className="flex items-center gap-2.5 text-sm text-indigo-400 font-medium">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              {loadingStatus}
            </div>
          )}
        </div>

        {/* Analyse button */}
        <button
          id="analyze-btn"
          onClick={onAnalyze}
          disabled={loading || !diffContent.trim()}
          className="btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2.5">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Analysing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
                Analyse split strategy
              </>
            )}
          </span>
        </button>
      </div>

      {/* Loading bar */}
      {loading && (
        <div className="mt-5">
          <div className="loading-bar" />
        </div>
      )}
    </div>
  );
}
