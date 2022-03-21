import { Context } from ".."
import validator from "validator"
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import JSON_SIGNATURE from "../keys"

interface SignupArgs {
  credentials: {
    email: string
    password: string
  }
  name: string
  bio: string
}

interface SigninArgs {
  credentials: {
    email: string
    password: string
  }
}

interface UserPayload {
  userErrors: {
    message: string
  }[]
  token: string | null
}

export default {
  Query: {
    me: async (_: any, __: any, { userInfo, prisma }: Context) => {
      if (!userInfo) return null
      const user = await prisma.user.findUnique({
        where: {
          id: userInfo.userId
        }
      })
      return user
    },
    profile: async (_: any, { userId }: { userId: string }, { prisma, userInfo }: Context) => {
      const isMyProfile = Number(userId) === userInfo?.userId 
      const findProfile = prisma.profile.findUnique({
        where: {
          id: Number(userId)
        }
      })
      return {
        ...findProfile,
        isMyProfile
      }
    }
  },
  Mutation: {
    signup: async (
      _: any,
      { credentials, name, bio }: SignupArgs,
      { prisma }: Context
    ): Promise<UserPayload> => {
      const { email, password } = credentials
      const isEmail = validator.isEmail(email)

      // check email
      if (!isEmail) {
        return {
          userErrors: [
            {
              message: "Invalid email",
            },
          ],
          token: null,
        }
      }

      // check password
      const isValidPassword = validator.isLength(password, {
        min: 5,
      })

      if (!isValidPassword) {
        return {
          userErrors: [
            {
              message: "Invalid password",
            },
          ],
          token: null,
        }
      }

      //check name en bio
      if (!name || !bio) {
        return {
          userErrors: [
            {
              message: "Invalid name or bio",
            },
          ],
          token: null,
        }
      }

      // hash passwoord en creeer user en profile
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      })

      await prisma.profile.create({
        data: {
          bio,
          userId: user.id,
        },
      })

      return {
        userErrors: [],
        token: JWT.sign(
          {
            userId: user.id,
          },
          JSON_SIGNATURE,
          {
            expiresIn: 3600000,
          }
        ),
      }
    },
    signin: async (
      _: any,
      { credentials }: SigninArgs,
      { prisma }: Context
    ): Promise<UserPayload> => {
      const { email, password } = credentials

      //checken of user bestaat
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return {
          userErrors: [{ message: "Invalid credentials" }],
          token: null,
        }
      }

      // passwoord checken
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return {
          userErrors: [{ message: "Invalid credentials" }],
          token: null,
        }
      }

      // succes!
      return {
        userErrors: [],
        token: JWT.sign({ userId: user.id }, JSON_SIGNATURE, {
          expiresIn: "24h",
        }),
      }
    },
  },
}
