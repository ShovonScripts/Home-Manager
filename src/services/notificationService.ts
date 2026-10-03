export const NotificationService = {
  async registerForPushNotificationsAsync() {
    console.log('Push notifications are disabled in Expo Go for Android on SDK 53+.');
    return false;
  },

  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ): Promise<string | null> {
    console.log('Scheduling notification (Stubbed):', title, body);
    return null;
  },

  async cancelNotification(notificationId: string) {
    console.log('Canceling notification (Stubbed):', notificationId);
  },

  async cancelAllNotifications() {
    console.log('Canceling all notifications (Stubbed)');
  },
};
