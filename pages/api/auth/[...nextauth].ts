import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

const ONE_HOUR = 60 * 60; // 1 hour in seconds (3600 seconds)

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  
  session: {
    strategy: "jwt",
    maxAge: ONE_HOUR,
    updateAge: 0, // Disable auto-update to handle it manually
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }


      // Only update expiration on new tokens or explicit updates
      if (!token.exp || token.update) {
        token.exp = Math.floor(Date.now() / 1000) + ONE_HOUR;
        delete token.update;
      }

      return token;
    },

    async session({ session, token }) {
      try {
        if (!token.exp || Date.now() >= token.exp * 1000) {
          throw new Error('Session expired');
        }

        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return Promise.reject("Session expired");
      }
    },
  },

  events: {
    async signOut({ session }) {
      console.log("SignOut event:", {
        timestamp: new Date().toISOString(),
        user: session?.user?.email,
      });
    },
    async session({ session }) {
      console.log("Session event:", {
        timestamp: new Date().toISOString(),
        user: session?.user?.email,
      });
    },
  },
  
  pages: {
    signIn: "/",
    error: "/?error=true",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
