import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryParams,
} from "@/validators/user";
import { Role } from "@prisma/client";

// Exclude password field helper
function sanitizeUser(user: any) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUsers(params: UserQueryParams) {
  const { search, role, status, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role as Role;
  }

  if (status && status !== "ALL") {
    where.isActive = status === "ACTIVE";
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(sanitizeUser),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  return sanitizeUser(user);
}

export async function createUser(data: CreateUserInput) {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("A user with this email address already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      isActive: data.isActive,
    },
  });

  return sanitizeUser(newUser);
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  currentAdminId: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Self-Protection: Check if demoting or deactivating the last active Admin account
  if (targetUser.role === Role.ADMIN) {
    const isDemoting = data.role && data.role !== Role.ADMIN;
    const isDeactivating = data.isActive === false;

    if (isDemoting || isDeactivating) {
      const activeAdminCount = await prisma.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });

      if (activeAdminCount <= 1) {
        throw new Error(
          "Action denied: You cannot de-activate or demote the final active Admin account"
        );
      }
    }
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name.trim();

  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (normalizedEmail !== targetUser.email) {
      const emailCheck = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailCheck) {
        throw new Error("A user with this email address already exists");
      }
      updateData.email = normalizedEmail;
    }
  }

  if (data.role) updateData.role = data.role;
  if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return sanitizeUser(updatedUser);
}

export async function toggleUserStatus(
  id: string,
  isActive: boolean,
  currentAdminId: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Self-Protection: Prevent deactivating final active Admin
  if (!isActive && targetUser.role === Role.ADMIN) {
    const activeAdminCount = await prisma.user.count({
      where: { role: Role.ADMIN, isActive: true },
    });

    if (activeAdminCount <= 1) {
      throw new Error("Action denied: Cannot deactivate the final active Admin account");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  return sanitizeUser(updatedUser);
}

export async function adminResetPassword(userId: string, newPassword: string) {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true, message: "User password updated successfully" };
}

export async function deleteUser(id: string, currentAdminId: string) {
  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { take: 1 },
      invoicesCreated: { take: 1 },
      paymentsProcessed: { take: 1 },
      ordersCancelled: { take: 1 },
    },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Self-Protection: Prevent deleting final active Admin
  if (targetUser.role === Role.ADMIN) {
    const activeAdminCount = await prisma.user.count({
      where: { role: Role.ADMIN, isActive: true },
    });

    if (activeAdminCount <= 1) {
      throw new Error("Action denied: Cannot delete the final active Admin account");
    }
  }

  // Check if user has historical records
  const hasHistory =
    targetUser.orders.length > 0 ||
    targetUser.invoicesCreated.length > 0 ||
    targetUser.paymentsProcessed.length > 0 ||
    targetUser.ordersCancelled.length > 0;

  if (hasHistory) {
    // Soft deactivation to preserve financial/audit record integrity
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return {
      success: true,
      softDeleted: true,
      message:
        "User account has historical orders/audit logs. Account has been deactivated instead of deleted to maintain data integrity.",
    };
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true, softDeleted: false, message: "User deleted successfully" };
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Generic message to avoid user enumeration vulnerability
  const genericResponse = {
    success: true,
    message: "If an account with that email exists, reset instructions have been generated.",
  };

  if (!user || !user.isActive) {
    return genericResponse;
  }

  // Generate cryptographically secure raw token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

  // Delete previous reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    ...genericResponse,
    rawToken, // Provided for dev testing verification
    email: normalizedEmail,
  };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord) {
    throw new Error("Invalid or expired password reset token");
  }

  if (resetRecord.usedAt) {
    throw new Error("This password reset token has already been used");
  }

  if (new Date() > resetRecord.expiresAt) {
    throw new Error("This password reset token has expired");
  }

  if (!resetRecord.user.isActive) {
    throw new Error("Account is currently inactive. Contact your administrator.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password & invalidate token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, message: "Password reset successful. You may now log in with your new password." };
}
