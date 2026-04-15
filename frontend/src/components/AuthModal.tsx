import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await authApi.login({ email, password })
          : await authApi.register({
              first_name: name,
              last_name: lastName,
              phone,
              email,
              password,
            });
      login(res.token, res.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
  };

  const isRegister = mode === 'register';
  const title = isRegister ? t('auth.createAccount') : t('auth.signIn');
  const stepLabel = isRegister ? '02 — Nueva cuenta' : '01 — Acceso';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 backdrop-blur-md p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          <motion.div
            key="auth-card"
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-5xl bg-background-light rounded-[28px] shadow-[0_40px_120px_-20px_rgba(15,23,42,0.45)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Editorial panel (left) ───────────────────────────── */}
            <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 text-background-light overflow-hidden bg-navy">
              <div className="absolute inset-0 auth-grain opacity-95" aria-hidden="true" />
              <div
                className="absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
                style={{ background: 'radial-gradient(circle, #f97415 0%, transparent 70%)' }}
                aria-hidden="true"
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-navy" style={{ fontSize: 20, fontWeight: 700 }}>
                      restaurant
                    </span>
                  </span>
                  <span className="font-black tracking-tight text-lg">ReserVia</span>
                </div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-background-light/60 font-semibold">
                  Est. 2024
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <span className="text-[11px] tracking-[0.35em] uppercase text-primary font-bold">
                  {stepLabel}
                </span>
                <h2
                  id="auth-title"
                  className="auth-editorial text-[44px] xl:text-[56px] leading-[0.95] tracking-tight"
                  style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 50, 'opsz' 144" }}
                >
                  {isRegister ? (
                    <>
                      Reserva tu<br />
                      <em className="italic text-primary" style={{ fontWeight: 400 }}>asiento</em>
                      <br />
                      <span className="text-background-light/85">en la mesa.</span>
                    </>
                  ) : (
                    <>
                      Donde la<br />
                      <em className="italic text-primary" style={{ fontWeight: 400 }}>sobremesa</em>
                      <br />
                      <span className="text-background-light/85">nunca termina.</span>
                    </>
                  )}
                </h2>
                <p className="text-background-light/70 text-sm max-w-xs leading-relaxed">
                  {isRegister
                    ? 'Únete a una comunidad de comensales curiosos. Reservas al instante, favoritos a mano.'
                    : 'Vuelve a tus restaurantes favoritos, gestiona reservas y descubre mesas escondidas.'}
                </p>
              </div>

              <div className="relative z-10 flex items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="auth-editorial italic text-primary text-4xl" style={{ fontWeight: 500 }}>
                      2,400
                    </span>
                    <span className="text-background-light/60 text-xs">+</span>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-background-light/55">
                    Restaurantes
                  </span>
                </div>
                <div className="h-10 w-px bg-background-light/15" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="auth-editorial italic text-primary text-4xl" style={{ fontWeight: 500 }}>
                      4.9
                    </span>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>
                      star
                    </span>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-background-light/55">
                    Valoración
                  </span>
                </div>
                <div className="h-10 w-px bg-background-light/15" />
                <div className="flex flex-col gap-1">
                  <span className="auth-editorial italic text-primary text-4xl" style={{ fontWeight: 500 }}>
                    24/7
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-background-light/55">
                    Reservas
                  </span>
                </div>
              </div>
            </aside>

            {/* ── Form panel (right) ──────────────────────────────── */}
            <section className="relative flex flex-col p-7 sm:p-10 lg:p-12 bg-background-light overflow-y-auto">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-navy/50 hover:text-navy hover:bg-navy/5 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>

              <div key={mode} className="auth-rise flex flex-col gap-6 mt-4 lg:mt-0">
                {/* Mobile-only editorial header */}
                <div className="lg:hidden flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-bold">
                    {stepLabel}
                  </span>
                  <h2
                    className="auth-editorial text-navy text-4xl leading-none"
                    style={{ fontWeight: 400 }}
                  >
                    {isRegister ? (
                      <>Reserva tu <em className="italic text-primary">asiento</em>.</>
                    ) : (
                      <>Bienvenido <em className="italic text-primary">de vuelta</em>.</>
                    )}
                  </h2>
                </div>

                <div className="hidden lg:flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-navy/50 font-bold">
                    {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                  </span>
                  <h3 className="auth-editorial text-navy text-3xl" style={{ fontWeight: 400 }}>
                    {isRegister ? (
                      <>Empieza con <em className="italic text-primary">nosotros</em></>
                    ) : (
                      <>Hola, <em className="italic text-primary">otra vez</em></>
                    )}
                  </h3>
                </div>

                {/* Segmented tabs */}
                <div
                  role="tablist"
                  className="relative flex bg-navy/5 rounded-full p-1 self-start w-full max-w-sm"
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    className="absolute inset-y-1 w-[calc(50%-4px)] bg-background-light rounded-full shadow-[0_6px_20px_-6px_rgba(15,23,42,0.2)] ring-1 ring-navy/5"
                    style={{ left: isRegister ? 'calc(50% + 0px)' : '4px' }}
                  />
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isRegister}
                    onClick={() => switchMode('login')}
                    className={`relative z-10 flex-1 h-10 rounded-full text-sm font-semibold tracking-wide transition-colors ${
                      !isRegister ? 'text-navy' : 'text-navy/50 hover:text-navy/80'
                    }`}
                  >
                    {t('auth.signIn')}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isRegister}
                    onClick={() => switchMode('register')}
                    className={`relative z-10 flex-1 h-10 rounded-full text-sm font-semibold tracking-wide transition-colors ${
                      isRegister ? 'text-navy' : 'text-navy/50 hover:text-navy/80'
                    }`}
                  >
                    {t('auth.register')}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {isRegister && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatField
                          label={t('auth.namePlaceholder')}
                          icon="person"
                          type="text"
                          value={name}
                          onChange={setName}
                          autoComplete="given-name"
                          required
                        />
                        <FloatField
                          label={t('auth.lastNamePlaceholder')}
                          icon="badge"
                          type="text"
                          value={lastName}
                          onChange={setLastName}
                          autoComplete="family-name"
                          required
                        />
                      </div>
                      <FloatField
                        label={t('auth.phonePlaceholder')}
                        icon="call"
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        autoComplete="tel"
                        required
                      />
                    </>
                  )}
                  <FloatField
                    label={t('auth.emailPlaceholder')}
                    icon="mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    required
                  />
                  <FloatField
                    label={t('auth.passwordPlaceholder')}
                    icon="lock"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="text-navy/40 hover:text-navy transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    }
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        role="alert"
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                      >
                        <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 18 }}>
                          error
                        </span>
                        <span className="font-medium">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full h-14 bg-navy text-background-light font-bold rounded-2xl overflow-hidden transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_20px_50px_-12px_rgba(249,116,21,0.55)] active:scale-[0.98]"
                  >
                    <span
                      className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-3 tracking-wide">
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-background-light/30 border-t-background-light rounded-full animate-spin" />
                          <span>{isRegister ? 'Creando cuenta…' : 'Entrando…'}</span>
                        </>
                      ) : (
                        <>
                          <span>{title}</span>
                          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: 20 }}>
                            arrow_forward
                          </span>
                        </>
                      )}
                    </span>
                  </button>

                </form>

                <p className="text-xs text-navy/55 text-center">
                  {isRegister ? '¿Ya tienes cuenta? ' : '¿Primera vez aquí? '}
                  <button
                    type="button"
                    onClick={() => switchMode(isRegister ? 'login' : 'register')}
                    className="font-bold text-navy hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                  >
                    {isRegister ? t('auth.signIn') : t('auth.createAccount')}
                  </button>
                </p>
              </div>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────── */

