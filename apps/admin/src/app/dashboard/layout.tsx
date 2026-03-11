import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <div className="mb-4">
            <h2 className="text-xs uppercase text-gray-400 font-semibold mb-2">
              Catalog
            </h2>
            <Link
              href="/dashboard/products"
              className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/dashboard/categories"
              className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Categories
            </Link>
          </div>
          <div className="mb-4">
            <h2 className="text-xs uppercase text-gray-400 font-semibold mb-2">
              Operations
            </h2>
            <Link
              href="/dashboard/orders"
              className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/dashboard/shipping/zones"
              className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Shipping
            </Link>
          </div>
          <div className="mb-4">
            <h2 className="text-xs uppercase text-gray-400 font-semibold mb-2">
              Settings
            </h2>
            <Link
              href="/dashboard/users"
              className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Users
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
