import { useState, useEffect } from 'react';

/**
 * WhatsAppButton - Floating Action Button for 1-1 Support
 * Tracks lead sources (UTM) and provides a personalized message.
 */
export default function WhatsAppButton() {
    const [source, setSource] = useState('la web');
    const phoneNumber = "573158953666";

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source');
            const utmMedium = urlParams.get('utm_medium');
            const utmCampaign = urlParams.get('utm_campaign');

            if (utmSource) {
                setSource(utmSource === 'ig' || utmSource === 'instagram' ? 'Instagram' :
                    utmSource === 'fb' || utmSource === 'facebook' ? 'Facebook' :
                        utmSource === 'live' ? 'el Live' : utmSource);
            } else if (document.referrer) {
                if (document.referrer.includes('instagram.com')) setSource('Instagram (Organic)');
                else if (document.referrer.includes('facebook.com')) setSource('Facebook (Organic)');
            }
        }
    }, []);

    const handleClick = () => {
        // Track click event for analytics
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('trackCustom', 'GoogleFormSupportClick', {
                source: source,
                page: window.location.pathname
            });
        }

        window.open('https://forms.gle/142XfFRCvSJC7AZx5', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] group">
            {/* Tooltip */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ¿Tienes dudas? Déjanos tus datos
            </span>

            {/* Button */}
            <button
                onClick={handleClick}
                className="relative w-14 h-14 bg-rebellion-cyan text-glimpse-space rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-[pulse-support_2s_infinite]"
                aria-label="Contactar para Soporte"
            >
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            </button>

            <style>{`
        @keyframes pulse-support {
          0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(0, 212, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
        }
      `}</style>
        </div>
    );
}
