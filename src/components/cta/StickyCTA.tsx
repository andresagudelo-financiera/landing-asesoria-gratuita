import { useState, useEffect } from 'react';

/**
 * StickyCTA - React Island
 * Botón flotante que aparece después del scroll
 * Dispara evento InitiateCheckout de Meta Pixel
 */
export default function StickyCTA({
  ctaUrl = "https://typebot.co/asesoria-gratuita-org-nova-050sprd"
}: { ctaUrl?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [finalUrl, setFinalUrl] = useState(ctaUrl);


  useEffect(() => {
    // Append current URL params to the CTA URL
    const params = window.location.search;
    if (params) {
      const separator = ctaUrl?.includes('?') ? '&' : '?';
      setFinalUrl(`${ctaUrl}${separator}${params.substring(1)}`);
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 500); // Show after scrolling a bit
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
        }
      `}
    >
      <a
        href={finalUrl}
        onClick={(e) => {
          e.preventDefault();
          if ((window as any).Typebot) {
            (window as any).Typebot.open();
          }
        }}
        className="
          relative
          bg-claudia-accent-green
          text-claudia-dark font-bold
          px-8 py-4 rounded-full
          text-sm truncate md:text-lg uppercase tracking-wider
          shadow-lg shadow-claudia-accent-green/20
          transition-all duration-300
          hover:scale-105
          active:scale-95
          flex items-center gap-3
          border-2 border-white/10 hover:border-white/30
        "
      >
        <span>OBTENER MI PLAN</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
    </div>
  );
}
