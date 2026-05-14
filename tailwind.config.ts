
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
				full: 'var(--radius-full)',
			},
			zIndex: {
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
				'1-sem': 'var(--space-1)',
				'2-sem': 'var(--space-2)',
				'3-sem': 'var(--space-3)',
				'4-sem': 'var(--space-4)',
				'6-sem': 'var(--space-6)',
				'8-sem': 'var(--space-8)',
				'12-sem': 'var(--space-12)',
				'16-sem': 'var(--space-16)',
				'20-sem': 'var(--space-20)',
				'layout-gap': 'var(--layout-gap)',
				'section-gap': 'var(--section-gap)',
			},
			fontSize: {
				'display': ['var(--font-display)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
				'h1': ['var(--font-h1)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
				'h2': ['var(--font-h2)', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
				'h3': ['var(--font-h3)', { lineHeight: '1.4', fontWeight: '600' }],
				'h4': ['var(--font-h4)', { lineHeight: '1.5', fontWeight: '600' }],
				'body-lg': ['var(--font-body-lg)', { lineHeight: '1.6', fontWeight: '400' }],
				'body-base': ['var(--font-body-base)', { lineHeight: '1.6', fontWeight: '400' }],
				'body-sm': ['var(--font-body-sm)', { lineHeight: '1.6', fontWeight: '400' }],
				'label': ['var(--font-label)', { lineHeight: '1.5', fontWeight: '600' }],
				'caption': ['var(--font-caption)', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
			},

			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
