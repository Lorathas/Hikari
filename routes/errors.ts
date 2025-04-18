import { Router, type Request, type Response } from 'express'


const errorRouter = Router()

function notFound(req: Request, res: Response) {
	res.render('pages/404')
}

errorRouter.get('/404', notFound)

export default errorRouter