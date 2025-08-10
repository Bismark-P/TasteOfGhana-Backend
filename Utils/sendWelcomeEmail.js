import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to Taste of North Ghana!',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for signing up. We're excited to have you on board!</p>
      <p>Explore our platform and discover the richness of Northern Ghana.</p>
      <br/>
      <p>Warm regards,<br/>Taste of North Ghana Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendWelcomeEmail;
