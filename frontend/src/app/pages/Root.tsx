import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';

export function Root() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // No hash — scroll to top as before
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }

    // Hash present — wait for page to render then scroll to element
    const id = hash.replace('#', '');
    const NAVBAR_OFFSET = 155; // announcement bar + main nav + tab bar

    const attemptScroll = (attemptsLeft: number) => {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (attemptsLeft > 0) {
        // Element not yet in DOM — retry after short delay
        setTimeout(() => attemptScroll(attemptsLeft - 1), 120);
      }
    };

    // Small initial delay lets React finish rendering the page
    setTimeout(() => attemptScroll(5), 80);
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

