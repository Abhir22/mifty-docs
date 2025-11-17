import React from 'react';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import NavbarMobileSidebar from '@theme-original/Navbar/MobileSidebar';
import type NavbarMobileSidebarType from '@theme/Navbar/MobileSidebar';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof NavbarMobileSidebarType>;

export default function NavbarMobileSidebarWrapper(props: Props): JSX.Element {
  const mobileSidebar = useNavbarMobileSidebar();

  // Ensure proper cleanup when component unmounts
  React.useEffect(() => {
    return () => {
      if (mobileSidebar.shown) {
        mobileSidebar.toggle();
      }
    };
  }, []);

  // Add keyboard event handling for better accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileSidebar.shown) {
        mobileSidebar.toggle();
      }
    };

    if (mobileSidebar.shown) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileSidebar.shown]);

  return <NavbarMobileSidebar {...props} />;
}