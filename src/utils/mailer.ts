import nodemailer from "nodemailer";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as path from "path";

export async function sendLoginEmail({
  email,
  url,
  token,
}: {
  email: string;
  url: string;
  token: string;
}) {
  const testAccount = await nodemailer.createTestAccount();
  const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === "develop";

  const productionTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD,
    },
  });

  const developmentTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "public/static/mail-template.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    linkToT3Blog: `${url}/login#token=${token}`,
  };
  const htmlToSend = template(replacements);

  const emailObject = {
    from: '"Leonardo Dias" <leojuriolli@gmail.com>',
    to: email,
    subject: "Login to your account",
    // By using 'login#token=' instead of 'login?token=', the token will not be
    // saved in the browser's history.,
    html: htmlToSend,
  };

  if (isDevelopment) {
    const info = await developmentTransporter.sendMail(emailObject);

    console.log(`Preview url:`, nodemailer.getTestMessageUrl(info));
  }

  if (!isDevelopment) {
    await productionTransporter.sendMail(emailObject);
  }
}
