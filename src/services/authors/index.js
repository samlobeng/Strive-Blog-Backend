import { Router } from "express"
import fs from "fs-extra"
import uniqid from "uniqid"
import { readFile, writeFile, findById } from "../../utils/file-utils.js"

import createError from "http-errors"
import { validationResult } from "express-validator"
import {
  checkAuthorExists,
  checkPostAuthorSchema,
  validatePostAuthorSchema,
} from "../../middlewares/validation/authors/postAuthors.js"
import { filterAuthorsBody } from "../../middlewares/sanitize/authors/authorsSanitize.js"
const authorsRouter = Router()

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await readFile("authors.json")
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await findById(req.params.id, "authors.json")
    res.send(author)
  } catch (error) {
    next(error)
  }
})

authorsRouter.post(
  "/",
  checkPostAuthorSchema,
  validatePostAuthorSchema,
  filterAuthorsBody,
  checkAuthorExists,
  async (req, res, next) => {
    try {
      const avatar = `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
      const newUser = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: avatar,
      }
      res.locals.authors.push(newUser)
      writeAuthors(res.locals.authors)
      res.status(201).send({ _id: newUser._id })
    } catch (error) {
      next(error)
    }
  }
)

authorsRouter.put("/:id", (req, res, next) => {
  try {
    const users = getAuthors()
    const targetUserIndex = users.findIndex(
      (user) => user._id === req.params.id
    )
    const targetUser = users[targetUserIndex]
    if (targetUser) {
      users[targetUserIndex] = { ...targetUser, ...req.body }
      writeAuthors(users)
      res.status(200).send(users[targetUserIndex])
    } else {
      res.status(400).send({ error: "author does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", (req, res, next) => {
  try {
    const users = getAuthors()
    const remainingUsers = users.filter((user) => user._id !== req.params.id)
    writeAuthors(remainingUsers)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/checkEmail", (req, res, next) => {
  try {
    const users = getAuthors()
    if (users.some((user) => user.email === req.body.email)) {
      res.status(201).send({ exists: true })
    } else {
      res.status(201).send({ exists: false })
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
