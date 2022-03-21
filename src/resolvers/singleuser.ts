import { Context } from ".."

interface UserParentType {
    id: number;
}

export default {
  // functionaliteit voor wanneer je user queryt en ook toegang wil tot info over de posts
    posts: async (parent: UserParentType, _: any, { prisma, userInfo }: Context) => {
        const isOwnProfile = parent.id === userInfo?.userId ? true: false
        
        if (isOwnProfile) {
            return prisma.post.findMany({
              where: {
                authorId: parent.id,
              },
              orderBy: [
                {
                  createdAt: "desc",
                },
              ],
            })
          } else {
            return prisma.post.findMany({
              where: {
                authorId: parent.id,
                published: true,
              },
              orderBy: [
                {
                  createdAt: "desc",
                },
              ],
            })
          }
  },
}