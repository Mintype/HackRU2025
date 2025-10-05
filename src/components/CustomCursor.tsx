'use client';

import React, { useState, useEffect } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, []);

  return (
    <div
      className="fixed w-4 h-4 rounded-full bg-blue-600/50 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        transform: `translate3d(${position.x - 8}px, ${position.y - 8}px, 0)`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none',
      }}
    />
  );
};

export default CustomCursor;