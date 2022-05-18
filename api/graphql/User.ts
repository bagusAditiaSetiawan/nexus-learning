import { objectType, extendType } from "nexus";

export const User = objectType({
  name: 'User',
  definition(t){
      t.int('id');
      t.string('name');
      t.string('email');
      t.string('password');
  }
});

export const UserQuery = extendType({
    type: 'Query',                         // 2
    definition(t) {  
        t.nonNull.list.field('users', {
          type: 'User',
          resolve: (_root, _args, ctx) => {
            return ctx.db.user.findMany();
          },
        })
    },
  })