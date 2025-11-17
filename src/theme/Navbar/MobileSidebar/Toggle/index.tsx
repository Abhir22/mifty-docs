import React from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import IconMenu from '@theme/Icon/Menu';

export default function MobileSidebarToggle(): JSX.Element {
  const {toggle, shown} = useNavbarMobileSidebar();
  
  return (
    <button
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      aria-label={
        shown
          ? translate({
              id: 'theme.docs.sidebar.closeSidebarButtonAriaLabel',
              message: 'Close navigation bar',
              description: 'The ARIA label for close button of mobile sidebar',
            })
          : translate({
              id: 'theme.docs.sidebar.openSidebarButtonAriaLabel', 
              message: 'Open navigation bar',
              description: 'The ARIA label for open button of mobile sidebar',
            })
      }
      aria-expanded={shown}
      className="navbar__toggle clean-btn"
      type="button"
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <IconMenu />
    </button>
  );
}