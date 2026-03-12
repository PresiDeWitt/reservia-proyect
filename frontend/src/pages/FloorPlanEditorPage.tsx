import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { floorPlanApi, type FloorPlanData, type TableData } from '../api/floorPlan';
import { useAuth } from '../context/AuthContext';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';

const FloorPlanEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      restaurantsApi.get(id),
      floorPlanApi.get(id),
    ])
      .then(([rest, fpRes]) => {
        setRestaurant(rest);
        if (fpRes.hasFloorPlan && fpRes.floorPlan) {
          setFloorPlan(fpRes.floorPlan);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (tables: Omit<TableData, 'id' | 'seats'>[]) => {
    if (!id) return;
    const result = await floorPlanApi.save(id, {
      width: floorPlan?.width || 1000,
      height: floorPlan?.height || 700,
      backgroundColor: floorPlan?.background_color || '#F8F9FA',
      tables,
    });
    setFloorPlan(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-4 block">lock</span>
          <p className="text-lg font-medium">Sign in to edit floor plans.</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Restaurant not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 md:px-10 lg:px-20">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link to={`/restaurant/${id}`} className="text-sm text-primary font-medium hover:underline flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {restaurant.name}
          </Link>
          <h1 className="text-3xl font-black text-navy">
            {t('floorPlan.editor.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{restaurant.name} - {restaurant.address}</p>
        </motion.div>

        <FloorPlanEditor
          initialTables={floorPlan?.tables || []}
          canvasWidth={floorPlan?.width || 1000}
          canvasHeight={floorPlan?.height || 700}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default FloorPlanEditorPage;
