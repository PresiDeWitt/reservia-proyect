import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);

  // In a real app, we would fetch the restaurant by id
  console.log('Fetching details for restaurant ID:', id);

  // Mock data for demonstration
  const restaurant = {
    name: 'The Golden Fork',
    cuisine: 'Italian',
    rating: 4.8,
    reviews: 1240,
    priceRange: '$$$',
    address: '123 Gourmet Street, Downtown',
    description: 'Experience the authentic flavors of Italy in the heart of the city. Our chef uses only the freshest ingredients to create traditional pasta dishes and wood-fired pizzas.',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800'
    ]
  };

  const timeSlots = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      setIsBooked(true);
      setTimeout(() => setIsBooked(false), 5000);
    }
  };

  return (
    <div className="bg-background-light min-h-screen pb-20">
      {/* Hero Gallery */}
      <div className="h-[40vh] md:h-[50vh] grid grid-cols-4 gap-2 p-2">
        <div className="col-span-4 md:col-span-2 relative overflow-hidden rounded-xl">
          <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>
        <div className="hidden md:block relative overflow-hidden rounded-xl">
          <img src={restaurant.images[1]} alt="Interior" className="w-full h-full object-cover" />
        </div>
        <div className="hidden md:block relative overflow-hidden rounded-xl">
          <img src={restaurant.images[2]} alt="Food" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold">{t('restaurant.photos')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-navy">{restaurant.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-slate-600">
                  <span className="flex items-center gap-1 font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    {restaurant.rating}
                  </span>
                  <span>•</span>
                  <span>{restaurant.reviews} {t('restaurant.reviews')}</span>
                  <span>•</span>
                  <span>{t(`cuisines.${restaurant.cuisine}`)}</span>
                </div>
              </div>
              <button className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-sm italic">
              <span className="material-symbols-outlined text-lg">location_on</span>
              {restaurant.address}
            </div>

            <hr className="border-slate-200 my-4" />

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold text-navy mb-4">{t('restaurant.about')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-navy mb-6">{t('restaurant.menuHighlights')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Truffle Pasta', 'Margherita Pizza', 'Osso Buco', 'Tiramisu'].map(item => (
                  <div key={item} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex justify-between items-center group hover:border-primary transition-all">
                    <span className="font-medium text-slate-800">{item}</span>
                    <span className="text-slate-400 group-hover:text-primary transition-colors material-symbols-outlined">add_circle</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-28 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-navy mb-6">{t('restaurant.reserveTitle')}</h3>
            
            <form onSubmit={handleBooking} className="flex flex-col gap-6">
              <fieldset className="flex flex-col gap-2 border-none p-0 m-0">
                <legend className="text-sm font-bold text-slate-700 mb-2">{t('restaurant.guests')}</legend>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-12">
                  <button 
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="flex-1 h-full hover:bg-slate-50 transition-colors"
                    aria-label="Decrease guests"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-navy" aria-live="polite">{guests}</span>
                  <button 
                    type="button"
                    onClick={() => setGuests(guests + 1)}
                    className="flex-1 h-full hover:bg-slate-50 transition-colors"
                    aria-label="Increase guests"
                  >
                    +
                  </button>
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <label htmlFor="booking-date" className="text-sm font-bold text-slate-700">{t('restaurant.date')}</label>
                <input 
                  id="booking-date"
                  type="date" 
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                />
              </div>

              <fieldset className="flex flex-col gap-2 border-none p-0 m-0">
                <legend className="text-sm font-bold text-slate-700 mb-2">{t('restaurant.availableTimes')}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`h-10 rounded-lg text-xs font-bold transition-all border ${
                        selectedTime === time 
                        ? 'bg-primary border-primary text-white shadow-md' 
                        : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button 
                type="submit"
                className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 disabled:opacity-50"
                disabled={!selectedDate || !selectedTime}
              >
                {t('restaurant.completeReservation')}
              </button>

              <p className="text-center text-xs text-slate-400">
                {t('restaurant.noCharges')}
              </p>
            </form>

            <AnimatePresence>
              {isBooked && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-emerald/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-white text-center z-50"
                >
                  <span className="material-symbols-outlined text-6xl mb-4">check_circle</span>
                  <h4 className="text-2xl font-bold mb-2">{t('restaurant.reserved')}</h4>
                  <p className="font-medium">
                    {t('restaurant.reservedDetails', { guests, time: selectedTime, date: selectedDate })}
                  </p>
                  <button 
                    onClick={() => setIsBooked(false)}
                    className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-all"
                  >
                    {t('restaurant.gotIt')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;

