import type { Metadata } from 'next';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'Modern e-commerce application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white text-gray-900 antialiased">
          <header className="border-b border-gray-200">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <a href="/" className="text-xl font-bold">
                Store
              </a>
              <div className="flex items-center gap-6">
                <a href="/products" className="text-sm hover:text-gray-600">
                  Products
                </a>
                <a href="/cart" className="text-sm hover:text-gray-600">
                  Cart
                </a>
                <SignedIn>
                  <a href="/profile" className="text-sm hover:text-gray-600">
                    Profile
                  </a>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <a href="/sign-in" className="text-sm hover:text-gray-600">
                    Sign In
                  </a>
                </SignedOut>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
