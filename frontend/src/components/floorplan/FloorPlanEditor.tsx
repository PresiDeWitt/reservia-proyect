import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TableData } from '../../api/floorPlan';
import { computeSeatPosition, SEAT_RADIUS } from '../../utils/seatGeometry';

interface EditorTable {
  tempId: string;
  label: string;
  shape: 'round' | 'square' | 'rectangular';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  min_capacity: number;
}

interface FloorPlanEditorProps {
  initialTables: TableData[];
  canvasWidth: number;
  canvasHeight: number;
  onSave: (tables: Omit<TableData, 'id' | 'seats'>[]) => Promise<void>;
}

let nextTempId = 1;
function genTempId() {
  return `temp-${nextTempId++}`;
}

function getSeatPositions(table: EditorTable) {
  return Array.from({ length: table.capacity }, (_, i) =>
    computeSeatPosition(table, i)
  );
}

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  initialTables,
  canvasWidth,
  canvasHeight,
  onSave,
}) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);

  const [tables, setTables] = useState<EditorTable[]>(
    initialTables.map((t) => ({ ...t, tempId: genTempId() }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedTable = tables.find((t) => t.tempId === selectedId) || null;

  const toSvgCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const pt = svgRef.current.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svgRef.current.getScreenCTM()?.inverse();
      if (!ctm) return { x: 0, y: 0 };
      const svgPt = pt.matrixTransform(ctm);
      return { x: svgPt.x, y: svgPt.y };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent, table: EditorTable) => {
    e.stopPropagation();
    const coords = toSvgCoords(e.clientX, e.clientY);
    setDragging({ id: table.tempId, offsetX: coords.x - table.x, offsetY: coords.y - table.y });
    setSelectedId(table.tempId);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const coords = toSvgCoords(e.clientX, e.clientY);
    setTables((prev) =>
      prev.map((t) =>
        t.tempId === dragging.id
          ? {
              ...t,
              x: Math.max(t.width / 2, Math.min(canvasWidth - t.width / 2, coords.x - dragging.offsetX)),
              y: Math.max(t.height / 2, Math.min(canvasHeight - t.height / 2, coords.y - dragging.offsetY)),
            }
          : t
      )
    );
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const addTable = (shape: 'round' | 'square' | 'rectangular') => {
    const label = `T${tables.length + 1}`;
    const newTable: EditorTable = {
      tempId: genTempId(),
      label,
      shape,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: shape === 'rectangular' ? 140 : 90,
      height: shape === 'rectangular' ? 80 : 90,
      rotation: 0,
      capacity: shape === 'rectangular' ? 6 : 4,
      min_capacity: 1,
    };
    setTables([...tables, newTable]);
    setSelectedId(newTable.tempId);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setTables(tables.filter((t) => t.tempId !== selectedId));
    setSelectedId(null);
  };

  const updateSelected = (updates: Partial<EditorTable>) => {
    if (!selectedId) return;
    setTables((prev) =>
      prev.map((t) => (t.tempId === selectedId ? { ...t, ...updates } : t))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(
        tables.map(({ tempId, ...rest }) => rest)
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => addTable('round')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
            {t('floorPlan.editor.addRound')}
          </button>
          <button
            onClick={() => addTable('square')}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <span className="material-symbols-outlined text-base">square</span>
            {t('floorPlan.editor.addSquare')}
          </button>
          <button
            onClick={() => addTable('rectangular')}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <span className="material-symbols-outlined text-base">crop_landscape</span>
            {t('floorPlan.editor.addRect')}
          </button>
          {selectedId && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              {t('floorPlan.editor.deleteTable')}
            </button>
          )}
        </div>

        {/* SVG Canvas */}
        <div className="rounded-xl border-2 border-dashed border-slate-300 overflow-hidden bg-white">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full"
            style={{ maxHeight: '500px' }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => setSelectedId(null)}
          >
            <defs>
              <pattern id="editor-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={canvasWidth} height={canvasHeight} fill="#f8fafc" />
            <rect width={canvasWidth} height={canvasHeight} fill="url(#editor-grid)" />

            {tables.map((table) => {
              const isSelected = table.tempId === selectedId;
              const seats = getSeatPositions(table);

              return (
                <g key={table.tempId} style={{ cursor: dragging?.id === table.tempId ? 'grabbing' : 'grab' }}>
                  {/* Selection ring */}
                  {isSelected && (
                    table.shape === 'round' ? (
                      <circle
                        cx={table.x} cy={table.y} r={table.width / 2 + 4}
                        fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3"
                      />
                    ) : (
                      <rect
                        x={table.x - table.width / 2 - 4} y={table.y - table.height / 2 - 4}
                        width={table.width + 8} height={table.height + 8}
                        rx={10} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3"
                        transform={table.rotation ? `rotate(${table.rotation} ${table.x} ${table.y})` : undefined}
                      />
                    )
                  )}

                  {/* Table shape */}
                  {table.shape === 'round' ? (
                    <circle
                      cx={table.x} cy={table.y} r={table.width / 2}
                      fill={isSelected ? '#fef3c7' : '#fef9c3'}
                      stroke={isSelected ? '#f97316' : '#fbbf24'}
                      strokeWidth="2"
                      onPointerDown={(e) => handlePointerDown(e, table)}
                    />
                  ) : (
                    <rect
                      x={table.x - table.width / 2} y={table.y - table.height / 2}
                      width={table.width} height={table.height}
                      rx={table.shape === 'square' ? 8 : 6}
                      fill={isSelected ? (table.shape === 'square' ? '#e0f2fe' : '#f0fdf4') : (table.shape === 'square' ? '#f0f9ff' : '#fafff5')}
                      stroke={isSelected ? '#f97316' : (table.shape === 'square' ? '#38bdf8' : '#86efac')}
                      strokeWidth="2"
                      transform={table.rotation ? `rotate(${table.rotation} ${table.x} ${table.y})` : undefined}
                      onPointerDown={(e) => handlePointerDown(e, table)}
                    />
                  )}

                  {/* Label */}
                  <text
                    x={table.x} y={table.y}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="13" fontWeight="700" fill="#475569"
                    pointerEvents="none"
                  >
                    {table.label}
                  </text>

                  {/* Seat previews */}
                  {seats.map((pos, i) => (
                    <circle
                      key={i}
                      cx={pos.cx} cy={pos.cy} r={SEAT_RADIUS}
                      fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5"
                      opacity={0.6} pointerEvents="none"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-sm font-bold text-navy mb-4">
            {selectedTable ? `${selectedTable.label} - ${selectedTable.shape}` : t('floorPlan.editor.noSelection')}
          </h4>

          {selectedTable ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{t('floorPlan.editor.label')}</label>
                <input
                  type="text"
                  value={selectedTable.label}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{t('floorPlan.editor.capacity')} ({selectedTable.capacity})</label>
                <input
                  type="range"
                  min={1} max={12}
                  value={selectedTable.capacity}
                  onChange={(e) => updateSelected({ capacity: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{t('floorPlan.editor.rotation')} ({selectedTable.rotation}°)</label>
                <input
                  type="range"
                  min={0} max={360} step={5}
                  value={selectedTable.rotation}
                  onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{t('floorPlan.editor.width')}</label>
                  <input
                    type="number"
                    min={40} max={300}
                    value={selectedTable.width}
                    onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{t('floorPlan.editor.height')}</label>
                  <input
                    type="number"
                    min={40} max={300}
                    value={selectedTable.height}
                    onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">{t('floorPlan.editor.noSelection')}</p>
          )}
        </div>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {saving ? t('floorPlan.editor.saving') : saved ? t('floorPlan.editor.saved') : t('floorPlan.editor.save')}
        </motion.button>

        {/* Table count */}
        <p className="text-xs text-slate-400 text-center">
          {tables.length} {tables.length === 1 ? 'table' : 'tables'} · {tables.reduce((sum, t) => sum + t.capacity, 0)} seats
        </p>
      </div>
    </div>
  );
};

export default FloorPlanEditor;
