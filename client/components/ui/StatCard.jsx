'use client';
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function CountUp({ value }) {
  const isNumeric = typeof value === 'number';
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (isNumeric) motionVal.set(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isNumeric) return <>{value}</>;
  return <motion.span>{rounded}</motion.span>;
}

export default function StatCard({ label, value, caption }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-tabular text-3xl font-semibold text-[var(--text-main)]">
        <CountUp value={value} />
      </p>
      {caption && <p className="text-xs text-[var(--text-muted)] mt-1">{caption}</p>}
    </div>
  );
}
