import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const MagicBento = ({ 
  cards = [], 
  className = '',
  textAutoHide = true,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}) => {
  const gridRef = useRef(null);

  useEffect(() => {
    // Initialize GSAP animations for all cards
    const cards = gridRef.current?.querySelectorAll('.magic-card');
    
    if (cards) {
      gsap.set(cards, {
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        transformPerspective: 1000,
        transformOrigin: "center center"
      });
    }
  }, []);

  const handleMouseMove = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;

    gsap.to(cardElement, {
      duration: 0.3,
      rotationX: rotateX,
      rotationY: rotateY,
      scale: 1.05,
      ease: "power2.out",
      transformOrigin: "center center"
    });

    // Update CSS custom properties for gradient position
    cardElement.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    cardElement.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = (cardElement) => {
    gsap.to(cardElement, {
      duration: 0.5,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      ease: "power2.out"
    });

    // Reset gradient position
    cardElement.style.setProperty('--mouse-x', '50%');
    cardElement.style.setProperty('--mouse-y', '50%');
  };

  const handleClick = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'magic-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    cardElement.appendChild(ripple);

    gsap.fromTo(
      ripple,
      {
        scale: 0,
        opacity: 1,
      },
      {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      }
    );
  };

  return (
    <div 
      ref={gridRef}
      className={`grid ${gridCols} gap-6 ${className}`}
    >
      {cards.map((card, index) => (
        <div
          key={card.id || index}
          className={`
            magic-card relative overflow-hidden rounded-2xl p-6 cursor-pointer
            bg-gradient-to-br ${card.gradient || 'from-emerald-500 to-green-600'}
            shadow-lg hover:shadow-xl transition-shadow duration-300
            border border-white/20
          `}
          style={{
            '--mouse-x': '50%',
            '--mouse-y': '50%',
            background: `
              radial-gradient(
                circle at var(--mouse-x) var(--mouse-y),
                rgba(255, 255, 255, 0.15) 0%,
                transparent 50%
              ),
              ${card.gradient || 'linear-gradient(135deg, #10b981, #16a34a)'}
            `
          }}
          onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
          onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          onClick={(e) => {
            handleClick(e, e.currentTarget);
            card.onClick && card.onClick();
          }}
        >
          <div className="magic-card__header flex justify-between items-start gap-3 relative text-white mb-4">
            <div className="flex items-center gap-3">
              {card.icon && (
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <card.icon className="w-6 h-6" />
                </div>
              )}
              <span className="magic-card__label text-sm font-medium opacity-90">
                {card.label}
              </span>
            </div>
            {card.value && (
              <span className="text-2xl font-bold">
                {card.value}
              </span>
            )}
          </div>
          
          <div className="magic-card__content flex flex-col relative text-white">
            <h3
              className={`magic-card__title font-semibold text-lg m-0 mb-2 ${
                textAutoHide ? "line-clamp-1" : ""
              }`}
            >
              {card.title}
            </h3>
            <p
              className={`magic-card__description text-sm leading-5 opacity-90 ${
                textAutoHide ? "line-clamp-2" : ""
              }`}
            >
              {card.description}
            </p>
          </div>

          {/* Progress bar if provided */}
          {card.progress !== undefined && (
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-white/80 transition-all duration-500"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          )}

          {/* Trend indicator if provided */}
          {card.trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${
              card.trend > 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              <span>{card.trend > 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(card.trend)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MagicBento;
