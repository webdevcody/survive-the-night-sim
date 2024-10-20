import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Use 'class' strategy for toggling dark mode
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: ["dark", "light"], // Safelist the 'light' class
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Light mode colors
        light: {
          border: "hsl(var(--light-border))",
          input: "hsl(var(--light-input))",
          ring: "hsl(var(--light-ring))",
          background: "hsl(var(--light-background))",
          foreground: "hsl(var(--light-foreground))",
          primary: {
            DEFAULT: "hsl(var(--light-primary))",
            foreground: "hsl(var(--light-primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--light-secondary))",
            foreground: "hsl(var(--light-secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--light-destructive))",
            foreground: "hsl(var(--light-destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--light-muted))",
            foreground: "hsl(var(--light-muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--light-accent))",
            foreground: "hsl(var(--light-accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--light-popover))",
            foreground: "hsl(var(--light-popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--light-card))",
            foreground: "hsl(var(--light-card-foreground))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
};

export default config;
