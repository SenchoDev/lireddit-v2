import { Post } from "./../entities/Post";
import { Arg, Ctx, Query, Resolver, Int, Mutation } from "type-graphql";
import { MyContext } from "src/types";

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
  async createPost(
    @Arg("title") title: string,
  ): Promise<Post> {
    // 2 sql queries 
    return Post.create({title}).save();
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
