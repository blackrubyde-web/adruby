import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { deltaClasses } from './statusStyles';

const Delta = ({ value, suffix = '', direction }) => {
  const dir = direction || (typeof value === 'number' ? (value > 0 ? 'up' : value < 0 ? 'down' : 'flat') : 'flat');
  const icon =
    dir === 'up' ? <ArrowUpRight size={12} /> : dir === 'down' ? <ArrowDownRight size={12} /> : <Minus size={12} />;

  return (
    <span className={deltaClasses(dir)}>
      {icon}
      {typeof value === 'number' ? `${value}${suffix}` : '—'}
    </span>
  );
};

export default Delta;
