import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredisjk";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true, 
    entities: [Post, User]
  })
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    '/',
    cors({
    origin: "http://localhost:3000",
    credentials: true,
  }))

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,// 10 years
        httpOnly: true,
        secure: __prod__, // cokkie only works in https
        sameSite: 'lax'
      },
      secret: "qowiueojwojadfafagdeopr",
      resave: false,
      saveUninitialized: false,
    })
  );

  const appolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  appolloServer.applyMiddleware({ 
    app,
    cors: false,
  });

  app.get("/", (req, res) => {
    res.send("hello");
  });

  app.listen(4000, () => {
    console.log("server started on localhost:400");
  });
};

main().catch((err) => {
  console.error(err);
});
