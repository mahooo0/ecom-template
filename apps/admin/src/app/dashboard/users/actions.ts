'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Verify that the current user has admin privileges
 * @returns The user's role
 * @throws Redirects to /unauthorized if user is not an admin
 */
async function verifyAdmin() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }
  return role;
}

/**
 * Get paginated list of all users
 */
export async function getUsers(page = 1, limit = 20) {
  await verifyAdmin();

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            addresses: true,
            reviews: true,
            wishlists: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get detailed information about a specific user
 */
export async function getUserDetail(userId: string) {
  await verifyAdmin();

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      _count: {
        select: {
          reviews: true,
          wishlists: true,
        },
      },
    },
  });

  if (!dbUser) {
    return null;
  }

  // Get Clerk user for status info
  const clerkUser = await clerkClient().users.getUser(dbUser.clerkId);

  return {
    ...dbUser,
    banned: clerkUser.banned,
  };
}

/**
 * Update a user's role
 */
export async function setUserRole(
  userId: string,
  newRole: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
) {
  await verifyAdmin();

  // Get database user to get clerkId
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  // Update Clerk metadata
  await clerkClient().users.updateUserMetadata(dbUser.clerkId, {
    publicMetadata: { role: newRole },
  });

  // Update local database for immediate consistency
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Revalidate pages
  revalidatePath('/dashboard/users');
  revalidatePath(`/dashboard/users/${userId}`);

  return { success: true };
}

/**
 * Toggle user account status (ban/unban)
 */
export async function toggleUserStatus(userId: string, shouldBan: boolean) {
  await verifyAdmin();

  // Get database user to get clerkId
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  // Ban or unban in Clerk
  if (shouldBan) {
    await clerkClient().users.banUser(dbUser.clerkId);
  } else {
    await clerkClient().users.unbanUser(dbUser.clerkId);
  }

  // Update local database
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !shouldBan },
  });

  // Revalidate pages
  revalidatePath('/dashboard/users');
  revalidatePath(`/dashboard/users/${userId}`);

  return { success: true };
}
