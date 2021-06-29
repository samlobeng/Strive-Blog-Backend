import { body } from "express-validator"

export const postsValidation = [
  body("category").exists().withMessage("Category is a mandatory field!"),
  body("title").exists().withMessage("Title is a mandatory field!"),
  body("cover")
    .exists()
    .withMessage("Cover is a mandatory field!")
    .isURL()
    .withMessage("Cover should be an URL!"),
  body("readTime").exists().withMessage("ReadTime is a mandatory field!"),
  body("author").exists().withMessage("Author is a mandatory field!"),
  body("content").exists().withMessage("Content is a mandatory field!"),
]
