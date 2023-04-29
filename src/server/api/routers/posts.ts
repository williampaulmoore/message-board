import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient as projectUserForClient } from "~/server/model/user";
import type { Post } from "@prisma/client";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});


const addUserDataToPost = async (posts: Post[]) => {
    const userIds = posts.map((p) => p.authorId);
    const users = (
      await clerkClient.users.getUserList({
        userId: userIds,
        limit: 110,
    })).map(projectUserForClient);

    return posts.map(post => {
        const author = users.find( u => u.id === post.authorId);

        if(!author) {
            console.error("Author not found for post", post);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Author not found for post. POST ID: ${post.id}, USER ID: ${post.authorId}.`,
            });
        }

        if(!author.username) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `No account for Author. AUTHOR ID: ${author.id}.`,
            });
        }

        return {
            post,
            author: {
                ...author,
                username: author.username
            }
        }
    });
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts =  await ctx.prisma.post.findMany({
        take: 100,
        orderBy: [
            { createdAt: "desc" },
        ],
    });
    return addUserDataToPost(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ctx, input}) => {
      const posts = await ctx.prisma.post.findMany({
          where: {
            authorId: input.userId
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }]
      });

      return addUserDataToPost(posts);
  }),

  create: privateProcedure.input(z.object({
      content: z.string().min(1).max(255),
  })).mutation(async ({ctx, input}) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if(!success) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS"  });
      }

      const post = await ctx.prisma.post.create({
          data: {
            authorId,
            content: input.content,
          },
      });

      return post;
  }),
});
