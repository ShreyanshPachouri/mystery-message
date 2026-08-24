import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/src/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()

    try{
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username already taken"
            },
            
            {
                status: 400
            })
        }

        const findUserByEmail = await UserModel.findOne({
            email
        })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(!findUserByEmail){
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = await UserModel.create({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: false,
                messages: []
            })
        }

        else{
            if(findUserByEmail.isVerified){
                return Response.json({
                success: false,
                message: "User already exists with this email"
            }, 
            
            {
                status: 400
            })
            }

            else{
                const hashedPassword = await bcrypt.hash(password, 10)
                findUserByEmail.password = hashedPassword
                findUserByEmail.verifyCode = verifyCode
                findUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await findUserByEmail.save()
            }
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, 
            
            {
                status: 500
            })
        }

        return Response.json({
                success: true,
                message: "User registered. Verify email."
            }, 
            
            {
                status: 201
            }
        )
    }

    catch(error){
        console.log("Error registering user: ", error)

        return Response.json({
            success: false,
            message: "Error registering user"
        }, 
        
        {
            status: 500
        })
    }
}