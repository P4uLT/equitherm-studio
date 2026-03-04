/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        hot: 'hsl(var(--hot))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        figtree: ['Figtree', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        // Fluid typography scale using CSS custom properties
        'fluid-xs': ['var(--font-size-fluid-xs)', { lineHeight: '1.25rem' }],
        'fluid-sm': ['var(--font-size-fluid-sm)', { lineHeight: '1.375rem' }],
        'fluid-base': ['var(--font-size-fluid-base)', { lineHeight: '1.5rem' }],
        'fluid-lg': ['var(--font-size-fluid-lg)', { lineHeight: '1.75rem' }],
        'fluid-xl': ['var(--font-size-fluid-xl)', { lineHeight: '1.875rem' }],
        'fluid-2xl': ['var(--font-size-fluid-2xl)', { lineHeight: '2rem' }],
        'fluid-3xl': ['var(--font-size-fluid-3xl)', { lineHeight: '2.25rem' }],
      },
      transitionDuration: {
        'medium': '300ms',
        'slow': '500ms',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '500',
        'modal': '1000',
        'tooltip': '9999',
      },
      // Container query breakpoints
      containers: {
        xs: '320px',
        sm: '384px',
        md: '448px',
        lg: '512px',
        xl: '576px',
        '2xl': '672px',
      },
      // Dynamic viewport height utilities
      height: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
      minHeight: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
      maxHeight: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
      // Touch target sizing helpers (minimum 44x44 for accessibility)
      spacing: {
        'touch': '2.75rem', // 44px - minimum touch target size
      },
      minWidth: {
        'touch': '2.75rem',
      },
      minHeight: {
        'touch': '2.75rem',
      },
    },
  },
  plugins: [],
}
