import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// Mock database for notifications
const notifications: { id: string; userId: string; message: string }[] = [];

// Endpoint to send a notification
app.post('/send', (req, res) => {
  const { userId, message } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  notifications.push({ id, userId, message });
  res.status(200).json({ success: true, id });
});

// Endpoint to fetch notifications for a user
app.get('/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.status(200).json(userNotifications);
});

// Start the microservice
app.listen(PORT, () => {
  console.log(`Notification microservice running on port ${PORT}`);
});