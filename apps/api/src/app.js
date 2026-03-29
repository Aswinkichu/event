const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Event Management Agency API is running...' });
});

// Contact form endpoint (public, no auth)
app.post('/api/v1/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const notificationService = require('./services/notificationService');
    const bodyHtml = `
      <div style="margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: #dbeafe; line-height: 48px; text-align: center; font-size: 22px; margin-bottom: 8px;">📩</div>
        <h3 style="margin: 8px 0 0; font-size: 20px; color: #1a1a2e;">New Contact Form Submission</h3>
      </div>

      <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; border: 1px solid #eee; margin-bottom: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #888; width: 100px; vertical-align: top;">Name</td>
            <td style="padding: 10px 0; font-size: 14px; color: #333; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #888; vertical-align: top;">Email</td>
            <td style="padding: 10px 0; font-size: 14px; color: #333; font-weight: 600;">
              <a href="mailto:${email}" style="color: #ff477e; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #888; vertical-align: top;">Subject</td>
            <td style="padding: 10px 0; font-size: 14px; color: #333; font-weight: 600;">${subject || 'General Inquiry'}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #eee;">
        <h4 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Message</h4>
        <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    `;

    const htmlEmail = notificationService.emailTemplate('New Contact Inquiry', bodyHtml);
    await notificationService.sendEmail('kichuaswin061@gmail.com', `Contact: ${subject || 'General Inquiry'} — from ${name}`, null, htmlEmail);

    res.json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
