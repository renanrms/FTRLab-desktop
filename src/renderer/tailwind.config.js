const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: 'Inter, sans-serif',
      },
      colors: {
        primary: {
          DEFAULT: 'var(--md-sys-color-primary)',
          light: 'var(--md-sys-color-primary-light)',
          dark: 'var(--md-sys-color-primary-dark)',
          0: 'var(--md-ref-palette-primary0)',
          10: 'var(--md-ref-palette-primary10)',
          20: 'var(--md-ref-palette-primary20)',
          25: 'var(--md-ref-palette-primary25)',
          30: 'var(--md-ref-palette-primary30)',
          35: 'var(--md-ref-palette-primary35)',
          40: 'var(--md-ref-palette-primary40)',
          50: 'var(--md-ref-palette-primary50)',
          60: 'var(--md-ref-palette-primary60)',
          70: 'var(--md-ref-palette-primary70)',
          80: 'var(--md-ref-palette-primary80)',
          90: 'var(--md-ref-palette-primary90)',
          95: 'var(--md-ref-palette-primary95)',
          98: 'var(--md-ref-palette-primary98)',
          99: 'var(--md-ref-palette-primary99)',
          100: 'var(--md-ref-palette-primary100)',
        },
        'on-primary': {
          DEFAULT: 'var(--md-sys-color-on-primary)',
          light: 'var(--md-sys-color-on-primary-light)',
          dark: 'var(--md-sys-color-on-primary-dark)',
        },
        'primary-container': {
          DEFAULT: 'var(--md-sys-color-primary-container)',
          light: 'var(--md-sys-color-primary-container-light)',
          dark: 'var(--md-sys-color-primary-container-dark)',
        },
        'on-primary-container': {
          DEFAULT: 'var(--md-sys-color-on-primary-container)',
          light: 'var(--md-sys-color-on-primary-container-light)',
          dark: 'var(--md-sys-color-on-primary-container-dark)',
        },
        'inverse-primary': {
          DEFAULT: 'var(--md-sys-color-inverse-primary)',
          light: 'var(--md-sys-color-inverse-primary-light)',
          dark: 'var(--md-sys-color-inverse-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--md-sys-color-secondary)',
          light: 'var(--md-sys-color-secondary-light)',
          dark: 'var(--md-sys-color-secondary-dark)',
          0: 'var(--md-ref-palette-secondary0)',
          10: 'var(--md-ref-palette-secondary10)',
          20: 'var(--md-ref-palette-secondary20)',
          25: 'var(--md-ref-palette-secondary25)',
          30: 'var(--md-ref-palette-secondary30)',
          35: 'var(--md-ref-palette-secondary35)',
          40: 'var(--md-ref-palette-secondary40)',
          50: 'var(--md-ref-palette-secondary50)',
          60: 'var(--md-ref-palette-secondary60)',
          70: 'var(--md-ref-palette-secondary70)',
          80: 'var(--md-ref-palette-secondary80)',
          90: 'var(--md-ref-palette-secondary90)',
          95: 'var(--md-ref-palette-secondary95)',
          98: 'var(--md-ref-palette-secondary98)',
          99: 'var(--md-ref-palette-secondary99)',
          100: 'var(--md-ref-palette-secondary100)',
        },
        'on-secondary': {
          DEFAULT: 'var(--md-sys-color-on-secondary)',
          light: 'var(--md-sys-color-on-secondary-light)',
          dark: 'var(--md-sys-color-on-secondary-dark)',
        },
        'secondary-container': {
          DEFAULT: 'var(--md-sys-color-secondary-container)',
          light: 'var(--md-sys-color-secondary-container-light)',
          dark: 'var(--md-sys-color-secondary-container-dark)',
        },
        'on-secondary-container': {
          DEFAULT: 'var(--md-sys-color-on-secondary-container)',
          light: 'var(--md-sys-color-on-secondary-container-light)',
          dark: 'var(--md-sys-color-on-secondary-container-dark)',
        },
        tertiary: {
          DEFAULT: 'var(--md-sys-color-tertiary)',
          light: 'var(--md-sys-color-tertiary-light)',
          dark: 'var(--md-sys-color-tertiary-dark)',
          0: 'var(--md-ref-palette-tertiary0)',
          10: 'var(--md-ref-palette-tertiary10)',
          20: 'var(--md-ref-palette-tertiary20)',
          25: 'var(--md-ref-palette-tertiary25)',
          30: 'var(--md-ref-palette-tertiary30)',
          35: 'var(--md-ref-palette-tertiary35)',
          40: 'var(--md-ref-palette-tertiary40)',
          50: 'var(--md-ref-palette-tertiary50)',
          60: 'var(--md-ref-palette-tertiary60)',
          70: 'var(--md-ref-palette-tertiary70)',
          80: 'var(--md-ref-palette-tertiary80)',
          90: 'var(--md-ref-palette-tertiary90)',
          95: 'var(--md-ref-palette-tertiary95)',
          98: 'var(--md-ref-palette-tertiary98)',
          99: 'var(--md-ref-palette-tertiary99)',
          100: 'var(--md-ref-palette-tertiary100)',
        },
        'on-tertiary': {
          DEFAULT: 'var(--md-sys-color-on-tertiary)',
          light: 'var(--md-sys-color-on-tertiary-light)',
          dark: 'var(--md-sys-color-on-tertiary-dark)',
        },
        'tertiary-container': {
          DEFAULT: 'var(--md-sys-color-tertiary-container)',
          light: 'var(--md-sys-color-tertiary-container-light)',
          dark: 'var(--md-sys-color-tertiary-container-dark)',
        },
        'on-tertiary-container': {
          DEFAULT: 'var(--md-sys-color-on-tertiary-container)',
          light: 'var(--md-sys-color-on-tertiary-container-light)',
          dark: 'var(--md-sys-color-on-tertiary-container-dark)',
        },
        error: {
          DEFAULT: 'var(--md-sys-color-error)',
          light: 'var(--md-sys-color-error-light)',
          dark: 'var(--md-sys-color-error-dark)',
          0: 'var(--md-ref-palette-error0)',
          10: 'var(--md-ref-palette-error10)',
          20: 'var(--md-ref-palette-error20)',
          25: 'var(--md-ref-palette-error25)',
          30: 'var(--md-ref-palette-error30)',
          35: 'var(--md-ref-palette-error35)',
          40: 'var(--md-ref-palette-error40)',
          50: 'var(--md-ref-palette-error50)',
          60: 'var(--md-ref-palette-error60)',
          70: 'var(--md-ref-palette-error70)',
          80: 'var(--md-ref-palette-error80)',
          90: 'var(--md-ref-palette-error90)',
          95: 'var(--md-ref-palette-error95)',
          98: 'var(--md-ref-palette-error98)',
          99: 'var(--md-ref-palette-error99)',
          100: 'var(--md-ref-palette-error100)',
        },
        'on-error': {
          DEFAULT: 'var(--md-sys-color-on-error)',
          light: 'var(--md-sys-color-on-error-light)',
          dark: 'var(--md-sys-color-on-error-dark)',
        },
        'error-container': {
          DEFAULT: 'var(--md-sys-color-error-container)',
          light: 'var(--md-sys-color-error-container-light)',
          dark: 'var(--md-sys-color-error-container-dark)',
        },
        'on-error-container': {
          DEFAULT: 'var(--md-sys-color-on-error-container)',
          light: 'var(--md-sys-color-on-error-container-light)',
          dark: 'var(--md-sys-color-on-error-container-dark)',
        },
        warning: {
          DEFAULT: 'var(--md-sys-color-warning)',
          light: 'var(--md-sys-color-warning-light)',
          dark: 'var(--md-sys-color-warning-dark)',
          0: 'var(--md-ref-palette-warning0)',
          10: 'var(--md-ref-palette-warning10)',
          20: 'var(--md-ref-palette-warning20)',
          25: 'var(--md-ref-palette-warning25)',
          30: 'var(--md-ref-palette-warning30)',
          35: 'var(--md-ref-palette-warning35)',
          40: 'var(--md-ref-palette-warning40)',
          50: 'var(--md-ref-palette-warning50)',
          60: 'var(--md-ref-palette-warning60)',
          70: 'var(--md-ref-palette-warning70)',
          80: 'var(--md-ref-palette-warning80)',
          90: 'var(--md-ref-palette-warning90)',
          95: 'var(--md-ref-palette-warning95)',
          98: 'var(--md-ref-palette-warning98)',
          99: 'var(--md-ref-palette-warning99)',
          100: 'var(--md-ref-palette-warning100)',
        },
        'on-warning': {
          DEFAULT: 'var(--md-sys-color-on-warning)',
          light: 'var(--md-sys-color-on-warning-light)',
          dark: 'var(--md-sys-color-on-warning-dark)',
        },
        'warning-container': {
          DEFAULT: 'var(--md-sys-color-warning-container)',
          light: 'var(--md-sys-color-warning-container-light)',
          dark: 'var(--md-sys-color-warning-container-dark)',
        },
        'on-warning-container': {
          DEFAULT: 'var(--md-sys-color-on-warning-container)',
          light: 'var(--md-sys-color-on-warning-container-light)',
          dark: 'var(--md-sys-color-on-warning-container-dark)',
        },
        neutral: {
          0: 'var(--md-ref-palette-neutral0)',
          10: 'var(--md-ref-palette-neutral10)',
          20: 'var(--md-ref-palette-neutral20)',
          25: 'var(--md-ref-palette-neutral25)',
          30: 'var(--md-ref-palette-neutral30)',
          35: 'var(--md-ref-palette-neutral35)',
          40: 'var(--md-ref-palette-neutral40)',
          50: 'var(--md-ref-palette-neutral50)',
          60: 'var(--md-ref-palette-neutral60)',
          70: 'var(--md-ref-palette-neutral70)',
          80: 'var(--md-ref-palette-neutral80)',
          90: 'var(--md-ref-palette-neutral90)',
          95: 'var(--md-ref-palette-neutral95)',
          98: 'var(--md-ref-palette-neutral98)',
          99: 'var(--md-ref-palette-neutral99)',
          100: 'var(--md-ref-palette-neutral100)',
        },
        background: {
          DEFAULT: 'var(--md-sys-color-background)',
          light: 'var(--md-sys-color-background-light)',
          dark: 'var(--md-sys-color-background-dark)',
        },
        'on-background': {
          DEFAULT: 'var(--md-sys-color-on-background)',
          light: 'var(--md-sys-color-on-background-light)',
          dark: 'var(--md-sys-color-on-background-dark)',
        },
        surface: {
          DEFAULT: 'var(--md-sys-color-surface)',
          light: 'var(--md-sys-color-surface-light)',
          dark: 'var(--md-sys-color-surface-dark)',
          l1: {
            DEFAULT: 'var(--md-sys-color-surface-l1)',
            light: 'var(--md-sys-color-surface-l1-light)',
            dark: 'var(--md-sys-color-surface-l1-dark)',
          },
          l2: {
            DEFAULT: 'var(--md-sys-color-surface-l2)',
            light: 'var(--md-sys-color-surface-l2-light)',
            dark: 'var(--md-sys-color-surface-l2-dark)',
          },
          l3: {
            DEFAULT: 'var(--md-sys-color-surface-l3)',
            light: 'var(--md-sys-color-surface-l3-light)',
            dark: 'var(--md-sys-color-surface-l3-dark)',
          },
          l4: {
            DEFAULT: 'var(--md-sys-color-surface-l4)',
            light: 'var(--md-sys-color-surface-l4-light)',
            dark: 'var(--md-sys-color-surface-l4-dark)',
          },
          l5: {
            DEFAULT: 'var(--md-sys-color-surface-l5)',
            light: 'var(--md-sys-color-surface-l5-light)',
            dark: 'var(--md-sys-color-surface-l5-dark)',
          },
        },
        'on-surface': {
          DEFAULT: 'var(--md-sys-color-on-surface)',
          light: 'var(--md-sys-color-on-surface-light)',
          dark: 'var(--md-sys-color-on-surface-dark)',
        },
        'inverse-surface': {
          DEFAULT: 'var(--md-sys-color-inverse-surface)',
          light: 'var(--md-sys-color-inverse-surface-light)',
          dark: 'var(--md-sys-color-inverse-surface-dark)',
        },
        'inverse-on-surface': {
          DEFAULT: 'var(--md-sys-color-inverse-on-surface)',
          light: 'var(--md-sys-color-inverse-on-surface-light)',
          dark: 'var(--md-sys-color-inverse-on-surface-dark)',
        },
        'neutral-variant': {
          0: 'var(--md-ref-palette-neutral-variant0)',
          10: 'var(--md-ref-palette-neutral-variant10)',
          20: 'var(--md-ref-palette-neutral-variant20)',
          25: 'var(--md-ref-palette-neutral-variant25)',
          30: 'var(--md-ref-palette-neutral-variant30)',
          35: 'var(--md-ref-palette-neutral-variant35)',
          40: 'var(--md-ref-palette-neutral-variant40)',
          50: 'var(--md-ref-palette-neutral-variant50)',
          60: 'var(--md-ref-palette-neutral-variant60)',
          70: 'var(--md-ref-palette-neutral-variant70)',
          80: 'var(--md-ref-palette-neutral-variant80)',
          90: 'var(--md-ref-palette-neutral-variant90)',
          95: 'var(--md-ref-palette-neutral-variant95)',
          98: 'var(--md-ref-palette-neutral-variant98)',
          99: 'var(--md-ref-palette-neutral-variant99)',
          100: 'var(--md-ref-palette-neutral-variant100)',
        },
        'surface-variant': {
          DEFAULT: 'var(--md-sys-color-surface-variant)',
          light: 'var(--md-sys-color-surface-variant-light)',
          dark: 'var(--md-sys-color-surface-variant-dark)',
        },
        'on-surface-variant': {
          DEFAULT: 'var(--md-sys-color-on-surface-variant)',
          light: 'var(--md-sys-color-on-surface-variant-light)',
          dark: 'var(--md-sys-color-on-surface-variant-dark)',
        },
        outline: {
          DEFAULT: 'var(--md-sys-color-outline)',
          light: 'var(--md-sys-color-outline-light)',
          dark: 'var(--md-sys-color-outline-dark)',
        },
        'outline-variant': {
          DEFAULT: 'var(--md-sys-color-outline-variant)',
          light: 'var(--md-sys-color-outline-variant-light)',
          dark: 'var(--md-sys-color-outline-variant-dark)',
        },
        shadow: {
          DEFAULT: 'var(--md-sys-color-shadow)',
          light: 'var(--md-sys-color-shadow-light)',
          dark: 'var(--md-sys-color-shadow-dark)',
        },
        'surface-tint': {
          DEFAULT: 'var(--md-sys-color-surface-tint)',
          light: 'var(--md-sys-color-surface-tint-light)',
          dark: 'var(--md-sys-color-surface-tint-dark)',
        },
        scrim: {
          DEFAULT: 'var(--md-sys-color-scrim)',
          light: 'var(--md-sys-color-scrim-light)',
          dark: 'var(--md-sys-color-scrim-dark)',
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.region-drag': {
          '-webkit-app-region': 'drag',
        },
        '.region-no-drag': {
          '-webkit-app-region': 'no-drag',
        },
      })
    }),
  ],
}
