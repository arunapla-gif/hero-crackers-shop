'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, style, delay = 0, distance = '40px', duration = '0.8s' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    if (domRef.current) observer.observe(domRef.current);
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div 
      ref={domRef} 
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance})`,
        transition: `opacity ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
