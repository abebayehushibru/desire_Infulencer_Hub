const jwt = require("jsonwebtoken");


/**
 * Generate Access Token
 */
const generateToken = (payload, expiresIn = "7d") => {

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );

};



/**
 * Verify Token
 */
const verifyToken = (token) => {

  try {

    return jwt.verify(
      token,
      process.env.JWT_SECRET
    );

  } catch (error) {

    throw new Error(
      "Invalid or expired token"
    );

  }

};



/**
 * Decode Token
 * (without verification)
 */
const decodeToken = (token) => {

  return jwt.decode(token);

};



module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};