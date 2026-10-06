import './globals.css';
import '@fontsource-variable/dm-sans/index.css';
import { AppShell } from '../components/app-shell';

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export const metadata = {
  title: { default:'Recall — Belajar, pahami, ingat.', template:'%s | Recall' },
  description: 'Ubah PDF, video YouTube, dan gambar menjadi flashcard. Latih active recall dan simpan progres belajarmu.',
};

export default function RootLayout({ children }) {
  return <html lang="id"><body><AppShell>{children}</AppShell></body></html>;
}
