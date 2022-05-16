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
        const draft = {
          id: ctx.db.posts.length + 1,
          title: args.title,
          body: args.body,
          published: false,
        }
        ctx.db.posts.push(draft);
        return draft;
      }
    });
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: nonNull(intArg()),
      },
      resolve(root, args, ctx) {
        let draftToPublish = ctx.db.posts.find(post => post.id === args.draftId);
        if(!draftToPublish) throw new Error(`Post with id ${args.draftId} not founded`);
        draftToPublish.published = true;
        return draftToPublish;
      }
    })
  }
})

export const PostQuery = extendType({
    type: 'Query',                         // 2
    definition(t) {  
        t.nonNull.list.field('drafts', {
            type: 'Post',
            resolve(_root, _args, ctx) {
                return ctx.db.posts.filter((post) => post.published === true);
              },
        })
    },
  })