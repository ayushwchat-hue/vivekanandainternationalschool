import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element); // Only animate once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
};

// Helper for staggered animations with multiple items
export const useStaggeredAnimation = (itemCount: number, options: UseScrollAnimationOptions = {}) => {
  const { ref, isVisible } = useScrollAnimation(options);
  
  const getItemClass = (index: number) => {
    const baseDelay = index * 100;
    return isVisible 
      ? `animate-slide-up opacity-100`
      : 'opacity-0 translate-y-8';
  };
  
  const getItemStyle = (index: number) => ({
    transitionDelay: `${index * 100}ms`,
  });

  return { ref, isVisible, getItemClass, getItemStyle };
};
