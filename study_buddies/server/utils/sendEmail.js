import transporter from "../config/email.js";

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Study Buddies" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your email:</p>
      <a href="${verificationUrl}" style="
        background: #44A944;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        text-decoration: none;
      ">Verify Email</a>
    `,
  });
};
