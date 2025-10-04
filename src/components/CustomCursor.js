import React, { useEffect, useState } from 'react';

function CustomCursor() {
    const[position, setPosition] = useState({ x: 0, y: 0 });

    const [isPointer, SetIsPointer] = useState(false);

    const handleMouseMove = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
        const target = e.target;

        setIsPointer(
            window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer'
        );
    };

    useEffect(() => { 
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const cursorSize = isPointer ? 0 : 30;

    const cursorStyle = isPointer ? { left: "-100px", top: "-100px" } : {};

    return (
        <div>
            className={`flare ${isPointer ? "pointer" : ""}`}
            style={{
                ...cursorStyle,
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${cursorSize}px`,
                height: `${cursorSize}px`,
            }}
        </div>
    );
}

export default CustomCursor;