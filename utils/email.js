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
