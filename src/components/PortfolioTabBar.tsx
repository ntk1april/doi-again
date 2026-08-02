"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FolderKanban, Edit3, Trash2, X, Check, Layers } from "lucide-react";

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
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl mb-6 overflow-x-auto border border-gray-200/60 dark:border-gray-700/60 shadow-inner scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isAll = tab.id === ALL_TAB_ID;

          return (
            <div key={tab.id} className="relative flex-shrink-0">
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
                  className="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border border-blue-500 bg-white dark:bg-gray-900 outline-none w-32 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              ) : (
                /* ── Tab pill ── */
                <button
                  onClick={() => onTabChange(tab.id)}
                  onDoubleClick={() => !isAll && startRename(tab)}
                  title={isAll ? "All stocks" : "Double-click to rename"}
                  className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200/60 dark:border-gray-700/60"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-base">{isAll ? "📊" : "🗂️"}</span>
                  <span>{tab.name}</span>
                  {!isAll && isActive && (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                      {tab.symbols.length}
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
          className="flex-shrink-0 flex items-center justify-center h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Manage stocks button (for custom tabs) ─────────────── */}
      {activeTab && activeTab.id !== ALL_TAB_ID && (
        <div className="mb-6 p-3.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              {activeTab.symbols.length === 0
                ? "No stocks assigned to this group yet."
                : `${activeTab.symbols.length} stock${
                    activeTab.symbols.length > 1 ? "s" : ""
                  } in this group`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              title="Add/remove stocks"
              onClick={() => setShowPickerFor(activeTab.id)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors shadow-sm"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Manage Stocks</span>
            </button>

            <button
              onClick={() => startRename(activeTab)}
              title="Rename tab"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>

            <button
              onClick={() => onTabDelete(activeTab.id)}
              title="Delete tab"
              className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/60 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-150">
              <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      Manage Tab Stocks
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Group:{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {tab.name}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPickerFor(null)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stock list */}
                <div className="max-h-72 overflow-y-auto p-4 space-y-1">
                  {allSymbols.length === 0 ? (
                    <p className="py-8 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                      No stocks in your portfolio yet.
                    </p>
                  ) : (
                    allSymbols.map((sym) => {
                      const isChecked = selected.has(sym);
                      return (
                        <label
                          key={sym}
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                            isChecked
                              ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300"
                              : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggle(sym)}
                              className="w-4 h-4 rounded-md accent-blue-600 cursor-pointer"
                            />
                            <span className="text-sm font-bold">{sym}</span>
                          </div>
                          {isChecked && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>Included</span>
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {selected.size} of {allSymbols.length} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTabSymbolsChange(showPickerFor, [])}
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 px-2 py-1"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() =>
                        onTabSymbolsChange(showPickerFor, [...allSymbols])
                      }
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 px-2 py-1"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowPickerFor(null)}
                      className="rounded-xl bg-blue-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
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
