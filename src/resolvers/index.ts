import PostsResolvers from './posts'
import UserResolvers from './user'
import ProfileResolvers from './profile'
import PostResolvers from './post'
import Singleuser from './singleuser'

const resolvers = {
    User: {
        ...Singleuser
    },
    Profile: {
        ...ProfileResolvers
    },
    Post: {
        ...PostResolvers
    },
    Query: {
        ...PostsResolvers.Query,
        ...UserResolvers.Query,
    },
    Mutation: {
        ...PostsResolvers.Mutation,
        ...UserResolvers.Mutation
    }
}

export default resolvers