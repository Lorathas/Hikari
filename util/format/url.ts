import type { WithId } from "mongodb"
import type { Thread } from "../../data/post"
import type { EmbeddedToken, TokenEmbedder } from "./embed-formatter"
import type { Board } from "../../data/board"
import * as ejs from 'ejs'
import { z } from 'zod'

const schema = z.string().url()

export function contains(token: string): boolean {
    const res = schema.safeParse(token)

    return res.success
}

async function format(thread: WithId<Thread>, board: WithId<Board>, token: string): Promise<EmbeddedToken> {
    return {
        safe: true,
        text: await ejs.renderFile('../../vies/embeds/url', {url: token})
    }
}

const urlEmbedder: TokenEmbedder = {
    contains,
    format
}

export default urlEmbedder