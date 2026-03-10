import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfile, updateProfile } from './actions';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getProfile();
  if (!profile) {
    redirect('/sign-in');
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Profile Picture</h2>
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-300 text-2xl font-semibold text-white">
                {profile.firstName[0]?.toUpperCase() || ''}
                {profile.lastName[0]?.toUpperCase() || ''}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">
                To change your avatar, click your profile picture in the header and select "Manage
                account"
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
          <form action={updateProfile} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email is managed by your account settings
              </p>
            </div>

            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Address Management Link */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Saved Addresses</h2>
          <p className="mb-4 text-sm text-gray-600">Manage your delivery and billing addresses</p>
          <a
            href="/profile/addresses"
            className="inline-block rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Manage Addresses
          </a>
        </div>
      </div>
    </div>
  );
}
