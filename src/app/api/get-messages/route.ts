import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "../../../model/user"
import mongoose from "mongoose"
import { User } from "next-auth";

export async function GET(req: Request){
    dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "User is not logged in"
        },
        {status: 403})
    }

    const userId = new mongoose.Types.ObjectId(user._id)

    try{
        const user = await UserModel.aggregate([
        { $match: {_id: userId}},
        { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true }},
        { $sort: {'messages.createdAt': -1}},
        { $group: {_id: '$_id', messages: { $push: '$messages'}}}
    ])

    if(!user || user.length == 0){
        return Response.json({
        success: false,
        message: "User not found"
    },
    {status: 404})
}

    return Response.json({
        success: true,
        messages: user[0].messages.filter(Boolean)
    },
        {status: 200})
    }

    catch(error){
        console.log("Unexpected error", error)

        return Response.json({
            success: false,
            message: "Internal server error"
        },
        {status: 500})
    }
}