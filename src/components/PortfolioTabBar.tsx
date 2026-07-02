"use client";

import { useState, useRef, useEffect } from "react";

export interface PortfolioTab {
  id: string;
  name: string;
  symbols: string[]; // empty = "All" (main tab)
}

interface Props {
  tabs: PortfolioTab[];
  activeTabId: string;
  allSymbols: string[]; // all stock symbols in the portfolio
  onTabChange: (id: string) => void;
  onTabAdd: () => void;
  onTabRename: (id: string, name: string) => void;
  onTabDelete: (id: string) => void;
  onTabSymbolsChange: (id: string, symbols: string[]) => void;
}

export const ALL_TAB_ID = "all";

export default function PortfolioTabBar({
  tabs,
  activeTabId,
  allSymbols,
  onTabChange,
  onTabAdd,
  onTabRename,
  onTabDelete,
  onTabSymbolsChange,
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showPickerFor, setShowPickerFor] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const startRename = (tab: PortfolioTab) => {
    setRenamingId(tab.id);
    setRenameValue(tab.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onTabRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <>
      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isAll = tab.id === ALL_TAB_ID;

          return (
            <div key={tab.id} className="relative flex-shrink-0 group">
              {renamingId === tab.id ? (
                /* ── Rename input ── */
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 border-blue-500 bg-blue-50 dark:bg-gray-800 outline-none w-28 text-gray-500 dark:text-gray-400"
                />
              ) : (
                /* ── Tab pill ── */
                <button
                  onClick={() => onTabChange(tab.id)}
                  onDoubleClick={() => !isAll && startRename(tab)}
                  title={isAll ? "All stocks" : "Double-click to rename"}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-blue-500 text-blue-600 bg-white dark:bg-gray-800"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 bg-transparent"
                  }`}
                >
                  {isAll ? "📊" : "🗂️"} {tab.name}
                  {!isAll && isActive && (
                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                      ({tab.symbols.length})
                    </span>
                  )}
                  {/* Delete button — visible on hover */}
                  {!isAll && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabDelete(tab.id);
                      }}
                      className="ml-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer leading-none"
                      title="Delete tab"
                    >
                      ×
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {/* ── Add Tab ── */}
        <button
          onClick={onTabAdd}
          title="Add new group tab"
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:bg-gray-800 rounded-t-lg transition-all"
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* ── Manage stocks button (for custom tabs) ─────────────── */}
      {activeTab && activeTab.id !== ALL_TAB_ID && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab.symbols.length === 0
              ? "No stocks in this group yet."
              : `${activeTab.symbols.length} stock${
                  activeTab.symbols.length > 1 ? "s" : ""
                } in this group`}
          </span>
          <button
            title="Add/remove stocks"
            onClick={() => setShowPickerFor(activeTab.id)}
            className="flex items-center gap-1.5 rounded-md border border-blue-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            🗃️ Manage Port
          </button>
          <button
            onClick={() => startRename(activeTab)}
            title="Rename tab"
            className="flex items-center gap-1.5 rounded-md border border-blue-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            ✏️ Rename Tab
          </button>
          <button
            onClick={() => onTabDelete(activeTab.id)}
            title="Delete tab"
            className="flex items-center gap-1.5 rounded-md border border-blue-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            🗑️ Delete Tab
          </button>
        </div>
      )}

      {/* ── Stock Picker Modal ──────────────────────────────────── */}
      {showPickerFor &&
        (() => {
          const tab = tabs.find((t) => t.id === showPickerFor);
          if (!tab) return null;

          const selected = new Set(tab.symbols);

          const toggle = (sym: string) => {
            const next = new Set(selected);
            next.has(sym) ? next.delete(sym) : next.add(sym);
            onTabSymbolsChange(showPickerFor, Array.from(next));
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Manage Stocks
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Tab:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tab.name}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPickerFor(null)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Stock list */}
                <div className="max-h-72 overflow-y-auto px-6 py-3 divide-y divide-gray-50 dark:divide-gray-700">
                  {allSymbols.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      No stocks in your portfolio yet.
                    </p>
                  ) : (
                    allSymbols.map((sym) => (
                      <label
                        key={sym}
                        className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 -mx-2 px-2 rounded-lg dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(sym)}
                          onChange={() => toggle(sym)}
                          className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {sym}
                        </span>
                        {selected.has(sym) && (
                          <span className="ml-auto text-xs text-blue-500 font-medium">
                            ✓ included
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selected.size} / {allSymbols.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTabSymbolsChange(showPickerFor, [])}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 px-2 py-1"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() =>
                        onTabSymbolsChange(showPickerFor, [...allSymbols])
                      }
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 px-2 py-1"
                    >
                      Select all
                    </button>
                    <button
                      onClick={() => setShowPickerFor(null)}
                      className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
