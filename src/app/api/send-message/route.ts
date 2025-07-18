import UserModel from "@/model/User.model"
import dbConnect from "@/lib/dbConnect"

import {Message} from "@/model/User.model"

export async function POST(request: Request) {
  await dbConnect()

  const {username, content}=await request.json()

  try {
    const user= await UserModel.findOne({username})

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      }, {status: 404})
    }

    // If User exists now check whether the user is accepting messages or not
    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: "User is not Accepting the messages"
      },{
        status: 403
      })
    }

    const newMessage={content, createdAt: new Date()}

    user.messages.push(newMessage as Message)
    await user.save()

    return Response.json({
      success: true,
      message: "Message sent Successfully"
    },{
      status: 200
    })
  }
  catch (error) {
    console.log("Error adding Messages", error)
    return Response.json({
      success: false,
      message: "Internal Server Error"
    },{
      status: 500
    })
  }
}

