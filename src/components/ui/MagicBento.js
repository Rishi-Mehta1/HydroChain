import React, { useRef } from 'react';
import './MagicBento.css';

const MagicBento = ({ 
  cards = [], 
  className = '',
  textAutoHide = true,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}) => {
  const gridRef = useRef(null);


  const handleMouseMove = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;

    // Use CSS transforms instead of GSAP
    cardElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    cardElement.style.transition = 'transform 0.3s ease-out';

    // Update CSS custom properties for gradient position
    cardElement.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    cardElement.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = (cardElement) => {
    // Use CSS transforms instead of GSAP
    cardElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    cardElement.style.transition = 'transform 0.5s ease-out';

    // Reset gradient position
    cardElement.style.setProperty('--mouse-x', '50%');
    cardElement.style.setProperty('--mouse-y', '50%');
  };

  const handleClick = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple effect with CSS animation
    const ripple = document.createElement('div');
    ripple.className = 'magic-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.position = 'absolute';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple-effect 0.8s ease-out forwards';
    
    cardElement.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 800);
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
