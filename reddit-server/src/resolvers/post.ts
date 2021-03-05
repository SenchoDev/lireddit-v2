import { Post } from "./../entities/Post";
import { Arg, Query, Resolver, Int, Mutation, InputType, Field, Ctx, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { Error } from "sequelize";
import { isAuth } from "src/middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}


@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
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
