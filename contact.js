const express = require('express');
const router  = express.Router();
const { getTransporter } = require('../services/emailService');
const rateLimit = require('express-rate-limit');

// 5 contact submissions per hour per IP
const contactLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
});

router.post('/', contactLimit, async (req, res) => {
  const { firstName, lastName, email, phone, campus, reason, message } = req.body;

  // Validate required fields
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'First name, last name, email and message are required.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short.' });
  }

  const campusLabel  = { vereeniging: 'Vereeniging', pretoria: 'Pretoria', online: 'Online / Not sure' }[campus] || campus || '—';
  const reasonLabel  = { visiting: 'Planning to visit', membership: 'Membership enquiry', prayer: 'Prayer request', general: 'General enquiry', other: 'Other' }[reason] || reason || '—';

  try {
    const transporter = await getTransporter();

    // Email to church
    await transporter.sendMail({
      from:    `"The Synagogues Website" <${process.env.SMTP_FROM}>`,
      to:      process.env.CONTACT_EMAIL || process.env.SMTP_FROM,
      replyTo: email,
      subject: `Website Contact: ${reasonLabel} — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a180e">
          <div style="background:#2e4801;padding:32px 40px;border-radius:4px 4px 0 0">
            <h2 style="color:#e8b84b;margin:0;font-weight:400;font-size:22px">New Message — The Synagogues Website</h2>
          </div>
          <div style="background:#fafaf6;padding:40px;border:1px solid #e8e4da;border-top:none;border-radius:0 0 4px 4px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7860;font-size:13px;width:140px">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:15px">${firstName} ${lastName}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7860;font-size:13px">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:15px"><a href="mailto:${email}" style="color:#456a02">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7860;font-size:13px">Phone</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:15px">${phone}</td></tr>` : ''}
              <tr><td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7860;font-size:13px">Campus</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:15px">${campusLabel}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7860;font-size:13px">Reason</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:15px">${reasonLabel}</td></tr>
            </table>
            <div style="margin-top:24px">
              <p style="font-size:13px;color:#7a7860;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.1em">Message</p>
              <p style="font-size:15px;line-height:1.75;background:white;padding:20px;border-radius:4px;border:1px solid #e8e4da">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>`,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from:    `"The Synagogues" <${process.env.SMTP_FROM}>`,
      to:      email,
      subject: 'We received your message — The Synagogues',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a180e">
          <div style="background:#2e4801;padding:32px 40px;border-radius:4px 4px 0 0">
            <h2 style="color:#e8b84b;margin:0;font-weight:400;font-size:22px">The Synagogues</h2>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;letter-spacing:0.1em">House of Prayer for All Nations</p>
          </div>
          <div style="background:#fafaf6;padding:40px;border:1px solid #e8e4da;border-top:none;border-radius:0 0 4px 4px">
            <p style="font-size:18px;font-style:italic;color:#1a180e">Dear ${firstName},</p>
            <p style="font-size:15px;line-height:1.8;color:#4a4835">Thank you for reaching out to us. We have received your message and one of our team members will be in touch with you shortly.</p>
            <p style="font-size:15px;line-height:1.8;color:#4a4835">You are welcome here, and we look forward to connecting with you.</p>
            <div style="margin:32px 0;padding:24px;background:white;border-left:3px solid #c8960c;border-radius:0 4px 4px 0">
              <p style="font-style:italic;color:#1a180e;font-size:16px;margin:0 0 8px">"My house shall be called a house of prayer for all nations."</p>
              <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7860;margin:0">— Isaiah 56:7</p>
            </div>
            <p style="font-size:13px;color:#7a7860">The Synagogues · <a href="https://thesynagogues.com" style="color:#456a02">thesynagogues.com</a></p>
          </div>
        </div>`,
    });

    res.json({ success: true, message: 'Your message has been sent.' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again or email us directly at info@thesynagogues.com' });
  }
});

module.exports = router;
