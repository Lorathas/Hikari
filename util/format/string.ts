import type { WithId } from "mongodb";
import type { Thread } from "../../data/post";
import type { Board } from "../../data/board";
import type { EmbeddedToken, TokenEmbedder } from "./embed-formatter";


function format(thread: WithId<Thread>, board: WithId<Board>, token: string): Promise<EmbeddedToken> {
    return Promise.resolve({
        safe: false,
        text: token
    })
}

function contains(token: string) {
    return true
}

const stringFormatter: TokenEmbedder = {
    format,
    contains
}

export default stringFormatter