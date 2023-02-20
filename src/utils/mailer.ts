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

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Leonardo Dias" <leojuriolli@gmail.com>',
    to: email,
    subject: "Login to your account",
    // By using 'login#token=' instead of 'login?token=', the token will not be
    // saved in the browser's history.
    html: `Login by clicking <a href="${url}/login#token=${token}">here</a>`,
  });

  console.log(`Preview url:`, nodemailer.getTestMessageUrl(info));
}
