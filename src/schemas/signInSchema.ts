import {z} from "zod"

export const signInSchema=({
  email: z.string(),
  password: z.string()
})