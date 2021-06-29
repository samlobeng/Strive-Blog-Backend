import { checkSchema, validationResult } from "express-validator"

const schema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name must be string!",
    },
  },
  surname: {
    in: ["body"],
    isString: {
      errorMessage: "Surname must be string!",
    },
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Email must be a valid one!",
    },
  },
  dob: {
    in: ["body"],
    isDate: {
      errorMessage: "DOB must be a date",
    },
  },
}
export const checkPutAuthorSchema = checkSchema(schema)

export const validatePutAuthorSchema = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Putting authors went wrong!",
      errors: errors.array(),
    })
  } else {
    next()
  }
}
