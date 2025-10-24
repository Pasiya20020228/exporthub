import './globals.css';

import SiteChrome from './components/SiteChrome';
import SessionProvider from './providers/SessionProvider';

export const metadata = {
  title: 'ExportHub Marketplace',
  description: 'Buy and sell goods globally with ExportHub.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SiteChrome>{children}</SiteChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
