import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extracts the pathname from the current location
  const { pathname } = useLocation();

  // This effect runs every time the pathname changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This creates the smooth scrolling effect
    });
  }, [pathname]);

  return null; // This component does not render anything
};

export default ScrollToTop;