require('dotenv').config()
import express from "express"
import boardRouter from './routes/board'
import errorRouter from './routes/errors'
import * as db from './data/db'

await db.init()

const app = express()
const port = 8080

app.set('view engine', 'ejs')

app.use('/static', express.static('build'))
app.use('/', errorRouter)
app.use('/', boardRouter)



app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})