import { Role } from "@prisma/client";

export interface JwtUser {
  userId: string;
  email: string;
  role: Role;
  fullName?: string | null;
  mustChangePassword: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  fullName?: string | null;
  mustChangePassword: boolean;
}
