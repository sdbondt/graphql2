import { Context } from ".."

interface PostParentType {
    authorId: number;
}

export default {
  // functionaliteit voor wanneer je post queryt en ook info over user object wilt kunnen raadplegen, parent is hier post
  user: async (parent: PostParentType, _: any, { prisma }: Context) => {
    const findUser = await prisma.user.findUnique({
      where: {
        id: parent.authorId,
      },
    })
        return findUser
  },
}