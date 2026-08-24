import dbConnect from "../../../lib/dbConnect"
import UserModel from "../../../model/user"

export async function POST(request: Request){
    await dbConnect()

    try{
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username)

        console.log("RAW username received:", username)
        console.log("Decoded username:", decodedUsername)
        console.log("Code received:", code)

        const user = await UserModel.findOne({
            username: decodedUsername
        })

        if(!user){
            console.log("User does not exist")
            
            return Response.json({
                success: false,
                message: "User does not exist"
            },
            {
                status: 500
            })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date() < new Date(user.verifyCodeExpiry)

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            return Response.json({
                success: true,
                message: "Account verified successfully"
            },
            {
                status: 200
            })
        }

        else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Verification Code has expired"
            },
            {
                status: 400
            })
        }

        else{
            return Response.json({
                success: false,
                message: "Incorrect Verification Code"
            },
            {
                status: 400
            })
        }
    }

    catch(error){
        console.log("Error verifying user", error)

        return Response.json({
            success: false,
            message: "Error verifying user"
        },
        {
            status: 500
        })
    }
}
