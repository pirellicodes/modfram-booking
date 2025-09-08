import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'studio@modframimagehaus.com',
    pass: process.env.GMAIL_APP_PASSWORD // Use the 16-character app password
  }
});

async function main() {
  try {
    // Send test email
    const info = await transporter.sendMail({
      from: '"Modfram Imagehaus" <studio@modframimagehaus.com>',
      to: "studio@modframimagehaus.com", // Send to yourself
      subject: "SMTP Test ✔",
      text: "If you receive this, SMTP is working correctly!",
      html: "<b>If you receive this, SMTP is working correctly!</b>",
    });

    console.log("Message sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:");
    console.error(error);
    if (error.code === 'EAUTH') {
      console.error("Authentication failed - check your username and app password");
    }
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);
