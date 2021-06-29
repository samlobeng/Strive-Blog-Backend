import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

import createError from "http-errors"
import { validationResult } from "express-validator"
import { postsValidation } from "../../middlewares/validation/postsValidation.js"

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, 
  params: {
    folder: "posts",
  },
})

const uploadOnCloudinary = multer({ storage: cloudinaryStorage }).single("cover")


const postsRouter = express.Router()

const postsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "posts.json"
)

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath))
const writePosts = (content) =>
  fs.writeFileSync(postsJSONPath, JSON.stringify(content))

postsRouter.get("/", (req, res, next) => {
  try {
    res.send(getPosts())
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/:id", (req, res, next) => {
  try {
    const posts = getPosts()
    const post = posts.find((p) => p._id === req.params.id)
    if (post) {
      res.send(post)
    } else {
      next(createError(404, `Post with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.post("/", postsValidation, (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const author = getAuthors().find((a) => a._id === req.body.author)
      console.log(getAuthors())
      const newPost = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
        author: author,
      }
      const posts = getPosts()
      posts.push(newPost)
      writePosts(posts)
      res.status(201).send({ _id: newPost._id })
    } else {
      next(createError(400, { errorsList: errors }))
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.put("/:id", (req, res, next) => {
  try {
    const posts = getPosts()
    const targetPostIndex = posts.findIndex((p) => p._id === req.params.id)
    const targetPost = posts[targetPostIndex]
    if (targetPost) {
      posts[targetPostIndex] = { ...targetpost, ...req.body }
      writePosts(posts)
      res.status(200).send(posts[targetPostIndex])
    } else {
      res.status(400).send({ error: "post does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.delete("/:id", (req, res, next) => {
  try {
    const posts = getPosts()
    const remainingPosts = posts.filter((p) => p._id !== req.params.id)
    writePosts(remainingPosts)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default postsRouter
