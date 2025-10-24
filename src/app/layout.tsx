import type { Metadata } from 'next';
import './globals.css';
import {
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase';
import { ClientSidebarProvider } from '@/context/client-sidebar-provider';

export const metadata: Metadata = {
  title: "Angel's Sweets Emporium",
  description: 'Deliciosas balas de coco e muito mais!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <ClientSidebarProvider>
              <Sidebar>
                <MainNav />
              </Sidebar>
              <SidebarInset>
                <Header />
                <main className="p-4 lg:p-6">{children}</main>
              </SidebarInset>
            </ClientSidebarProvider>
          </CartProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
