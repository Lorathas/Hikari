import { Router, type Request, type Response } from 'express'
import type {BunRequest} from 'bun'
import ejs from 'ejs'


const errorRouter = Router()

function notFound(req: Request, res: Response) {
	res.render('pages/404')
}

export async function notFoundBun() {
	return new Response(await ejs.renderFile('views/pages/404.ejs'), {headers: {'content-type': 'text/html'}})
}

errorRouter.get('/404', notFound)

export default errorRouter