import express from "express"

import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import morgan from "morgan"

import authorsRouter from "./services/authors/index.js"
import postsRouter from "./services/posts/index.js"
import { errorMiddlewares } from "./middlewares/error/errors.js"

const port = process.env.PORT || 3001

const server = express()

const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_PROD_URL]

server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        // origin is in the list therefore it is allowed
        callback(null, true)
      } else {
        // origin is not in the list then --> ERROR
        callback(new Error("Not allowed by cors!"))
      }
    },
  })
)
server.use(express.json())
server.use(morgan("dev"))

server.use("/authors", authorsRouter)
server.use("/posts", postsRouter)

server.use([errorMiddlewares])

console.table(listEndpoints(server))

server.use((req, res) => {
  if (!req.route) {
    const error = createError(404, "Route does not exist!")
    res.status(error.status).send(error)
  }
})

server.listen(port, () => {
  console.log("Server is running on port " + port)
})
