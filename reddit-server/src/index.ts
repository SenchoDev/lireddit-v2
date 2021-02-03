import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
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
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  appolloServer.applyMiddleware({ 
    app,
    cors: { origin: "http://localhost:3000"}
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
