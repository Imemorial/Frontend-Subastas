/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        space: {
          DEFAULT: '#0B0F19',
          dark: '#050508',
          card: '#0f0f14',
          velvet: '#12100e',
        },
        neon: {
          cyan: '#06B6D4',
          'cyan-dim': '#0891B2',
          magenta: '#D946EF',
          'magenta-dim': '#A21CAF',
          emerald: '#10B981',
          'emerald-dim': '#059669',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dim: '#D97706',
          dark: '#B45309',
        },
        casino: {
          red: '#DC2626',
          'red-dim': '#991B1B',
        },
      },
      fontFamily: {
        display: ['"Outfit"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-border': 'linear-gradient(135deg, #F59E0B 0%, #D946EF 50%, #10B981 100%)',
        'gold-shine': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 40%, #D97706 100%)',
        'glass-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
        'velvet-spotlight':
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245, 158, 11, 0.12), transparent)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.45), 0 0 40px rgba(6, 182, 212, 0.15)',
        'neon-cyan-lg': '0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.25)',
        'neon-magenta': '0 0 20px rgba(217, 70, 239, 0.55), 0 0 40px rgba(217, 70, 239, 0.2)',
        'neon-magenta-lg': '0 0 30px rgba(217, 70, 239, 0.7), 0 0 60px rgba(217, 70, 239, 0.3)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.45)',
        gold: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2)',
        'gold-lg': '0 0 30px rgba(245, 158, 11, 0.65), 0 0 60px rgba(245, 158, 11, 0.25)',
        'gold-inner': 'inset 0 1px 0 rgba(252, 211, 77, 0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        jackpot: '0 0 40px rgba(245, 158, 11, 0.4), 0 0 80px rgba(16, 185, 129, 0.15)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 1.2s ease-in-out infinite',
        'pulse-urgent': 'pulseUrgent 0.6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'glow-cyan': 'glowCyan 2.5s ease-in-out infinite alternate',
        'glow-gold': 'glowGold 2s ease-in-out infinite alternate',
        'slide-in-bid': 'slideInBid 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float-bit': 'floatBit 1.2s ease-out forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 35s linear infinite',
        'coin-flip': 'coinFlip 0.6s ease-out',
        'cta-pulse': 'ctaPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': {
            opacity: '1',
            textShadow: '0 0 8px #D946EF, 0 0 20px rgba(217, 70, 239, 0.5)',
          },
          '50%': {
            opacity: '0.9',
            textShadow: '0 0 16px #D946EF, 0 0 40px #D946EF, 0 0 60px rgba(217, 70, 239, 0.4)',
          },
        },
        pulseUrgent: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)' },
          '50%': { transform: 'scale(1.03)', boxShadow: '0 0 35px rgba(220, 38, 38, 0.7)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.6), 0 0 50px rgba(245, 158, 11, 0.2)' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.2)' },
        },
        glowGold: {
          '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.05)' },
          '100%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.55), inset 0 0 30px rgba(245, 158, 11, 0.1)' },
        },
        slideInBid: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatBit: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        coinFlip: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.15)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
        ctaPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(245, 158, 11, 0.7), 0 0 60px rgba(245, 158, 11, 0.25)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
