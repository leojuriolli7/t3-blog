import nodemailer from "nodemailer";

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
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
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

  const emailObject = {
    from: '"Leonardo Dias" <leojuriolli@gmail.com>',
    to: email,
    subject: "Login to your account",
    // By using 'login#token=' instead of 'login?token=', the token will not be
    // saved in the browser's history.
    html: `Login by clicking <a href="${url}/login#token=${token}">here</a>`,
  };

  if (isDevelopment) {
    const info = await developmentTransporter.sendMail(emailObject);

    console.log(`Preview url:`, nodemailer.getTestMessageUrl(info));
  }

  if (!isDevelopment) {
    await productionTransporter.sendMail(emailObject);
  }
}
