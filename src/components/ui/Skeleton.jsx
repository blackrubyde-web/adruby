import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default Skeleton;
