import {notFoundBun} from './routes/errors.ts'

require('dotenv').config()
import * as db from './data/db'
import {getBoardBun, getCatalogBun, getThreadBun} from './routes/board.ts'

await db.init()

// const app = express()
const port = 8080

// app.use(compression())
//
// app.set('view engine', 'ejs')
// app.locals.rmWhitespace = true
//
// app.use('/static', express.static('static'))
// app.use('/', errorRouter)
// app.use('/', boardRouter)
//
//
//
// app.listen(port, () => {
// 	console.log(`Listening on port ${port}...`)
// })

const boardJsFile = await Bun.file('static/js/board.js').text()
const catalogJsFile = await Bun.file('static/js/catalog.js').text()
const threadJsFile = await Bun.file('static/js/thread.js').text()
const mainCssFile = await Bun.file('static/css/main.css').text()
const darkCssFile = await Bun.file('static/css/dark.css').text()

Bun.serve({
	port,
	static: {
		'/static/js/board.js': new Response(boardJsFile, {headers: {'Content-Type': 'text/javascript'}}),
		'/static/js/catalog.js': new Response(catalogJsFile, {headers: {'Content-Type': 'text/javascript'}}),
		'/static/js/thread.js': new Response(threadJsFile, {headers: {'Content-Type': 'text/javascript'}}),
		'/static/css/main.css': new Response(mainCssFile, {headers: {'Content-Type': 'text/css'}}),
		'/static/css/dark.css': new Response(darkCssFile, {headers: {'Content-Type': 'text/css'}}),
	},
	routes: {
		'/404': notFoundBun,
		'/:board/:threadNumber': getThreadBun,
		'/:board': getBoardBun,
		'/:board/board': getBoardBun,
		'/:board/catalog': getCatalogBun,
	}
})