interface FloatFieldProps {
  label: string;
  icon: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  trailing?: React.ReactNode;
}

const FloatField: React.FC<FloatFieldProps> = ({
  label, icon, type, value, onChange, required, minLength, autoComplete, trailing,
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <label
      className={`auth-input relative flex items-center gap-3 h-14 px-4 rounded-2xl bg-white/70 border transition-all ${
        focused ? 'border-primary/60 bg-white shadow-[0_0_0_4px_rgba(249,116,21,0.10)]' : 'border-navy/10 hover:border-navy/20'
      }`}
    >
      <span
        className={`material-symbols-outlined transition-colors ${focused ? 'text-primary' : 'text-navy/35'}`}
        style={{ fontSize: 22 }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="relative flex-1">
        <span
          className={`absolute left-0 pointer-events-none transition-all duration-200 ${
            floated
              ? 'top-0 text-[10px] tracking-[0.15em] uppercase font-bold text-navy/55'
              : 'top-1/2 -translate-y-1/2 text-sm text-navy/45'
          }`}
        >
          {label}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full bg-transparent outline-none text-navy font-medium pt-4 pb-1 text-[15px]"
        />
      </div>
      {trailing}
      <span className="auth-input-line absolute left-4 right-4 bottom-0 h-[2px] bg-gradient-to-r from-primary via-primary to-primary/0 rounded-full" />
    </label>
  );
};

export default AuthModal;
