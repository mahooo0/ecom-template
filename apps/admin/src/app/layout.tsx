import type { Metadata } from 'next';
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import { AdminChatWidget } from '@/components/ai-assistant/AdminChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'E-commerce admin panel',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
          <div className="flex">
            <aside className="fixed h-screen w-64 border-r border-gray-200 bg-white px-4 py-6">
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <UserButton />
              </div>
              <nav className="flex flex-col gap-2">
                <a href="/dashboard" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Dashboard
                </a>
                <a href="/dashboard/products" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Products
                </a>
                <a href="/dashboard/orders" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Orders
                </a>
                <a href="/dashboard/users" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Users
                </a>
              </nav>
            </aside>
            <main className="ml-64 flex-1 p-8">{children}</main>
          </div>
          <AdminChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
