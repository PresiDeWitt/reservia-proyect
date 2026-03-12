import React from 'react';
import { motion } from 'framer-motion';
import type { TableData, SeatData } from '../../api/floorPlan';
import { computeSeatPosition, SEAT_RADIUS } from '../../utils/seatGeometry';

interface FloorPlanCanvasProps {
  width: number;
  height: number;
  tables: TableData[];
  selectedSeatIds: Set<number>;
  occupiedSeatIds: Set<number>;
  onSeatClick?: (seat: SeatData, table: TableData) => void;
  interactive?: boolean;
}

const CUSHION_RY = SEAT_RADIUS * 0.55;
const CUSHION_RX = SEAT_RADIUS * 0.72;
const BACK_H = SEAT_RADIUS * 0.55;
const BACK_W = SEAT_RADIUS * 1.3;
const BACK_Y = -(CUSHION_RY + BACK_H * 0.6);

function CinemaSeat({
  cx,
  cy,
  angle,
  fill,
  stroke,
  cursor,
  onClick,
  seatIndex,
}: {
  cx: number;
  cy: number;
  angle: number;
  fill: string;
  stroke: string;
  cursor: string;
  onClick?: () => void;
  seatIndex: number;
}) {
  return (
    <motion.g
      transform={`translate(${cx},${cy}) rotate(${angle})`}
      style={{ cursor }}
      onClick={onClick}
      whileHover={cursor === 'pointer' ? { scale: 1.18 } : undefined}
      whileTap={cursor === 'pointer' ? { scale: 0.92 } : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: seatIndex * 0.025, type: 'spring', stiffness: 280, damping: 18 }}
    >
      {/* Backrest */}
      <rect
        x={-BACK_W / 2}
        y={BACK_Y}
        width={BACK_W}
        height={BACK_H}
        rx={SEAT_RADIUS * 0.35}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        opacity={0.9}
      />
      {/* Cushion */}
      <ellipse
        cx={0}
        cy={0}
        rx={CUSHION_RX}
        ry={CUSHION_RY}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
    </motion.g>
  );
}

function getSeatColors(
  seatId: number,
  selected: Set<number>,
  occupied: Set<number>
): { fill: string; stroke: string } {
  if (selected.has(seatId)) return { fill: '#f97316', stroke: '#ea580c' };
  if (occupied.has(seatId)) return { fill: '#cbd5e1', stroke: '#94a3b8' };
  return { fill: '#34d399', stroke: '#10b981' };
}

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  width,
  height,
  tables,
  selectedSeatIds,
  occupiedSeatIds,
  onSeatClick,
  interactive = true,
}) => {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ maxHeight: '520px' }}
    >
      <defs>
        {/* Subtle grid */}
        <pattern id="fp-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
        </pattern>
        {/* Glow for selected seats */}
        <filter id="fp-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Table drop shadow */}
        <filter id="fp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#94a3b8" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Light background matching website */}
      <rect width={width} height={height} fill="#f8fafc" />
      <rect width={width} height={height} fill="url(#fp-grid)" />

      {/* Entrance indicator */}
      <g>
        <rect x={width / 2 - 50} y={height - 5} width="100" height="5" fill="#e2e8f0" rx="2.5" />
        <text x={width / 2} y={height - 13} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600" letterSpacing="3">
          ENTRADA
        </text>
      </g>

      {tables.map((table) => (
        <g key={table.id}>
          {/* Table shadow */}
          <g filter="url(#fp-shadow)">
            {table.shape === 'round' ? (
              <circle cx={table.x} cy={table.y} r={table.width / 2} fill="#f1f5f9" />
            ) : (
              <rect
                x={table.x - table.width / 2}
                y={table.y - table.height / 2}
                width={table.width}
                height={table.height}
                rx={table.shape === 'square' ? 10 : 8}
                fill="#f1f5f9"
                transform={table.rotation ? `rotate(${table.rotation} ${table.x} ${table.y})` : undefined}
              />
            )}
          </g>

          {/* Table surface — warm white with navy border */}
          {table.shape === 'round' ? (
            <>
              <circle cx={table.x} cy={table.y} r={table.width / 2} fill="#ffffff" stroke="#1e3a5f" strokeWidth="2" />
              <circle cx={table.x} cy={table.y} r={table.width / 2 - 7} fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
            </>
          ) : (
            <>
              <rect
                x={table.x - table.width / 2}
                y={table.y - table.height / 2}
                width={table.width}
                height={table.height}
                rx={table.shape === 'square' ? 10 : 8}
                fill="#ffffff"
                stroke="#1e3a5f"
                strokeWidth="2"
                transform={table.rotation ? `rotate(${table.rotation} ${table.x} ${table.y})` : undefined}
              />
              <rect
                x={table.x - table.width / 2 + 6}
                y={table.y - table.height / 2 + 6}
                width={table.width - 12}
                height={table.height - 12}
                rx={table.shape === 'square' ? 6 : 4}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                transform={table.rotation ? `rotate(${table.rotation} ${table.x} ${table.y})` : undefined}
              />
            </>
          )}

          {/* Table label */}
          <text
            x={table.x}
            y={table.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fontWeight="800"
            fill="#1e3a5f"
            letterSpacing="0.5"
          >
            {table.label}
          </text>

          {/* Seats */}
          {table.seats.map((seat) => {
            const pos = computeSeatPosition(table, seat.seat_index);
            const isOccupied = occupiedSeatIds.has(seat.id);
            const isSelected = selectedSeatIds.has(seat.id);
            const isClickable = interactive && !isOccupied;
            const { fill, stroke } = getSeatColors(seat.id, selectedSeatIds, occupiedSeatIds);

            return (
              <g key={seat.id} filter={isSelected ? 'url(#fp-glow)' : undefined}>
                <CinemaSeat
                  cx={pos.cx}
                  cy={pos.cy}
                  angle={pos.angle}
                  fill={fill}
                  stroke={stroke}
                  cursor={isClickable ? 'pointer' : isOccupied ? 'not-allowed' : 'default'}
                  onClick={isClickable ? () => onSeatClick?.(seat, table) : undefined}
                  seatIndex={seat.seat_index}
                />
                {isSelected && (
                  <text
                    x={pos.cx}
                    y={pos.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="7"
                    fontWeight="900"
                    fill="white"
                    pointerEvents="none"
                    transform={`rotate(${pos.angle} ${pos.cx} ${pos.cy})`}
                  >
                    {seat.label.split('-')[1]}
                  </text>
                )}
                {isOccupied && (
                  <text
                    x={pos.cx}
                    y={pos.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9"
                    fill="#94a3b8"
                    pointerEvents="none"
                  >
                    ✕
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export default FloorPlanCanvas;
