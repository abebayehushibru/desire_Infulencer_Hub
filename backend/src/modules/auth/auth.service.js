const repo = require("./auth.repository");

const {
    generateToken,
    decodeToken,
} = require("../../utils/jwt");

const {
    hashPassword,
    comparePassword,
} = require("../../utils/hash");

const {
    sendEmail,
} = require("../../utils/email");
const { influencerEmailTemplate } = require("../../utils/html");



// LOGIN
exports.login = async ({
    email,
    password,
}) => {

    const users = repo.findByAll(email)
    const user =
        await repo.findByEmail(email.trim());

    console.log(email, password, user, users[0]);


    if (!user) {

        throw new Error(
            "Invalid email or password"
        );

    }



    const passwordMatch =
        await comparePassword(
            password,
            user.password
        );



    if (!passwordMatch) {

        throw new Error(
            "Invalid email or password"
        );

    }



    if (user.status !== "active") {

        throw new Error(
            "Account is not active"
        );

    }



    const token =
        generateToken({

            id: user.id,

            role: user.role,

            email: user.email,

        });



    await repo.updateUser(
        user.id,
        {
            last_login_at:
                new Date()
        }
    );



    return {

        token,

        user: {

            id: user.id,

            name:
                user.name_or_company_name,

            email: user.email,

            role: user.role,

        }

    };

};




// LOGOUT

exports.logout = async (token) => {


    await repo.deleteSession(
        token
    );


    return {
        message:
            "Logout successful"
    };

};




// FORGOT PASSWORD

exports.forgotPassword = async (email) => {


    const user =
        await repo.findByEmail(email);



    if (!user) {

        throw new Error(
            "Email not found"
        );

    }



    const code =
        Math.floor(
            100000 +
            Math.random() * 900000
        ).toString();

 const token= generateToken({
    id:user.id,
    email:user.email,
    code:code
 })

    await sendEmail({

        to: user.email,

        subject:
            "InfluenceHub Password Reset Code",


        html: influencerEmailTemplate(
            {name:user.name,
                email:user.email,
                code:code,
                info:"Forgotting Password"
            }

        )

    });



    return {

        message:
            "Confirmation code sent",
            token

    };

};





// VERIFY CODE

exports.verifyCode = async ({
    token,
    code
}) => {

console.log(token,code);

 const decode=await decodeToken(token)
 if (!decode){
    throw Error("Invalid or Expired Token")
 }

 if (code!=decode?.code){
    throw Error("Invalid Code")
 }
const {
    id,email
}=decode

 const new_token=await generateToken({id,email},"10m")

    return {

        verified: true,
        token:new_token,
        message:
            "Code verified"

    };


};





// RESET PASSWORD

exports.resetPassword = async ({
    token,
    newPassword,
    confirmPassword
}) => {
     console.log(token,
    newPassword,
    confirmPassword);
 
const decode=await decodeToken(token)
 if (!decode){
    throw Error("Invalid or Expired Token")
 }

if (confirmPassword!=newPassword){
    throw Error("Password not Match")
 }


    const hashedPassword =
        await hashPassword(
            newPassword
        );



    await repo.updateUser(

        decode.id,

        {
            password:
                hashedPassword,
        }

    );



    return {

        message:
            "Password reset successfully"

    };

};


// UPDATE PASSWORD

exports.updatePassword = async ({
    userId,
    oldPassword,
    newPassword
}) => {


    const user =
        await repo.findById(
            userId
        );



    if (!user) {

        throw new Error(
            "User not found"
        );

    }



    const match =
        await comparePassword(
            oldPassword,
            user.password
        );



    if (!match) {

        throw new Error(
            "Old password incorrect"
        );

    }



    const hashed =
        await hashPassword(
            newPassword
        );



    await repo.updateUser(
        userId,
        {
            password: hashed
        }
    );



    return {

        message:
            "Password updated successfully"

    };

};