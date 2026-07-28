const bcrypt = require("bcrypt");
const { User } = require("../models");


const createDefaultAdmin = async () => {

  const existingAdmin = await User?.findOne({
    where:{
      role:"super_admin"
    }
  });


  if(existingAdmin){
    console.log("Admin already exists");
    return;
  }


  const hashedPassword = await bcrypt.hash(
    "Admin@123",
    12
  );


  await User.create({

    name_or_company_name:
      "System Administrator",

    email:
      "admin@influencerhub.com",

    phone1:
      "0900000000",

    password:
      hashedPassword,

    role:
      "super_admin",

    status:
      "active",

    email_verified:
      true,

    phone_verified:
      true

  });

 await User.create({

    name_or_company_name:
      "Abebayehu Shibru",

    email:
      "abeaba64@gmail.com",

    phone1:
      "0964799523",

    password:
      hashedPassword,

    role:
      "admin",

    status:
      "active",

    email_verified:
      true,

    phone_verified:
      true

  });
  console.log("Default admin created");

};


module.exports = {createDefaultAdmin}