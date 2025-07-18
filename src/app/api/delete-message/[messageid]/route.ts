import { getServerSession } from "next-auth";
import {authOptions} from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {User} from "next-auth";
import mongoose from 'mongoose'

export async function DELETE(request: Request, {params}:{params: {messageid: string}}) {
  const messageId=params.messageid
  await dbConnect()
  
  const session=await getServerSession(authOptions)
  // user: User defines the type of the user object in typescript 
  const user: User=session?.user

  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: "Not Authenticated"
    },{
      status: 401
    })
  }
  try {
    const updateResult=await UserModel.updateOne(
      {_id: user._id},
      {$pull: {messages: {_id: messageId}}}
    )
    if (updateResult.modifiedCount==0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted"
        },
        {status: 404}
      )
    }

    return Response.json(
        {
          success: true,
          message: "Message Deleted"
        },
        {status: 200}
      )
  }
  catch (error) {
    console.log("Error in deleting message route", error)
    return Response.json(
        {
          success: false,
          message: "Error deleting message"
        },
        {status: 500}
      )
  }
  
  // converting userId in string to userId by mongoose as while aggregation pipelining it will cause errors
  
}