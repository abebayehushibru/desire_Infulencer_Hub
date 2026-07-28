function generate6DigitPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports={generate6DigitPassword}