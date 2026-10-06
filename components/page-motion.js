'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const elements = [...document.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    // Content stays visible without JS; only sections below the first screen animate.
    for (const element of elements) {
      if (element.getBoundingClientRect().top > window.innerHeight * 0.95) {
        element.classList.add('reveal-pending');
        observer.observe(element);
      }
    }
    function disableMotion(event) {
      if (event.matches) {
        elements.forEach(element => element.classList.remove('reveal-pending'));
        observer.disconnect();
      }
    }
    preference.addEventListener('change', disableMotion);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', disableMotion);
      elements.forEach(element => element.classList.remove('reveal-pending'));
    };
  }, [pathname]);
  return null;
}
