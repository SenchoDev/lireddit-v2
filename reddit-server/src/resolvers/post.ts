import { Post } from "./../entities/Post";
import { ObjectType, Arg, Query, Resolver, Int, Mutation, InputType, Field, Ctx, UseMiddleware, FieldResolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import { Error } from "sequelize";
import { isAuth } from "src/middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}



@Resolver(Post)
export class PostResolver {

  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }


  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
      //20 -> 21
      const realLimit = Math.min(50, limit);
      const reaLimitPlusOne = realLimit + 1;
  
      const replacements: any[] = [reaLimitPlusOne];
  
      if (cursor) {
        replacements.push(new Date(parseInt(cursor)));
      }
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
      .orderBy('p."createdAt"', "DESC")
      .take(reaLimitPlusOne);
  
    if (cursor) {
      qb.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }
  
    const posts = await qb.getMany();
    console.log("posts: ", posts);

    // const posts = await getConnection().query(
    //   `
    // select p.*
    // from post p
    // ${cursor ? `where p."createdAt" < $2` : ""}
    // order by p."createdAt" DESC
    // limit $1
    // `,
    //   replacements
    // );


    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === reaLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() {req} : MyContext
  ): Promise<Post> {

    if(!req.session.userId){
      throw new Error('not authenticated');
    }
    // 2 sql queries 
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,

  ): Promise<Post | null> {
    const post = await Post.findOne(id)
    if (!post) {
      return null;
    }

    if(typeof title !== 'undefined'){
      await Post.update({id}, {title})
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
  ): Promise<Boolean> {
    await Post.delete(id)

    return true;
  }
}
