import type { Metadata } from 'next';
import { ClerkProvider, UserButton, SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { MegaMenu } from '@/components/navigation/mega-menu';
import { SearchBar } from '@/components/search/search-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'Modern e-commerce application',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white text-gray-900 antialiased">
          <NuqsAdapter>
          <header className="border-b border-gray-200">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <a href="/" className="text-xl font-bold">
                Store
              </a>
              <div className="flex-1 max-w-md mx-4">
                <SearchBar />
              </div>
              <div className="flex items-center gap-6">
                <a href="/products" className="text-sm hover:text-gray-600">
                  Products
                </a>
                <a href="/cart" className="text-sm hover:text-gray-600">
                  Cart
                </a>
                {userId ? (
                  <>
                    <a href="/profile" className="text-sm hover:text-gray-600">
                      Profile
                    </a>
                    <UserButton />
                  </>
                ) : (
                  <SignInButton mode="redirect">
                    <button className="text-sm hover:text-gray-600">Sign In</button>
                  </SignInButton>
                )}
              </div>
            </nav>
            <Suspense fallback={<div className="h-12" />}>
              <MegaMenu />
            </Suspense>
          </header>
          <main>{children}</main>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  );
}
