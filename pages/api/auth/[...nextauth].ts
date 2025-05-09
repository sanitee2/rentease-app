import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { authPrisma } from "@/app/libs/prismadb";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

const ONE_HOUR = 60 * 60; // 1 hour in seconds (3600 seconds)

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(authPrisma),
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

        const user = await authPrisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            hashedPassword: true,
            role: true,
            image: true,
            firstName: true,
            lastName: true
          }
        });

        if (!user || !user.hashedPassword) {
          console.error('Auth failed: User not found or no password');
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          console.error('Auth failed: Incorrect password');
          throw new Error("Invalid credentials");
        }

        // Return user with required fields and handle null values
        return {
          id: user.id,
          email: user.email || '',
          role: user.role,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          image: user.image || ''
        };
      },
    }),
  ],
  
  session: {
    strategy: "jwt",
    maxAge: ONE_HOUR,
    updateAge: ONE_HOUR / 2, // Update session halfway through its lifetime
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        // Handle session updates
        return { ...token, ...session.user };
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        // Combine firstName and lastName for the name
        token.name = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.email?.split('@')[0] || 'User';
        token.picture = user.image;
      }

      // Set or update token expiration
      token.exp = Math.floor(Date.now() / 1000) + ONE_HOUR;
      
      return token;
    },

    async session({ session, token }) {
      try {
        if (!token?.exp || Date.now() >= (token.exp * 1000)) {
          throw new Error('Session expired');
        }

        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return Promise.reject("Session expired");
      }
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Sign in event:', {
        userId: user.id,
        provider: account?.provider,
        isNewUser
      });
    },
    async signOut({ session, token }) {
      console.log("SignOut event:", {
        timestamp: new Date().toISOString(),
        userId: token?.id,
        email: session?.user?.email,
      });
    },
    async session({ session, token }) {
      console.log("Session event:", {
        timestamp: new Date().toISOString(),
        userId: token?.id,
        email: session?.user?.email,
      });
    },
  },
  
  pages: {
    signIn: "/",
    error: "/?error=true",
    signOut: "/"
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

export default NextAuth(authOptions);
