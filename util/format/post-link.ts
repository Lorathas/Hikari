import type { Board } from "../../data/board";
import type { Post, Thread } from "../../data/post";
import tryFind from "../fp/try-find";
import { getThreadPostForNumber } from "../../data/dal/thread-dal";
import * as ejs from "ejs";
import type { WithId } from "mongodb";
import type { EmbeddedToken, TokenEmbedder } from "./embed-formatter";

const tokenRegex = />>(\d+)/;

export async function format(
  thread: WithId<Thread>,
  board: WithId<Board>,
  token: string
): Promise<EmbeddedToken> {
  const match = tokenRegex.exec(token);

  const postNumber: number = parseInt(match!.groups![1]!);

  let referencedPost: Post | undefined;

  if (postNumber === thread.id) {
    return {
      safe: true,
      text: await ejs.renderFile("../../views/embeds/post-link-op.ejs", {
        board: board.slug,
        threadNumber: thread.id,
        postNumber,
      }),
    };
  } else if (
    tryFind(
      thread.posts,
      (p) => p.id === postNumber,
      (p) => (referencedPost = p)
    )
  ) {
    return {
      safe: true,
      text: await ejs.renderFile("../../views/embeds/post-link.ejs", {
        board: board.slug,
        threadNumber: thread.id,
        postNumber,
      }),
    };
  } else {
    const threadPost = await getThreadPostForNumber(board._id, postNumber);

    if (!threadPost) {
      return {
        safe: false,
        text: token,
      };
    }

    return {
      safe: true,
      text: await ejs.renderFile("../../views/embeds/post-link.ejs", {
        board: board.slug,
        threadNumber: threadPost.id,
        postNumber: threadPost.post.id,
      }),
    };
  }
}

export function contains(token: string): boolean {
  return tokenRegex.test(token);
}

const postLinkFormatter: TokenEmbedder = {
    format,
    contains
}

export default postLinkFormatter