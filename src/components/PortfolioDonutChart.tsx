/**
 * PortfolioDonutChart
 * Two SVG donut charts: stock allocation by Units and by Total Cost
 */

"use client";

import { useState } from "react";

interface Stock {
  symbol: string;
  units: number;
  totalCost: number;
}

interface Props {
  stocks: Stock[];
  hideNumbers?: boolean;
}

// Accessible, distinct color palette
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#F97316", // orange
  "#EC4899", // pink
  "#84CC16", // lime
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#E11D48", // rose
];

/** Generate SVG path for a donut arc segment */
function donutArcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const sa = toRad(startAngle);
  const ea = toRad(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const ox1 = cx + outerR * Math.cos(sa);
  const oy1 = cy + outerR * Math.sin(sa);
  const ox2 = cx + outerR * Math.cos(ea);
  const oy2 = cy + outerR * Math.sin(ea);

  const ix1 = cx + innerR * Math.cos(ea);
  const iy1 = cy + innerR * Math.sin(ea);
  const ix2 = cx + innerR * Math.cos(sa);
  const iy2 = cy + innerR * Math.sin(sa);

  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

interface DonutProps {
  data: { label: string; value: number; color: string }[];
  label: string;
  formatValue: (v: number) => string;
  hideNumbers?: boolean;
  hoveredSymbol: string | null;
  onHover: (symbol: string | null) => void;
}

function DonutChart({ data, label, formatValue, hideNumbers, hoveredSymbol, onHover }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 135;
  const cy = 135;
  const outerR = 105;
  const innerR = 70;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-44 h-44 flex items-center justify-center rounded-full border-4 border-gray-100 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500">
          No data
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      </div>
    );
  }

  let currentAngle = -90; // Start at top
  const segments = data.map((d) => {
    const angle = (d.value / total) * 360;
    const path = donutArcPath(cx, cy, outerR, innerR, currentAngle, currentAngle + angle - 0.5);
    const midAngle = ((currentAngle + currentAngle + angle) / 2 * Math.PI) / 180;
    currentAngle += angle;
    return { ...d, path, percent: (d.value / total) * 100, midAngle };
  });

  // Find hovered segment
  const hovered = segments.find((s) => s.label === hoveredSymbol);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[200px] sm:max-w-[270px]">
        <svg width="100%" viewBox="0 0 270 270">
          {segments.map((seg) => {
            const isActive = hoveredSymbol === null || hoveredSymbol === seg.label;
            return (
              <path
                key={seg.label}
                d={seg.path}
                fill={seg.color}
                opacity={isActive ? 1 : 0.25}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-opacity duration-200 stroke-white dark:stroke-gray-800"
                onMouseEnter={() => onHover(seg.label)}
                onMouseLeave={() => onHover(null)}
              />
            );
          })}
          {/* Center label */}
          <text x={cx} y={cy - 8} textAnchor="middle" className="text-sm fill-gray-700 dark:fill-gray-300" fontSize="13" fontWeight="600">
            {hovered ? hovered.label : "Total"}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="11">
            {hovered
              ? hideNumbers ? "••••••" : formatValue(hovered.value)
              : hideNumbers ? "••••••" : formatValue(total)}
          </text>
          {hovered && (
            <text x={cx} y={cy + 25} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="10">
              {hovered.percent.toFixed(1)}%
            </text>
          )}
        </svg>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
    </div>
  );
}

export default function PortfolioDonutChart({ stocks, hideNumbers = false }: Props) {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  if (!stocks || stocks.length === 0) return null;

  const unitData = stocks.map((s, i) => ({
    label: s.symbol,
    value: s.units,
    color: COLORS[i % COLORS.length],
  }));

  const costData = stocks.map((s, i) => ({
    label: s.symbol,
    value: s.totalCost,
    color: COLORS[i % COLORS.length],
  }));

  const totalUnits = stocks.reduce((s, d) => s + d.units, 0);
  const totalCost = stocks.reduce((s, d) => s + d.totalCost, 0);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Portfolio Allocation</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Charts — side by side on sm+, stacked on xs */}
        <div className="flex flex-wrap gap-4 sm:gap-8 justify-center w-full lg:w-auto flex-shrink-0">
          <DonutChart
            data={unitData}
            label="By Units"
            formatValue={(v) => v.toFixed(2)}
            hideNumbers={hideNumbers}
            hoveredSymbol={hoveredSymbol}
            onHover={setHoveredSymbol}
          />
          <DonutChart
            data={costData}
            label="By Cost"
            formatValue={(v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            hideNumbers={hideNumbers}
            hoveredSymbol={hoveredSymbol}
            onHover={setHoveredSymbol}
          />
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stocks.map((stock, i) => {
              const unitPct = totalUnits > 0 ? (stock.units / totalUnits) * 100 : 0;
              const costPct = totalCost > 0 ? (stock.totalCost / totalCost) * 100 : 0;
              const isActive = hoveredSymbol === null || hoveredSymbol === stock.symbol;

              return (
                <div
                  key={stock.symbol}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-150 ${isActive ? "opacity-100" : "opacity-40"
                    } hover:bg-gray-50 dark:hover:bg-gray-700`}
                  onMouseEnter={() => setHoveredSymbol(stock.symbol)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                >
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{stock.symbol}</p>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Units: {hideNumbers ? "••" : `${unitPct.toFixed(1)}%`}</span>
                      <span>Cost: {hideNumbers ? "••" : `${costPct.toFixed(1)}%`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
