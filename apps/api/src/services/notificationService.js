const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Beautiful HTML email wrapper
  emailTemplate(title, bodyHtml) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 40px 35px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Eventora</h1>
                  <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 2px;">Premium Event Management</p>
                </td>
              </tr>

              <!-- Title Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #ff477e, #e8315b); padding: 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">${title}</h2>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  ${bodyHtml}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f8f9fa; padding: 30px 40px; border-top: 1px solid #eee;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1a1a2e;">Eventora</p>
                        <p style="margin: 0 0 4px; font-size: 12px; color: #999;">123 Elegance Row, Bloom Street, NY 10001</p>
                        <p style="margin: 0 0 16px; font-size: 12px; color: #999;">+1 (555) EVENT-ORA · hello@eventora.com</p>
                        <p style="margin: 0; font-size: 11px; color: #bbb;">© ${new Date().getFullYear()} Eventora. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  // Status-specific email bodies
  getStatusEmailContent(status, bookingInfo = {}) {
    const { categoryName, eventDate, userName } = bookingInfo;
    const dateStr = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'your event date';

    const configs = {
      PENDING: {
        icon: '⏳',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        heading: 'Booking Received',
        message: `We've received your booking and it's being reviewed by our team. We'll get back to you shortly with a confirmation.`,
      },
      CONFIRMED: {
        icon: '✅',
        color: '#059669',
        bgColor: '#d1fae5',
        heading: 'Booking Confirmed!',
        message: `Great news! Your booking has been confirmed. Our team is now preparing everything to make your event perfect.`,
      },
      COMPLETED: {
        icon: '🎉',
        color: '#2563eb',
        bgColor: '#dbeafe',
        heading: 'Event Completed',
        message: `We hope you had an amazing experience! Thank you for choosing Eventora. We'd love to hear your feedback.`,
      },
      CANCELLED: {
        icon: '❌',
        color: '#dc2626',
        bgColor: '#fee2e2',
        heading: 'Booking Cancelled',
        message: `Your booking has been cancelled. If this was unexpected, please reach out to our support team and we'll help resolve any issues.`,
      },
    };

    const config = configs[status] || configs.PENDING;

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: ${config.bgColor}; line-height: 64px; font-size: 28px; margin-bottom: 12px;">
          ${config.icon}
        </div>
        <h3 style="margin: 0; font-size: 22px; color: #1a1a2e; font-weight: 700;">${config.heading}</h3>
      </div>

      ${userName ? `<p style="font-size: 15px; color: #444; margin: 0 0 20px; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>` : ''}
      
      <p style="font-size: 15px; color: #555; margin: 0 0 25px; line-height: 1.7;">${config.message}</p>

      <!-- Booking Details Card -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; border: 1px solid #eee; margin-bottom: 25px;">
        <h4 style="margin: 0 0 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Booking Details</h4>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          ${categoryName ? `
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #888; width: 120px;">Event Type</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600;">${categoryName}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #888; width: 120px;">Event Date</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #888; width: 120px;">Status</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; background: ${config.bgColor}; color: ${config.color}; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;">${status}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #999; margin: 0; line-height: 1.6;">
        If you have any questions, reply to this email or contact us at <a href="mailto:hello@eventora.com" style="color: #ff477e; text-decoration: none; font-weight: 600;">hello@eventora.com</a>.
      </p>
    `;
  }

  async createNotification(userId, title, message, bookingInfo = {}) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
        },
      });

      // Fetch user email to send notification
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        const status = bookingInfo.status || null;
        if (status && this.getStatusEmailContent) {
          const bodyHtml = this.getStatusEmailContent(status, { ...bookingInfo, userName: user.name });
          const htmlEmail = this.emailTemplate(title, bodyHtml);
          await this.sendEmail(user.email, title, null, htmlEmail);
        } else {
          // Generic email with simple message
          const bodyHtml = `
            <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 20px;">${message}</p>
            <p style="font-size: 13px; color: #999; margin: 0;">
              If you have any questions, contact us at <a href="mailto:hello@eventora.com" style="color: #ff477e; text-decoration: none; font-weight: 600;">hello@eventora.com</a>.
            </p>
          `;
          const htmlEmail = this.emailTemplate(title, bodyHtml);
          await this.sendEmail(user.email, title, null, htmlEmail);
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: '"Eventora" <kichuaswin061@gmail.com>',
        to,
        subject,
      };
      if (html) {
        mailOptions.html = html;
      } else {
        mailOptions.text = text;
      }
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw - email failure should not block the API response
    }
  }

  async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}

module.exports = new NotificationService();
