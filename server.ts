// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()
import express from 'express'
import boardRouter from './routes/board'
import errorRouter from './routes/errors'
import compression from 'compression'
import * as boardCache from './cache/board-cache'

const app = express()
const port = 8080

await boardCache.initialize()

app.use(compression())

app.set('view engine', 'ejs')
app.locals.rmWhitespace = true

app.use('/static', express.static('static'))
app.use('/', errorRouter)
app.use('/', boardRouter)



app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
})