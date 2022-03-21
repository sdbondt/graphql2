import { Post } from "@prisma/client";
import { Context } from "..";
import { canUserMutatePost } from "../utils/userAuthorized";

interface PostArgs {
    post: {
        title?: string;
        content?: string;
    }
}

interface PostPayloadType {
    userErrors: {
        message: string
    }[];
    post: Post | null
    
}

interface UpdateObject {
    title?: string;
    content?: string;
}

export default {
    Query: {
        posts: async (_: any, __:any, { prisma }: Context) => {
            const posts = await prisma.post.findMany({
                where: {
                    published: true
                },
                orderBy: [
                    { createdAt: "desc"}
                ]
            })
            return posts
        }
    },
    Mutation: {
        postCreate: async (_: any, { post }: PostArgs, { prisma, userInfo }: Context): Promise<PostPayloadType> => {
            // check of er een user ingelogd is
            if (!userInfo) {
                return {
                  userErrors: [
                    {
                      message: "You must signin.",
                    },
                  ],
                  post: null,
                };
              }

            // check of data aanwezig is
            const { title, content } = post
            if (!title || !content) {
                return {
                    userErrors: [{
                        message: 'You must supply a title and some content'
                    }],
                    post: null
                }
            }
            
            const newPost = await prisma.post.create({
                data: {
                    title,
                    content,
                    authorId: userInfo.userId
                }
            })
            return {
                userErrors: [],
                post: newPost,
            }
        },
        postUpdate: async (_: any, { post, postId }: { postId: String, post: PostArgs["post"] }, { prisma, userInfo }: Context): Promise<PostPayloadType> => {   
            //check of user ingelogd is
            if (!userInfo) {
                return {
                  userErrors: [
                    {
                      message: "You must signin.",
                    },
                  ],
                  post: null,
                }
            }
            
            //check of user geauthoriseerd is om up te daten
            const error = await canUserMutatePost({
                userId: userInfo.userId,
                postId: Number(postId),
                prisma,
              })
          
              if (error) return error

            // check of data aanwezig is
            const { title, content } = post
            if (!title && !content) {
                return {
                    userErrors: [
                        {
                            message: 'You must supply a title and content.'
                        }
                    ],
                    post: null,
                }
            }

            // check of post bestaat
            const existingPost = await prisma.post.findUnique({
                where: {
                    id: Number(postId)
                }
            })

            if (!existingPost) {
                return {
                    userErrors: [
                        {
                            message: 'Post does not exist.'
                        }
                    ],
                    post: null,
                }
            }

            let payloadToUpdate: UpdateObject = {
                
            }

            if (title) {
                payloadToUpdate['title'] = title
            }
            if (content) {
                payloadToUpdate['content'] = content
            }

            const postUpdate = await prisma.post.update({
                data: {
                    ...payloadToUpdate
                },
                where: {
                    id: Number(postId)
                }
            })

            return {
                userErrors: [],
                post: postUpdate
            }
        },
        postDelete: async (_: any, { postId }: { postId: string }, { prisma, userInfo }: Context): Promise<PostPayloadType> => {
            // check of er een user ingelogd is
            if (!userInfo) {
                return {
                  userErrors: [
                    {
                      message: "You must signin.",
                    },
                  ],
                  post: null,
                }
            }
            
            //check of user geauthoriseerd is om up te daten
            const error = await canUserMutatePost({
                userId: userInfo.userId,
                postId: Number(postId),
                prisma,
              })
          
              if (error) return error

            // check of post bestaat
            const existingPost = await prisma.post.findUnique({
                where: {
                    id: Number(postId)
                }
            })

            if (!existingPost) {
                return {
                    userErrors: [
                        {
                            message: 'Post does not exist.'
                        }
                    ],
                    post: null,
                }
            }

            await prisma.post.delete({
                where: {
                    id: Number(postId)
                }
            })

            return {
                userErrors: [],
                post: existingPost
            }
        },
        postPublish: async (_: any, { postId }: { postId: string }, { prisma, userInfo }: Context): Promise<PostPayloadType> => {
            if (!userInfo) {
                return {
                  userErrors: [
                    {
                      message: "You must signin.",
                    },
                  ],
                  post: null,
                }
            }

            //check of user geauthoriseerd is om up te daten
            const error = await canUserMutatePost({
                userId: userInfo.userId,
                postId: Number(postId),
                prisma,
              })
          
            if (error) return error

            const updatedPost = await prisma.post.update({
                where: {
                    id: Number(postId)
                },
                data: {
                    published: true
                }
            })
            
            return {
                userErrors: [],
                post: updatedPost
            }
        },
        postUnpublish: async (_: any, { postId }: { postId: string }, { prisma, userInfo }: Context): Promise<PostPayloadType> => {
            if (!userInfo) {
                return {
                  userErrors: [
                    {
                      message: "You must signin.",
                    },
                  ],
                  post: null,
                }
            }

            //check of user geauthoriseerd is om up te daten
            const error = await canUserMutatePost({
                userId: userInfo.userId,
                postId: Number(postId),
                prisma,
              })
          
            if (error) return error

            const updatedPost = await prisma.post.update({
                where: {
                    id: Number(postId)
                },
                data: {
                    published: false
                }
            })
            
            return {
                userErrors: [],
                post: updatedPost
            }
        },
    }
}