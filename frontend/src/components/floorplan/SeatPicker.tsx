import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { floorPlanApi, type FloorPlanData, type SeatAvailability, type SeatData, type TableData } from '../../api/floorPlan';
import FloorPlanCanvas from './FloorPlanCanvas';
import Legend from './Legend';

interface SeatPickerProps {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  selectedSeatIds: number[];
  onSelectionChange: (seatIds: number[]) => void;
}

const SeatPicker: React.FC<SeatPickerProps> = ({
  restaurantId,
  date,
  time,
  guests,
  selectedSeatIds,
  onSelectionChange,
}) => {
  const { t } = useTranslation();
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [availability, setAvailability] = useState<SeatAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch floor plan once
  useEffect(() => {
    floorPlanApi.get(restaurantId)
      .then((res) => {
        if (res.hasFloorPlan && res.floorPlan) {
          setFloorPlan(res.floorPlan);
        }
      })
      .catch(() => setError('Failed to load floor plan'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // Fetch availability when date/time changes
  useEffect(() => {
    if (!date || !time) return;
    setLoading(true);
    floorPlanApi.getAvailability(restaurantId, date, time)
      .then((res) => {
        setAvailability(res.seats);
        setError('');
      })
      .catch(() => setError('Failed to load availability'))
      .finally(() => setLoading(false));
  }, [restaurantId, date, time]);

  const occupiedSeatIds = new Set(
    availability.filter((s) => s.isOccupied).map((s) => s.id)
  );
  const selectedSet = new Set(selectedSeatIds);

  const handleSeatClick = useCallback(
    (seat: SeatData, _table: TableData) => {
      if (occupiedSeatIds.has(seat.id)) return;

      if (selectedSet.has(seat.id)) {
        onSelectionChange(selectedSeatIds.filter((id) => id !== seat.id));
      } else if (selectedSeatIds.length < guests) {
        onSelectionChange([...selectedSeatIds, seat.id]);
      }
    },
    [selectedSeatIds, guests, occupiedSeatIds, onSelectionChange]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !floorPlan) {
    return null;
  }

  const allSelected = selectedSeatIds.length === guests;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-navy">
          {t('floorPlan.title')}
        </h4>
        <AnimatePresence mode="wait">
          <motion.span
            key={selectedSeatIds.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              allSelected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {allSelected
              ? t('floorPlan.allSelected')
              : t('floorPlan.seatsSelected', { count: selectedSeatIds.length, total: guests })}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
        <FloorPlanCanvas
          width={floorPlan.width}
          height={floorPlan.height}
          tables={floorPlan.tables}
          selectedSeatIds={selectedSet}
          occupiedSeatIds={occupiedSeatIds}
          onSeatClick={handleSeatClick}
        />
      </div>

      <Legend />
    </motion.div>
  );
};

export default SeatPicker;
