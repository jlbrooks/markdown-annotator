export default function AnnotationList({
  annotations,
  onDeleteAnnotation,
  onClearAnnotations,
  onEditAnnotation,
  exportSettings,
  onExportSettingsChange,
  onClose,
  className = '',
  onHeaderTouchStart,
  onHeaderTouchMove,
}) {
  return (
    <div className={`h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}>
      <div
        className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50"
        onTouchStart={onHeaderTouchStart}
        onTouchMove={onHeaderTouchMove}
        style={onHeaderTouchStart ? { touchAction: 'none' } : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-gray-700">
              Feedback ({annotations.length})
            </h2>
            <span className="text-[10px] text-gray-400">Swipe down to close</span>
          </div>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          {annotations.length > 0 && (
            <button
              onClick={onClearAnnotations}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
              title="Clear all"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {onExportSettingsChange && exportSettings && (
          <details className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-gray-600">
              Export settings
            </summary>
            <div className="mt-3 space-y-3">
              <label className="block text-xs font-medium text-gray-600">
                Header / prefix
                <textarea
                  rows={3}
                  value={exportSettings.header}
                  onChange={(event) => onExportSettingsChange({
                    ...exportSettings,
                    header: event.target.value,
                  })}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="Add a header or context for your feedback"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={exportSettings.includeLineNumbers}
                  onChange={(event) => onExportSettingsChange({
                    ...exportSettings,
                    includeLineNumbers: event.target.checked,
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include line numbers in quoted selections
              </label>
            </div>
          </details>
        )}
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              if (!onEditAnnotation) return
              const rect = event.currentTarget.getBoundingClientRect()
              onEditAnnotation(annotation, rect, event.currentTarget)
            }}
            onKeyDown={(event) => {
              if (!onEditAnnotation) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                const rect = event.currentTarget.getBoundingClientRect()
                onEditAnnotation(annotation, rect, event.currentTarget)
              }
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2 line-clamp-2">
                  "{annotation.selectedText}"
                </p>
                <p className="text-sm text-gray-700">{annotation.comment}</p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteAnnotation(annotation.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
