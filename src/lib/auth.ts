import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { admin } from "better-auth/plugins"
import { adminClient } from "better-auth/client/plugins"

export const auth = betterAuth({
   database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    plugins: [
        admin(),
        adminClient()
    ],
   emailAndPassword: { 
   enabled: true, 
  }, 
  socialProviders: { 
    google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
  }, 
});