import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ES = [
  {
    q: '¿Cómo hago una reserva?',
    a: 'Busca un restaurante, elige fecha, hora y número de comensales, y pulsa "Confirmar reserva". Recibirás confirmación inmediata.',
  },
  {
    q: '¿Puedo cancelar una reserva?',
    a: 'Sí. Ve a "Mis reservas" y pulsa cancelar en la reserva correspondiente. Las cancelaciones con menos de 4h de antelación pueden tener cargos.',
  },
  {
    q: '¿Cómo funciona el plano de mesas?',
    a: 'Desde la página del restaurante puedes acceder al plano 3D interactivo. Las mesas en marrón están disponibles; en gris, ocupadas. Haz clic para seleccionarla.',
  },
  {
    q: '¿Para qué sirve el chat con IA?',
    a: 'El asistente de IA te ayuda a encontrar restaurantes según tu estado de ánimo, cocina, presupuesto o ubicación. Escríbele en lenguaje natural.',
  },
  {
    q: '¿Cómo activo el inicio de sesión con Google?',
    a: 'En el modal de acceso encontrarás el botón de Google si el administrador ha configurado la integración. Si no aparece, usa email y contraseña.',
  },
  {
    q: '¿Puedo dejar una reseña?',
    a: 'Sí, después de haber realizado una reserva en el restaurante. Ve a la página del restaurante → pestaña Reseñas → escribe tu valoración.',
  },
];

const FAQ_EN = [
  {
    q: 'How do I make a reservation?',
    a: 'Search for a restaurant, choose date, time and number of guests, then press "Confirm booking". You'll get instant confirmation.',
  },
  {
    q: 'Can I cancel a reservation?',
    a: 'Yes. Go to "My Bookings" and press cancel on the relevant reservation. Cancellations less than 4h before may carry a fee.',
  },
  {
    q: 'How does the floor plan work?',
    a: 'From the restaurant page you can open the interactive 3D floor plan. Brown tables are available; grey ones are taken. Click to select.',
  },
  {
    q: 'What is the AI chat for?',
    a: 'The AI assistant helps you find restaurants based on mood, cuisine, budget or location. Just write naturally.',
  },
  {
    q: 'How do I enable Google sign-in?',
    a: 'The Google button appears in the login modal when the admin has configured the integration. Otherwise use email and password.',
  },
  {
    q: 'Can I leave a review?',
    a: 'Yes, after having a reservation at the restaurant. Go to the restaurant page → Reviews tab → write your rating.',
  },
];

const HelpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = i18n.language.startsWith('es') ? FAQ_ES : FAQ_EN;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingTop: 88 }}>
      <div className="container" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 80 }}>

        {/* Back */}
        <Link to="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--ink-55)', marginBottom: 32 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          {t('confirmation.backHome')}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="eyebrow">{t('profile.help')}</span>
          <h1 className="editorial" style={{ fontSize: 36, fontWeight: 400, marginTop: 8 }}>
            {i18n.language.startsWith('es') ? (
              <>¿En qué te <em className="italic-accent">podemos ayudar</em>?</>
            ) : (
              <>How can we <em className="italic-accent">help you</em>?</>
            )}
          </h1>
        </div>

        {/* Contact card */}
        <div style={{
          background: 'var(--background-light)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 40,
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', marginTop: 2 }}>mail</span>
          <div>
            <div className="font-semibold" style={{ marginBottom: 4 }}>
              {i18n.language.startsWith('es') ? 'Escríbenos' : 'Write to us'}
            </div>
            <p style={{ color: 'var(--ink-55)', fontSize: 14, marginBottom: 10 }}>
              {i18n.language.startsWith('es')
                ? 'Respondemos en menos de 24h en días laborables.'
                : 'We reply within 24h on working days.'}
            </p>
            <a
              href="mailto:support@reservia.app"
              className="btn btn-primary"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              support@reservia.app
            </a>
          </div>
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
          {i18n.language.startsWith('es') ? 'Preguntas frecuentes' : 'Frequently asked questions'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--background-light)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left font-medium"
                style={{ padding: '16px 20px', fontSize: 15 }}
              >
                {item.q}
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    color: 'var(--ink-55)',
                    transform: open === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  expand_more
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 20px 16px', color: 'var(--ink-55)', fontSize: 14, lineHeight: 1.6 }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
