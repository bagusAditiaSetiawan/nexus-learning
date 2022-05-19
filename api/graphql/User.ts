import { User } from "@prisma/client";
import { objectType, extendType, mutationField, stringArg, nonNull } from "nexus";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const User = objectType({
  name: 'User',
  definition(t){
      t.int('id');
      t.string('name');
      t.string('email');
      t.string('password');
      t.string('token');
  }
});

export const UserLoginPayload = objectType({
  name: "UserLoginPayload",
  definition: t => {
    t.field("user", {
      type: "User"
    })
    t.string("token")
  },
})

export const userLogin = mutationField('userLogin', {
  type: UserLoginPayload,
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  resolve: async (root, args, context) => {
    try{
      const { password, ...user } = await context.db.user.findFirst({
        where: {
          email: args.email
        }
      }) as User;
      const validatePassword = await bcrypt.compare(args.password, password);
      if(!validatePassword) return null;
      const token = jwt.sign(user, process.env.JWT_SECRET!);
      return {
        user,token
      };
    }catch(error){
       console.log(error);
    }
  }
})

export const userRegister = mutationField('userRegister', {
  type: UserLoginPayload,
  args: {
    email: nonNull(stringArg()),
    name: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  resolve: async (root, args, context) => {
    try {
      const existingUser = await context.db.user.findFirst({
        where: {
          email: args.email
        },
      })
      if (existingUser) {
        throw new Error("ERROR: Username already used.")
      }
      var hash = bcrypt.hashSync(args.password, 10);

      const { password, ...register } = await context.db.user.create({
        email: args.email,
        name: args.name,
        password: hash
      })
      const token = jwt.sign(register, process.env.JWT_SECRET!);
      return {
        user: register,
        token
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
})

export const UserQuery = extendType({
    type: 'Query',                         // 2
    definition(t) {  
        t.nonNull.list.field('users', {
          type: 'User',
          resolve: (_root, _args, ctx) => {
            return ctx.db.user.findMany({
              include: {
                posts: true
              }
            });
          },
        })
    },
  })