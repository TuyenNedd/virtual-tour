import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Tour Viewer',
  description: '3D Virtual Tour Viewer with panorama, dollhouse, and floorplan modes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
