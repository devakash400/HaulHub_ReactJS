import api from "./api.ts";

export type ApiNotification = {
  _id: string;
  userId: string;
  actorId: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  bookingId: string;
  trailerId: {
    _id: string;
    title: string;
    images: string[];
  };
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  success: boolean;
  data: {
    notifications: ApiNotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
};

export const getNotifications = async (
  page = 1,
  limit = 20,
  unreadOnly = false,
) => {
  return api.get<NotificationsResponse>("/api/notifications", {
    params: {
      page,
      limit,
      unreadOnly,
    },
  });
};

export const markNotificationRead = async (notificationId: string) => {
  return api.patch(`/api/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  return api.patch(`/api/notifications/read-all`);
};
