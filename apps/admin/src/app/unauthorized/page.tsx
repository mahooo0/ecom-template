export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You do not have permission to access the admin panel.
        </p>
        <p className="text-sm text-gray-500">
          Please contact an administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
