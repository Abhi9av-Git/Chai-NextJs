import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {z} from "zod"
import {usernameValidation} from "@/schemas/signUpSchema"

const UsernameQuerySchema=z.object({
  username: usernameValidation
})

export async function GET(request: Request) {

  await dbConnect()
  // localhost:3000/api/check-username-unique?username=hitesh? and may be many more parameters other than username
  try {
    const {searchParams}=new URL(request.url)
    const queryParam= {
      username: searchParams.get('username')
    }

    //validate with zod
    const result=UsernameQuerySchema.safeParse(queryParam)
    console.log(result)// remove it later on
    if (!result.success) {
      const usernameErrors=result.error.format().
      username?._errors || []
      return Response.json({
        success: false,
        message: "Invalid query parameters"
      }, {
        status: 400
      })
    }

    const {username}=result.data

    const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

    if (existingVerifiedUser) {
      return Response.json({
        success: false,
        message: "username already exists",
      }, {
        status: 400
      })
    }

    return Response.json({
      success: true,
      message: "username is unique",
    }, {
      status: 400
    })
  }
  catch(error) {
    console.error("Error checking username", error)
    return Response.json({
      success: false,
      message: "Error checking username"
    },{
      status: 500
    })
  }
}