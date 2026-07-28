const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

  host: process.env.SMTP_HOST,

  port: Number(process.env.SMTP_PORT),

  secure:
    process.env.SMTP_SECURE === "true",

  auth: {

    user: process.env.SMTP_USER,

    pass: process.env.SMTP_PASS,

  },

});



/**
 * Send Email
 */
const sendEmail = async ({
  to,
  subject,
  html,
}) => {


  try {


    const info =
      await transporter.sendMail({

        from: {
          name:
          process.env.SMTP_FROM_NAME,

          address:
          process.env.SMTP_FROM_EMAIL,
        },


        to,


        subject,


        html,

      });


    console.log(
      "Email sent:",
      info.messageId
    );


    return info;


  } catch(error){


    console.error(
      "Email error:",
      error.message
    );


    throw new Error(
      "Email sending failed"
    );


  }

};



module.exports = {
  sendEmail,
};