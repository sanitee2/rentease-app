import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";
import { AuthOptions } from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import NextAuth from "next-auth";

const TWENTY_MINUTES = 20 * 60; // 20 minutes in seconds

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Find the user from Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        // Return user object, it will be available in `user` and `token`
        return user;
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/?error=true',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: TWENTY_MINUTES,
    updateAge: 60,
  },
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;

          // Check session expiration
          if (session.expires) {
            const expiryTime = new Date(session.expires).getTime();
            const currentTime = new Date().getTime();
            
            if (currentTime > expiryTime) {
              console.log('Session expired:', {
                current: new Date(currentTime).toISOString(),
                expiry: new Date(expiryTime).toISOString(),
                user: session.user.email
              });
              throw new Error('Session expired');
            }
          }
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return Promise.reject('Session expired');
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  events: {
    async signOut({ session }) {
      console.log('SignOut event:', {
        timestamp: new Date().toISOString(),
        user: session?.user?.email
      });
    },
    async session({ session }) {
      console.log('Session event:', {
        timestamp: new Date().toISOString(),
        user: session?.user?.email
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
