// services/contact.service.js
const contactModel = require("../src/models/contact.model");
const emailUtils = require("../utils/email.utils");

const processInquiry = async (data) => {
  const { name, email, inquiryType, message } = data;

  if (!name || !email || !inquiryType || !message) {
    throw new Error(
      "All fields (name, email, inquiryType, message) are required."
    );
  }

  let isEmailed = false;

  // 1. Attempt to Send Email
  try {
    await emailUtils.sendInquiryEmail(data);
    isEmailed = true;
  } catch (error) {
    // Log the email failure but continue to save the data
    console.error(
      "Critical: Email sending failed. Data will only be saved to DB."
    );
    isEmailed = false;
  }

  // 2. Save Inquiry to Database (Backup/Record)
  const savedData = await contactModel.saveInquiry({
    name,
    email,
    inquiryType,
    message,
    isEmailed,
  });

  return {
    message: "Inquiry received successfully.",
    db_id: savedData.id,
    email_status: isEmailed ? "Sent successfully" : "Failed to send (DB saved)",
  };
};

module.exports = {
  processInquiry,
};
