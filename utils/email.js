import nodemailer from "nodemailer";

export const transporterConstructor = () => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",

    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASS,
    },
  });
  return transporter;
};

export const generateOTP=(otpLength) =>{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let otp = '';
  for (let i = 0; i < otpLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
  }
  console.log("Generated OTP: ",otp);
  return otp;
};