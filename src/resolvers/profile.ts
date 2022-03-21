import { Context } from ".."

interface ProfileParentType {
  id: number
  bio: string
  userId: number
}

export default {
  // functionaliteit voor wanneer je profile queryt en ook info over user object wilt kunnen raadplegen, parent is hier dus profile
  user: async (parent: ProfileParentType, _: any, { prisma }: Context) => {
    const findUser = await prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    })
        return findUser
  },
}
