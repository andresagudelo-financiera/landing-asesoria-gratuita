import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function HeroBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const particles = gsap.utils.toArray('.hero-particle');

        particles.forEach((particle: any) => {
            // Initial random position
            gsap.set(particle, {
                x: gsap.utils.random(0, window.innerWidth),
                y: gsap.utils.random(0, window.innerHeight),
                scale: gsap.utils.random(0.5, 1.5),
                opacity: gsap.utils.random(0.1, 0.3)
            });

            // Continuous animation
            gsap.to(particle, {
                duration: gsap.utils.random(10, 20),
                x: `+=${gsap.utils.random(-200, 200)}`,
                y: `+=${gsap.utils.random(-100, 100)}`,
                rotation: gsap.utils.random(0, 360),
                scale: gsap.utils.random(0.5, 1.5),
                opacity: gsap.utils.random(0.1, 0.3),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                modifiers: {
                    x: gsap.utils.unitize((x) => parseFloat(x) % window.innerWidth), // Wrap around screen width
                    y: gsap.utils.unitize((y) => parseFloat(y) % window.innerHeight) // Wrap around screen height
                }
            });
        });
    }, { scope: containerRef });

    // Colors aligned with brand
    const colors = [
        'bg-claudia-accent-orange',
        'bg-claudia-accent-green',
        'bg-claudia-accent-blue',
        'bg-claudia-accent-purple'
    ];

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Generate 15 particles */}
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className={`hero-particle absolute rounded-full blur-[60px] md:blur-[100px] w-32 h-32 md:w-64 md:h-64 mix-blend-screen ${colors[i % colors.length]}`}
                />
            ))}
        </div>
    );
}
