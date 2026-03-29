const notificationService = require('../services/notificationService');

class NotificationController {
  async getMyNotifications(req, res) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.id);
      res.json({ data: notifications });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      await notificationService.markAsRead(req.params.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new NotificationController();
