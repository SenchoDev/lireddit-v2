import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
//import { Post } from "./entities/Post";
import microConfig from './mikro-orm.config';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from "apollo-server-express";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up();

  const app = express();

  const appolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,

    })
  })

  appolloServer.applyMiddleware({ app })

  app.get('/', (req, res) => {
    res.send('hello')
  })

  app.listen(4000, () =>{
    console.log('server started on localhost:400')
  })

}


main().catch(err => {
  console.error(err);
});