import {z} from 'zod'

export const usernameValidation=z
    .string()
    .min(2, "Username must be atleat of 2 Characters")
    .max(20, "Username must be atmost of 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special Character")


export const signUpSchema=z.object({
  username: usernameValidation,
  email: z.string().email({message: 'Invalid email address'}),
  password: z.string().min(6, {message: 'Password must be atleast of 6 characters'})

})    