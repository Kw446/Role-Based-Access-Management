import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

export const sendEmailForAccountCretaionBySuperAdmin = async (
  token: string,
  temp_password: string,
  employee_code: string,
  email:string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const templatePath = path.join(
    __dirname,
    "../email-templates/accountCretionEmailbySuperadmin.html"
  );
  let welcomeEmailHtml = fs.readFileSync(templatePath, "utf8");
  const currentYear = new Date().getFullYear();
  const link = `${process.env.CHANGE_PASSWORD_URL}?token=${token}`;
  welcomeEmailHtml = welcomeEmailHtml
    .replace("{{link}}", link)
    .replace("{{email}}", email)
    .replace("{{temp_password}}", temp_password)
    .replace("{{employee_code}}", employee_code)
    .replace("{{year}}", currentYear.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration Link",
    html: welcomeEmailHtml,
  });
};

export const sendEmailForAccountCretaionForUserbyAdmin = async (
  token: string,
  user_name: string,
  email: string,
  employee_code: string,
  temp_password: string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const templatePath = path.join(
    __dirname,
    "../templates/accountCretionEmailbyAdmin.html"
  );
  let welcomeEmailHtml = fs.readFileSync(templatePath, "utf8");
  const currentYear = new Date().getFullYear();
  const link = `${process.env.CHANGE_PASSWORD_URL}?token=${token}`
  welcomeEmailHtml = welcomeEmailHtml
    .replace("{{link}}", link)
    .replace("{{email}}", email)
    .replace("{{user_name}}", user_name)
    .replace("{{employee_code}}", employee_code)
    .replace("{{temp_password}}", temp_password)
    .replace("{{year}}", currentYear.toString());
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your account has been created by Admin",
    html: welcomeEmailHtml,
  });
};


export const sendRecoveryPasswordEmailForAdmin = async (
  email: string,
  token: string,
  user_name: string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const templatePath = path.join(
    __dirname,
    "../templates/RecoveryPasswordEmailByAdmin.html"
  );
  let welcomeEmailHtml = fs.readFileSync(templatePath, "utf8");

  const link = `${process.env.FORGOT_PASSWORD_URL}?token=${token}`;
  // console.log(link, "link");
  const currentYear = new Date().getFullYear();
  welcomeEmailHtml = welcomeEmailHtml

    .replace("{{user_name}}", user_name)
    .replace("{{email}}", email)
    .replace("{{link}}", link)
    .replace("{{year}}", currentYear.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your account has been created by Admin",
    html: welcomeEmailHtml,
  });
};

export const sendRecoveryPasswordEmailForUser = async (
  email: string,
  token: string,
  user_name: string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const templatePath = path.join(
    __dirname,
    "../email-templates/RecoveryPasswordEmailByUser.html"
  );
  let welcomeEmailHtml = fs.readFileSync(templatePath, "utf8");

  const link = `${process.env.FORGOT_PASSWORD_URL}?token=${token}`;
  console.log(link,"linklinklinklink");
  // console.log(link, "link");
  const currentYear = new Date().getFullYear();
  welcomeEmailHtml = welcomeEmailHtml

    .replace("{{user_name}}", user_name)
    .replace("{{email}}", email)
    .replace("{{link}}", link)
    .replace("{{year}}", currentYear.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your account has been created by Admin",
    html: welcomeEmailHtml,
  });
};


export const sendEmailForAdminAccountCretaionByAdmin = async (
  token: string,
  temp_password: string,
  employee_code: string,
  email:string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const templatePath = path.join(
    __dirname,
    "../../email-templates/accountCretionEmailForAdminByAdmin.html"
  );
  let welcomeEmailHtml = fs.readFileSync(templatePath, "utf8");
  const currentYear = new Date().getFullYear();
  const link = `${process.env.CHANGE_PASSWORD_URL}?token=${token}`;
  welcomeEmailHtml = welcomeEmailHtml
    .replace("{{link}}", link)
    .replace("{{email}}", email)
    .replace("{{temp_password}}", temp_password)
    .replace("{{employee_code}}", employee_code)
    .replace("{{year}}", currentYear.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration Link",
    html: welcomeEmailHtml,
  });
};