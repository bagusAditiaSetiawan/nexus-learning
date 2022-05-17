import { objectType, extendType, nonNull, stringArg, intArg } from "nexus";
import { DynamicOutputPropertyDef } from "nexus/dist/dynamicProperty";

export const Post = objectType({
  name: 'Post',
  definition(t){
      t.int('id');
      t.string('title');
      t.string('body');
      t.boolean('published');
  }
});

export const PostMutation = extendType({
  type: 'Mutation',
  definition(t){
    t.nonNull.field('createDraft', {
      type: 'Post',
      args: {
        title: nonNull(stringArg()),
        body: nonNull(stringArg()),
      },
      resolve: (root, args, ctx) => {
        return ctx.db.post.create({
          data: {            
            title: args.title,
            body: args.body,
            published: false,
          }
        });
      }
    });
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: nonNull(intArg()),
      },
      resolve(root, args, ctx) {
        return ctx.db.post.update({
          where: { id: args.draftId },
          data: {
            published: true,
          },
        });
      }
    })
  }
})

export const PostQuery = extendType({
    type: 'Query',                         // 2
    definition(t) {  
        t.nonNull.list.field('posts', {
          type: 'Post',
          resolve(_root, _args, ctx) {
            return ctx.db.post.findMany();
          },
        })
        t.nonNull.list.field('drafts', {
            type: 'Post',
            resolve(_root, _args, ctx) {        
              return ctx.db.post.findMany({ where: { published: false } })
            },
        })
        t.nonNull.list.field('publish', {
          type: 'Post',
          resolve(_root, _args, ctx) {
            return ctx.db.post.findMany({ where: { published: true } })
            },
      })
    },
  })