import NextAuth,  { type NextAuthConfig } from 'next-auth';
import {PrismaAdapter} from '@auth/prisma-adapter'; 
import prisma from '@/db/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge';

export const config: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [ 
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          }
        }) 
        
        // Check if the user exist and if the password matches  
        if (user && user.password) {
          const isMatch =  compareSync(credentials.password as string, user.password)

          // If password is correct return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          } 
        }
        
        // If user does not exist or password does not match return null 
        return null;
      }
    })
  ]
};

export const {handlers, auth, signIn, signOut} = NextAuth(config);