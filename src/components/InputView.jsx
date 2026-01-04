import { useState, useRef } from "react";
import { API_URL } from "../config";
import { encodeMarkdownForUrl } from "../utils/markdownShare";
import {
  parseShareErrorResponse,
  parseShareNetworkError,
} from "../utils/shareErrors";
import { trackEvent } from "../utils/analytics";

export default function InputView({
  content,
  onChange,
  onStartAnnotating,
  onLoadShareCode,
  error,
}) {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareErrorMessage, setShareErrorMessage] = useState("");
  const [shareUrlError, setShareUrlError] = useState(false);
  const [shareUrlFallback, setShareUrlFallback] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeInputError, setCodeInputError] = useState("");
  const [showShareResult, setShowShareResult] = useState(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [showHelp, setShowHelp] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("specmark_help_collapsed_v1") !== "true";
  });
  const shareErrorTimeoutRef = useRef(null);

  const setShareErrorWithTimeout = (message) => {
    setShareErrorMessage(message);
    if (shareErrorTimeoutRef.current) {
      window.clearTimeout(shareErrorTimeoutRef.current);
    }
    shareErrorTimeoutRef.current = window.setTimeout(() => {
      setShareErrorMessage("");
      shareErrorTimeoutRef.current = null;
    }, 4000);
  };

  const handleShareURL = async () => {
    if (!content.trim()) return;

    // Encode markdown as URL-safe base64 with UTF-8 support
    const encoded = encodeMarkdownForUrl(content);
    const url = `${window.location.origin}${window.location.pathname}?markdown=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setShareErrorMessage("");
      setShareUrlError(false);
      setShareUrlFallback("");
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      setShareUrlError(true);
      setShareUrlFallback(url);
      setShareSuccess(false);
      setTimeout(() => setShareUrlError(false), 3000);
    }
  };

  const handleGetShareCode = async () => {
    if (!content.trim()) return;

    setIsCreatingShare(true);
    setShowShareResult(null);
    try {
      const response = await fetch(`${API_URL}/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "text/markdown",
        },
        body: content,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorInfo = parseShareErrorResponse({
          data,
          status: response.status,
          context: "create",
        });
        throw Object.assign(new Error(errorInfo.message), {
          code: errorInfo.code,
        });
      }

      setShowShareResult(data);
      setShareErrorMessage("");
      trackEvent("Share Create");
    } catch (err) {
      console.error("Failed to create share:", err);
      const message = err?.code
        ? err.message
        : parseShareNetworkError("create").message;
      setShareErrorWithTimeout(message);
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!showShareResult) return;
    try {
      await navigator.clipboard.writeText(showShareResult.url);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyShareCode = async () => {
    if (!showShareResult) return;
    try {
      await navigator.clipboard.writeText(showShareResult.code);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLoadCode = (e) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();

    if (!code) {
      setCodeInputError("Please enter a code");
      return;
    }

    // Basic validation - 6 alphanumeric characters
    if (!/^[2-9A-HJKMNP-Z]{6}$/i.test(code)) {
      setCodeInputError("Invalid code format");
      return;
    }

    setCodeInputError("");
    onLoadShareCode(code);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Specmark Markdown Annotator
            </h1>
            <p className="text-sm text-gray-600 mt-1 hidden sm:block">
              Paste your Markdown specification to annotate and provide feedback
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/cli/"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:text-gray-900 hover:border-gray-300"
            >
              CLI Setup
            </a>
            {/* Start Annotating - prominent on mobile */}
            <button
              onClick={onStartAnnotating}
              disabled={!content.trim()}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (content.trim()) onStartAnnotating();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation"
            >
              <span className="hidden sm:inline">Start Annotating</span>
              <span className="sm:hidden">Annotate</span>
            </button>

            {/* Code entry - hidden on mobile */}
            <form
              onSubmit={handleLoadCode}
              className="hidden sm:flex items-center gap-2"
            >
              <div className="relative">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase());
                    setCodeInputError("");
                  }}
                  placeholder="Enter code"
                  maxLength={6}
                  className={`w-28 px-3 py-1.5 text-sm font-mono uppercase border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    codeInputError ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {codeInputError && (
                  <p className="absolute top-full left-0 mt-1 text-xs text-red-500">
                    {codeInputError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Load
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Code entry - mobile */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleLoadCode} className="flex items-start gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setCodeInputError("");
              }}
              placeholder="Enter share code"
              maxLength={6}
              className={`w-full px-3 py-2 text-sm font-mono uppercase border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                codeInputError ? "border-red-300" : "border-gray-300"
              }`}
            />
            {codeInputError && (
              <p className="mt-1 text-xs text-red-500">{codeInputError}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col p-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Quick guide
              </h2>
              <p className="text-xs text-gray-500">
                Specmark helps you highlight requirements and turn them into
                structured feedback.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !showHelp;
                setShowHelp(next);
                localStorage.setItem(
                  "specmark_help_collapsed_v1",
                  next ? "false" : "true",
                );
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {showHelp ? "Hide" : "Show"}
            </button>
          </div>
          {showHelp && (
            <div className="mt-3 grid gap-3 text-xs text-gray-600 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="font-semibold text-gray-700">1. Paste Markdown</p>
                <p>Add your spec or PRD in the editor.</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="font-semibold text-gray-700">2. Annotate</p>
                <p>Select text to leave specific feedback.</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="font-semibold text-gray-700">3. Copy Feedback</p>
                <p>Export clean Markdown for your LLM agent.</p>
              </div>
              <div className="sm:col-span-3 text-[11px] text-gray-500">
                Share codes are 6 characters and expire after 7 days.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-gray-500">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            i
          </span>
          <p>
            Shares expire after 7 days. Annotations are saved locally in your
            browser (localStorage).
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <label
            htmlFor="markdown-input"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Markdown Content
          </label>
          <textarea
            id="markdown-input"
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="Paste your Markdown specification here..."
            value={content}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            onClick={() => onChange("")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
          <button
            onClick={handleShareURL}
            disabled={!content.trim()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {shareSuccess ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                URL Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share URL
              </>
            )}
          </button>
          <button
            onClick={handleGetShareCode}
            disabled={!content.trim() || isCreatingShare}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingShare ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                Get Share Code
              </>
            )}
          </button>
          <div className="flex-1" />
          <button
            onClick={onStartAnnotating}
            disabled={!content.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Annotating
          </button>
        </div>

        {shareUrlFallback && (
          <div className="mt-3 w-full">
            <p
              className={`text-xs ${shareUrlError ? "text-red-500" : "text-gray-500"}`}
            >
              {shareUrlError
                ? "Clipboard failed — copy the URL below."
                : "Copy URL:"}
            </p>
            <input
              type="text"
              readOnly
              value={shareUrlFallback}
              onFocus={(e) => e.target.select()}
              className="mt-1 w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-md"
            />
          </div>
        )}
      </div>

      {/* Share result modal */}
      {showShareResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Share Code Created
              </h2>
              <button
                onClick={() => setShowShareResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Code display */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Code
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-3xl font-mono font-bold text-blue-600 tracking-widest">
                    {showShareResult.code}
                  </code>
                  <button
                    onClick={handleCopyShareCode}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                    title="Copy code"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* URL display */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={showShareResult.url}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-200 rounded-md"
                  />
                  <button
                    onClick={handleCopyShareUrl}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                    title="Copy URL"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expiration notice */}
              <p className="text-sm text-gray-500">
                Expires:{" "}
                {new Date(showShareResult.expiresAt).toLocaleDateString()} (
                {Math.ceil(
                  (new Date(showShareResult.expiresAt) - new Date()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days)
              </p>
            </div>

            <button
              onClick={() => setShowShareResult(null)}
              className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error toast */}
      {(shareErrorMessage || error) && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {shareErrorMessage || error}
        </div>
      )}
    </div>
  );
}
