import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "../../../../model/user"
import { User } from "next-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageid: string }> }
) {
  const { messageid } = await params
  const messageId = messageid

  dbConnect()
  const session = await getServerSession(authOptions)
  const user: User = session?.user

  if (!session || !user) {
    return Response.json({
        success: false,
        message: "User is not logged in"
    },
    { status: 403 })
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    )

    if (updateResult.modifiedCount == 0) {
      return Response.json({
        success: false,
        message: "Message not found or already deleted"
      }, { status: 404 })
    }

    return Response.json({
      success: true,
      message: "Message deleted"
    }, { status: 200 })
  }

  catch (error) {
    console.log("Error in deleting message ", error)
    return Response.json({
      success: false,
      message: "Error deleting message"
    }, { status: 500 })
  }
}