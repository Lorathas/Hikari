import express, {Request, Response} from "express"
import Thread from "./data/thread";
import Post from "./data/post";

function threadGet(req: Request, res: Response) {
    const thread: Thread = {}
    const posts: Post[] = []

    res.render('pages/thread', {
        posts
    })
}