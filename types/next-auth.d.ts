import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
  interface User {
    login?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    login?: string
  }
}
