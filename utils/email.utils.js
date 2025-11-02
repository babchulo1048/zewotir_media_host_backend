// utils/email.utils.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const RECEIVING_EMAIL = process.env.RECEIVING_EMAIL;

// 1. Create the Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Email Sending Function
const sendInquiryEmail = async ({ name, email, inquiryType, message }) => {
  // Basic HTML structure for the email body
  const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
    `;

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Display sender name
    to: RECEIVING_EMAIL, // Send to your admin inbox
    replyTo: email, // Set reply-to header to the user's email
    subject: `[Portfolio Inquiry] ${inquiryType} from ${name}`,
    text: `New inquiry from ${name} (${email}). Type: ${inquiryType}. Message: ${message}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending inquiry email:", error.message);
    throw new Error("Failed to send email.");
  }
};

module.exports = {
  sendInquiryEmail,
};
