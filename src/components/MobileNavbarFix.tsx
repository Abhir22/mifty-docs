import React from 'react';
import {useEffect} from 'react';

export default function MobileNavbarFix(): null {
  useEffect(() => {
    // Fix for mobile navbar text corruption issue
    const fixMobileNavbar = () => {
      const navbarTitle = document.querySelector('.navbar-sidebar .navbar__title');
      if (navbarTitle && navbarTitle.textContent !== 'Mifty') {
        navbarTitle.textContent = 'Mifty';
      }

      // Ensure proper font loading
      const navbarElements = document.querySelectorAll('.navbar-sidebar *');
      navbarElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.fontFamily = 'var(--ifm-font-family-base)';
          element.style.textRendering = 'optimizeLegibility';
        }
      });
    };

    // Run fix when mobile sidebar opens
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('navbar-sidebar--show')) {
            setTimeout(fixMobileNavbar, 100);
          }
        }
      });
    });

    // Observe body class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial fix
    fixMobileNavbar();

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}