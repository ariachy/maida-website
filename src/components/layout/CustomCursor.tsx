'use client';

import { useEffect, useState, useRef } from 'react';
import { isTouchDevice } from '@/lib/utils';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Don't show on touch devices
    if (isTouchDevice()) return;
    
    setIsVisible(true);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update dot immediately
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }
    };
    
    const animate = () => {
      // Smooth follow for main cursor
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      
      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
      }
      
      requestAnimationFrame(animate);
    };
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, .interactive'
    );
    
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    animate();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        aria-hidden="true"
      />
    </>
  );
}
