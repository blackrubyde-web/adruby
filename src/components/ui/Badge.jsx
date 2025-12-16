import React from 'react';
import { statusBadgeClasses } from './statusStyles';

const Badge = ({ variant = 'neutral', icon = null, children }) => {
  return (
    <span className={statusBadgeClasses(variant)}>
      {icon}
      {children}
    </span>
  );
};

export default Badge;
