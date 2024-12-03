import api from "./api"; // Import the configured Axios instance

const notificationService = {
  // Fetch all notifications
  fetchNotifications: async () => {
    try {
      const response = await api.get("/api/notifications/");
      return response.data; // Return notifications data
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error; // Let the calling function handle errors
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/api/notifications/${notificationId}/mark_as_read/`);
      return response.data; // Return the updated notification
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error; // Let the calling function handle errors
    }
  },

  // Fetch unread notifications count
  fetchUnreadCount: async () => {
    try {
      const response = await api.get("/api/notifications/unread_count/");
      return response.data.count; // Return the count of unread notifications
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error; // Let the calling function handle errors
    }
  },
};

export default notificationService;
