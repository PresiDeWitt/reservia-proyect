import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { setOwnerProfile, type OwnerProfile } from '../api/ownerProfile';

interface Props {
  email: string;
  initialName?: string;
  initialProfile?: OwnerProfile | null;
  onDone: (profile: OwnerProfile) => void;
  onCancel?: () => void;
}

const OwnerOnboarding: React.FC<Props> = ({ email, initialName, initialProfile, onDone, onCancel }) => {
  const { t } = useTranslation();
  const isEdit = !!initialProfile;
  const [saving, setSaving] = useState(false);

  const CUISINES = [
    'Italiana', 'Japonesa', 'Mediterránea', 'Mexicana', 'Asiática', 'Tradicional', 'Fusión', 'Otra',
  ];

  const [name, setName] = useState(initialProfile?.name ?? initialName ?? '');
  const [cuisine, setCuisine] = useState(initialProfile?.cuisine ?? 'Italiana');
  const [address, setAddress] = useState(initialProfile?.address ?? '');
  const [capacity, setCapacity] = useState(initialProfile?.capacity ?? 40);
  const [phone, setPhone] = useState(initialProfile?.phone ?? '');
  const [description, setDescription] = useState(initialProfile?.description ?? '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profile: OwnerProfile = { name, cuisine, address, capacity, phone, description };
      await setOwnerProfile(email, profile);
      onDone(profile);
    } catch {
      // error will be surfaced by parent
    } finally {
      setSaving(false);
    }
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
          {isEdit ? t('onboarding.eyebrow.edit') : t('onboarding.eyebrow.setup')}
        </div>
        <h1 className="editorial" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
          {isEdit ? (
            <>{t('onboarding.title.editPre')} <span className="italic-accent">{t('onboarding.title.editAccent')}</span>{t('onboarding.title.editPost')}</>
          ) : (
            <>{t('onboarding.title.setupPre')}<span className="italic-accent">{t('onboarding.title.setupAccent')}</span>{t('onboarding.title.setupPost')}</>
          )}
        </h1>
        <p style={{ color: 'var(--ink-55)', marginTop: 14, fontSize: 15, lineHeight: 1.6 }}>
          {isEdit ? t('onboarding.desc.edit') : t('onboarding.desc.setup')}
        </p>

        <form onSubmit={submit} style={{ display: 'grid', gap: 18, marginTop: 36 }}>
          <Field label={t('onboarding.fields.name')} required>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('onboarding.fields.namePlaceholder')} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label={t('onboarding.fields.cuisine')}>
              <select style={inputStyle} value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>
                    {t(`onboarding.cuisines.${c}`, { defaultValue: c })}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('onboarding.fields.capacity')}>
              <input style={inputStyle} type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
            </Field>
          </div>

          <Field label={t('onboarding.fields.address')} required>
            <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} required placeholder={t('onboarding.fields.addressPlaceholder')} />
          </Field>

          <Field label={t('onboarding.fields.phone')}>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('onboarding.fields.phonePlaceholder')} />
          </Field>

          <Field label={t('onboarding.fields.description')}>
            <textarea
              style={{ ...inputStyle, height: 100, padding: '12px 14px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('onboarding.fields.descriptionPlaceholder')}
            />
          </Field>

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-ember" style={{ height: 52 }} disabled={saving}>
              <span>{saving ? (isEdit ? 'Guardando…' : 'Creando…') : (isEdit ? t('onboarding.submit.save') : t('onboarding.submit.create'))}</span>
              <span className="mat" style={{ fontSize: 18 }}>{isEdit ? 'check' : 'arrow_forward'}</span>
            </button>
            {isEdit && onCancel && (
              <button type="button" className="btn btn-ghost" style={{ height: 52 }} onClick={onCancel}>
                {t('onboarding.cancel')}
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
