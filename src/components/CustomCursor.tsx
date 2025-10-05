'use client';

import React, { useState, useEffect } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

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
      className="fixed w-6 h-6 z-[9999]"
      style={{
        transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0)`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none',
        backgroundImage: `url('/globe.svg')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};

export default CustomCursor;