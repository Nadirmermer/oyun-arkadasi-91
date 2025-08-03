import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Cihazın mobil olup olmadığını kontrol eden hook
 * PWA kurulum istemi ve responsive tasarım için optimize edilmiş
 * 
 * @returns {boolean} Cihaz mobil ise true, değilse false
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // İlk kontrol - SSR safe
    checkIfMobile();

    // Media query ile responsive değişiklikler dinle
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => checkIfMobile();
    
    // Modern event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}
