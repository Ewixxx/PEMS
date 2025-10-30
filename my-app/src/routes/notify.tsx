import { Hono } from "hono";
import nodemailer from "nodemailer";

const app = new Hono();

// ✅ Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "iotpems@gmail.com",        // <-- replace with your Gmail
    pass: "guou rfjl xnzj pwmu",           // <-- use Google App Password
  },
});

// ✅ POST /notify/send
app.post("/send", async (c) => {
  try {
    const { level } = await c.req.json();

    if (level >= 10) {
      return c.json({ message: "No alert needed." });
    }

    const mailOptions = {
      from: '"IoT Poultry Farm" <your_email@gmail.com>',
      to: "recipient_email@example.com", // <-- who should get notified
      subject: "⚠️ Low Water Level Alert",
      text: `Warning! The water level is critically low at ${level}%. Please refill the tank immediately.`,
    };

    await transporter.sendMail(mailOptions);

    return c.json({ success: true, message: "Alert email sent!" });
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;
