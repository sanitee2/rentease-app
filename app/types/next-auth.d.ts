import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string; // Ensure role is typed as string
    };
  }

  interface User {
    id: string;
    role: string; // Role is also typed as string
  }
}