import { getServerSession } from "next-auth";
import {authOptions} from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {User} from "next-auth";
import mongoose from 'mongoose'

export async function GET(request: Request) {
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
  
  // converting userId in string to userId by mongoose as while aggregation pipelining it will cause errors
  const userId = new mongoose.Types.ObjectId(user._id?.toString())

  try {
    const user=await UserModel.aggregate([
      {
        $match : {
          id: userId
        }
      },
      {
        // as message is an array and unwind is useful for arrays so that afterwards we can perform operations like sorting on them
        $unwind: 'messages'
      }, {
        $sort: {
          'messages.createdAt': -1
        }
      },
      {
        // Now group it
        $group: {
          _id: '$_id',
          messages: {$push: '$messages'}
        }
      }
    ])

    if (!user || user.length==0) {
      return Response.json({
        success: false,
        message: "User not found"
      },{
        status: 401
      })
    }

    return Response.json({
      success: true,
      message: user[0].messages
    },{
      status: 200
    })
  }
  catch (error) {
    console.log("Unexpected Error Occured")
    return Response.json({
      success: false,
      message: "Not Authenticated"
    },{
      status: 500
    })
  }
}