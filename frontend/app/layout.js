import './globals.css';

export const metadata = {
  title: 'ExportHub Marketplace',
  description: 'Buy and sell goods globally with ExportHub.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
