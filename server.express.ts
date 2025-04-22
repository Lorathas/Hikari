// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()
import express from 'express'
import boardRouter from './routes/board'
import errorRouter from './routes/errors'
import * as db from './data/db'
import compression from 'compression'

await db.init()

const app = express()
const port = 8080

app.use(compression())

app.set('view engine', 'ejs')
app.locals.rmWhitespace = true

app.use('/static', express.static('static'))
app.use('/', errorRouter)
app.use('/', boardRouter)



app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
})