# Maída Website

Mediterranean restaurant website with Lebanese soul. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## Features

- 🌍 Multi-language support (EN, PT, DE, IT, ES)
- 🎨 Custom animations with Framer Motion
- 📱 Fully responsive design
- 🖱️ Custom cursor (desktop only)
- 📄 Static export for easy deployment
- 🔍 SEO optimized with Schema.org markup
- 🍽️ Interactive menu with category carousel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Building for Production

```bash
# Build and export static files
npm run build
```

The static files will be in the `out` directory. Upload this folder to your Namecheap hosting via FTP.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [lang]/            # Dynamic locale routes
│   │   ├── menu/          # Menu page
│   │   ├── layout.tsx     # Locale layout (navbar, footer)
│   │   └── page.tsx       # Homepage
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Redirect to default locale
│
├── components/
│   ├── layout/            # Navbar, Footer, etc.
│   ├── sections/          # Page sections (Hero, Story, etc.)
│   ├── ui/                # Reusable UI components
│   └── menu/              # Menu-specific components
│
├── data/
│   ├── locales/           # Translation files (JSON)
│   └── menu.json          # Menu data
│
├── lib/                   # Utilities and helpers
├── hooks/                 # Custom React hooks
└── styles/                # Global CSS
```

## Customization

### Adding Menu Items

Edit `src/data/menu.json` to add/modify menu items and categories.

### Translations

Edit files in `src/data/locales/` to update translations for each language.

### Colors & Theme

Edit `tailwind.config.js` to modify the color palette and theme.

## Deployment to Namecheap

1. Run `npm run build`
2. Connect to your Namecheap hosting via FTP
3. Upload contents of the `out` folder to your `public_html` directory
4. Done!

## Future Enhancements

- [ ] Backend API for menu management
- [ ] Admin dashboard
- [ ] Events/Catering pages
- [ ] Blog section

## License

Private - All rights reserved.
