import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { setOwnerProfile, type OwnerProfile } from '../api/ownerProfile';

interface Props {
  email: string;
  initialName?: string;
  initialProfile?: OwnerProfile | null;
  onDone: (profile: OwnerProfile) => void;
  onCancel?: () => void;
}

const CUISINES = ['Italiana', 'Japonesa', 'Mediterránea', 'Mexicana', 'Asiática', 'Tradicional', 'Fusión', 'Otra'];

const OwnerOnboarding: React.FC<Props> = ({ email, initialName, initialProfile, onDone, onCancel }) => {
  const isEdit = !!initialProfile;
  const [name, setName] = useState(initialProfile?.name ?? initialName ?? '');
  const [cuisine, setCuisine] = useState(initialProfile?.cuisine ?? 'Italiana');
  const [address, setAddress] = useState(initialProfile?.address ?? '');
  const [capacity, setCapacity] = useState(initialProfile?.capacity ?? 40);
  const [phone, setPhone] = useState(initialProfile?.phone ?? '');
  const [description, setDescription] = useState(initialProfile?.description ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: OwnerProfile = { name, cuisine, address, capacity, phone, description };
    setOwnerProfile(email, profile);
    onDone(profile);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 14px',
    borderRadius: 'var(--r-md)',
    background: 'var(--surface-3)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', padding: '64px 24px 96px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--primary)' }}>
          {isEdit ? 'Editar restaurante' : 'Configura tu restaurante'}
        </div>
        <h1 className="editorial" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
          {isEdit ? <>Actualiza los <span className="italic-accent">datos</span> de hoy.</> : <>Bienvenido. <span className="italic-accent">Personaliza</span> tu panel.</>}
        </h1>
        <p style={{ color: 'var(--ink-55)', marginTop: 14, fontSize: 15, lineHeight: 1.6 }}>
          {isEdit ? 'Cambia el aforo, la cocina o la descripción. Las métricas del panel se recalculan al guardar.' : 'Estos datos se usan para construir tu dashboard a medida: gestión de mesas, reservas y métricas — todo basado en tu restaurante.'}
        </p>

        <form onSubmit={submit} style={{ display: 'grid', gap: 18, marginTop: 36 }}>
          <Field label="Nombre del restaurante" required>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Osteria del Borgo" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Tipo de cocina">
              <select style={inputStyle} value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Capacidad (comensales)">
              <input style={inputStyle} type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
            </Field>
          </div>

          <Field label="Dirección" required>
            <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Calle Mayor, 12 · Madrid" />
          </Field>

          <Field label="Teléfono">
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
          </Field>

          <Field label="Descripción breve">
            <textarea
              style={{ ...inputStyle, height: 100, padding: '12px 14px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cocina tradicional con un toque contemporáneo…"
            />
          </Field>

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-ember" style={{ height: 52 }}>
              <span>{isEdit ? 'Guardar cambios' : 'Crear mi panel'}</span>
              <span className="mat" style={{ fontSize: 18 }}>{isEdit ? 'check' : 'arrow_forward'}</span>
            </button>
            {isEdit && onCancel && (
              <button type="button" className="btn btn-ghost" style={{ height: 52 }} onClick={onCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-55)' }}>
      {label}{required && <span style={{ color: 'var(--primary)' }}> *</span>}
    </span>
    {children}
  </label>
);

export default OwnerOnboarding;
