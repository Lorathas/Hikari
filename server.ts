import express from "express"
import boardRouter from "./routes/board";
import errorRouter from "./routes/errors";

const app = express()
const port = 8080

app.set('view engine', 'ejs')

app.use('/static', express.static('static'))
app.use('/', errorRouter)
app.use('/', boardRouter)



app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})