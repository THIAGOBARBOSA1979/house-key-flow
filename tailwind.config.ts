
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Design System Tokens
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					foreground: 'hsl(var(--brand-foreground))',
				},
				status: {
					pending: {
						DEFAULT: 'hsl(var(--status-pending))',
						foreground: 'hsl(var(--status-pending-foreground))',
					},
					progress: {
						DEFAULT: 'hsl(var(--status-progress))',
						foreground: 'hsl(var(--status-progress-foreground))',
					},
					complete: {
						DEFAULT: 'hsl(var(--status-complete))',
						foreground: 'hsl(var(--status-complete-foreground))',
					},
					critical: {
						DEFAULT: 'hsl(var(--status-critical))',
						foreground: 'hsl(var(--status-critical-foreground))',
					},
				}

			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xs: 'var(--radius-xs)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				full: 'var(--radius-full)',
			},
			zIndex: {
				hide: 'var(--z-hide)',
				base: 'var(--z-base)',
				docked: 'var(--z-docked)',
				dropdown: 'var(--z-dropdown)',
				sticky: 'var(--z-sticky)',
				fixed: 'var(--z-fixed)',
				modal: 'var(--z-modal)',
				popover: 'var(--z-popover)',
				tooltip: 'var(--z-tooltip)',
			},
			opacity: {
				disabled: 'var(--opacity-disabled)',
				muted: 'var(--opacity-muted)',
				hover: 'var(--opacity-hover)',
			},
			spacing: {
				'0.5-sem': 'var(--space-0-5)',
				'1-sem': 'var(--space-1)',
				'1.5-sem': 'var(--space-1-5)',
				'2-sem': 'var(--space-2)',
				'3-sem': 'var(--space-3)',
				'4-sem': 'var(--space-4)',
				'5-sem': 'var(--space-5)',
				'6-sem': 'var(--space-6)',
				'8-sem': 'var(--space-8)',
				'10-sem': 'var(--space-10)',
				'12-sem': 'var(--space-12)',
				'16-sem': 'var(--space-16)',
				'20-sem': 'var(--space-20)',
				'24-sem': 'var(--space-24)',
				'32-sem': 'var(--space-32)',
				'layout-gap': 'var(--layout-gap)',
				'section-gap': 'var(--section-gap)',
			},
			fontSize: {
				'sem-display': ['var(--font-display)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
				'sem-h1': ['var(--font-h1)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
				'sem-h2': ['var(--font-h2)', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
				'sem-h3': ['var(--font-h3)', { lineHeight: '1.4', fontWeight: '600' }],
				'sem-h4': ['var(--font-h4)', { lineHeight: '1.5', fontWeight: '600' }],
				'sem-body-lg': ['var(--font-body-lg)', { lineHeight: '1.6', fontWeight: '400' }],
				'sem-body-base': ['var(--font-body-base)', { lineHeight: '1.6', fontWeight: '400' }],
				'sem-body-sm': ['var(--font-body-sm)', { lineHeight: '1.6', fontWeight: '400' }],
				'sem-label': ['var(--font-label)', { lineHeight: '1.5', fontWeight: '600' }],
				'sem-caption': ['var(--font-caption)', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
				'sem-tiny': ['var(--font-tiny)', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.02em' }],
			},
			transitionDuration: {
				fast: 'var(--duration-fast)',
				normal: 'var(--duration-normal)',
				slow: 'var(--duration-slow)',
				slower: 'var(--duration-slower)',
			},
			transitionTimingFunction: {
				'in-sem': 'var(--ease-in)',
				'out-sem': 'var(--ease-out)',
				'in-out-sem': 'var(--ease-in-out)',
				'spring-sem': 'var(--ease-spring)',
			},
			boxShadow: {
				'sem-sm': 'var(--shadow-sm)',
				'sem-md': 'var(--shadow-md)',
				'sem-lg': 'var(--shadow-lg)',
				'sem-xl': 'var(--shadow-xl)',
				'sem-inner': 'var(--shadow-inner)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(4px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down var(--duration-fast) var(--ease-out)',
				'accordion-up': 'accordion-up var(--duration-fast) var(--ease-out)',
				'fade-in': 'fade-in var(--duration-slow) var(--ease-out)',
				'slide-up': 'slide-up var(--duration-slow) var(--ease-spring)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
