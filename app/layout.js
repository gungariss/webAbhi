import './globals.css';

export const metadata = {
  title: 'webAbhi',
  description: 'Website webAbhi dengan Next.js',
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
