import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "../../../model/user"
import { User } from "next-auth";

export async function POST(req: Request){
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

    const userId = user._id
    const { acceptMessages } = await req.json()

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage : acceptMessages },
            { new: true }
        )

        if(!updatedUser){
            return Response.json({
            success: false,
            message: "Failed to update user"
        },
        {status: 401})
        }

        return Response.json({
            success: true,
            message: "User status toggled"
        },
        {status: 200})
    }

    catch(error){
        console.log("Failed to toggle user status", error)

        return Response.json({
            success: false,
            message: "User is not logged in"
        },
        {status: 403})
    }
}

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

    const userId = user._id
    
    try{
        const foundUser = await UserModel.findById(userId)

        if(!foundUser){
            return Response.json({
                success: false,
                message: "User not found"
            },
            {status: 404})
        }

        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
        },
            {status: 200})
        }

    catch(error){
        console.log(error)

        return Response.json({
            success: false,
            message: "User is not logged in"
        },
        {status: 403})
    }
}