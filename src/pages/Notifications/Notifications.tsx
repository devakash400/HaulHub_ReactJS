import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useModalNavigate from "../../hooks/useModalNavigate.ts";
import { RootState } from "../../store";
import api from "../../api/api.ts";
import EmptyState from "../../components/common/EmptyState.tsx";

type ApiNotification = {
  _id: string;
  userId: string;
  actorId: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  bookingId: string;
  trailerId?: {
    _id: string;
    title?: string;
    images?: string[];
  } | null;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
};

type NotificationsResponse = {
  success: boolean;
  data: {
    notifications: ApiNotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
};

const Notifications: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    isAuthenticated && (user?.trailor === "Owner" || userType === "Owner");
  const navigate = useNavigate();
  const modalNavigate = useModalNavigate();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedRequests, setProcessedRequests] = useState<
    Record<string, "Accepted" | "Rejected">
  >({});
  const [processingRequests, setProcessingRequests] = useState<
    Record<string, boolean>
  >({});
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});

  const toggleMessageExpand = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    handleMarkAsRead(id);
  };

  const [truncateLength, setTruncateLength] = useState(80);

  const handleMarkAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n._id === notificationId);
    const isAlreadyRead = notification?.isRead || (notification as any)?.read || (notification as any)?.status === 'read';
    if (isAlreadyRead) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true, read: true, status: 'read', readAt: new Date().toISOString() } : n));
    window.dispatchEvent(new Event("notificationRead"));

    try {
      await api.patch(`/api/notifications/${notificationId}/read`, {});
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setTruncateLength(35); // Mobile
      } else if (window.innerWidth < 1024) {
        setTruncateLength(45); // Tablet/iPad
      } else {
        setTruncateLength(80); // Desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAcceptRequest = async (bookingId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [bookingId]: true }));
    setError(null);

    try {
      await api.patch(`/api/bookings/${bookingId}/accept`);
      setProcessedRequests((prev) => ({
        ...prev,
        [bookingId]: "Accepted",
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Accept booking error:", err);
      setError("Unable to accept booking request. Please try again.");
    } finally {
      setProcessingRequests((prev) => {
        const nextState = { ...prev };
        delete nextState[bookingId];
        return nextState;
      });
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [bookingId]: true }));
    setError(null);

    try {
      await api.patch(`/api/bookings/${bookingId}/reject`);
      setProcessedRequests((prev) => ({
        ...prev,
        [bookingId]: "Rejected",
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Reject booking error:", err);
      setError("Unable to reject booking request. Please try again.");
    } finally {
      setProcessingRequests((prev) => {
        const nextState = { ...prev };
        delete nextState[bookingId];
        return nextState;
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      modalNavigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<NotificationsResponse>(
          "/api/notifications",
          {
            params: {
              page: 1,
              limit: 20,
              unreadOnly: false,
            },
          },
        );

        if (response.data?.success) {
          setNotifications(response.data.data.notifications);
          return;
        }

        throw new Error("Unable to load notifications");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Notification fetch error:", err);
        setError(
          "Unable to load notifications. Please refresh the page or try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-full w-full flex justify-center bg-[#F9F8F3] px-2 py-6 min-[400px]:px-4 min-[400px]:py-10">
      {/* 80% width main container, near top instead of perfectly centered */}
      <div className="w-full max-w-5xl md:w-[80%] bg-white rounded-2xl shadow-md border border-gray-200 p-3 min-[400px]:p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-gray-200 bg-[#F9F8F3] p-6 text-center text-sm text-gray-600">
              Loading notifications...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-[#FEF3F2] p-6 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            // <div className="rounded-2xl border border-gray-200 bg-[#F9F8F3] p-6 text-center text-sm text-gray-600">
            //   No notifications available.
            // </div>
            <EmptyState line="No notifications available."/>
          )}

          {!loading &&
            !error &&
            notifications.map((notification) => {
              const imageUrl = notification.trailerId?.images?.[0] ?? "";
              const createdAt = new Date(
                notification.createdAt,
              ).toLocaleString();
              const isRequestSent =
                /booking request sent/i.test(notification.type) ||
                /booking request sent/i.test(notification.title) ||
                /booking request sent/i.test(notification.message);
              const isBookingAccepted =
                /booking accepted/i.test(notification.type) ||
                /booking accepted/i.test(notification.title) ||
                /booking accepted/i.test(notification.message);
              const isBookingAcceptedByOwner =
                /your booking for .* is accepted by/i.test(
                  notification.title,
                ) ||
                /your booking for .* is accepted by/i.test(
                  notification.message,
                );
              const isNewRentalRequest =
                /new rental request/i.test(notification.title) ||
                /rental request/i.test(notification.title) ||
                /rental request/i.test(notification.message) ||
                /new rental request/i.test(notification.message);
              const isRequestProcessing = Boolean(
                processingRequests[notification.bookingId],
              );
              const isBookingReturned =
                /returned/i.test(notification.type) ||
                /returned/i.test(notification.title) ||
                /returned/i.test(notification.message);
              const isBookingUpdated =
                /your booking for .* was updated/i.test(notification.title) ||
                /your booking for .* was updated/i.test(notification.message);
              const isPickupPhotosUploaded =
                /pickup condition photos?/i.test(notification.title) ||
                /pickup condition photos?/i.test(notification.message) ||
                /uploaded pickup/i.test(notification.title) ||
                /uploaded pickup/i.test(notification.message) ||
                /pickup photos/i.test(notification.title) ||
                /pickup photos/i.test(notification.message);
              const isPreScreeningCompleted =
                /pre[\s-]?screening completed/i.test(notification.title) ||
                /pre[\s-]?screening completed/i.test(notification.message) ||
                /pre[\s-]?screening.*complete/i.test(notification.title) ||
                /pre[\s-]?screening.*complete/i.test(notification.message);
              const isPaymentCompleted =
                /payment complet/i.test(notification.title) ||
                /payment complet/i.test(notification.message) ||
                /payment complet/i.test(notification.type);
              const isReadyForPickup =
                /ready for pick[\s-]?up/i.test(notification.title) ||
                /ready for pick[\s-]?up/i.test(notification.message) ||
                /pickup ready/i.test(notification.title) ||
                /pickup ready/i.test(notification.message) ||
                /ready for pick-up/i.test(notification.type);

              const isNotificationRead = 
                notification.isRead === true || 
                (notification as any).read === true || 
                (notification as any).status === 'read' ||
                ((notification as any).readAt !== undefined && (notification as any).readAt !== null);

              return (
                <div
                  key={notification._id}
                  className={`rounded-2xl border ${!isNotificationRead ? 'border-[#389131] bg-[#F4FBF4]' : 'border-gray-200 bg-[#F9F8F3]'} p-3 min-[400px]:p-5 shadow-sm relative`}
                >
                  {!isNotificationRead && (
                    <span className="absolute top-3 right-3 min-[400px]:top-5 min-[400px]:right-5 h-2.5 w-2.5 rounded-full bg-[#389131]"></span>
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-1 min-w-0 gap-3 min-[400px]:gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={notification.trailerId?.title ?? ""}
                          className="h-14 w-20 min-[400px]:h-20 min-[400px]:w-28 shrink-0 rounded-xl min-[400px]:rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 min-[400px]:h-20 min-[400px]:w-28 shrink-0 items-center justify-center rounded-xl min-[400px]:rounded-2xl bg-gray-200 text-xs min-[400px]:text-sm text-gray-500">
                          No image
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm min-[400px]:text-base font-semibold text-gray-900 break-words">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs min-[400px]:text-sm text-gray-700 break-words">
                          {notification.message.length > truncateLength && !expandedMessages[notification._id]
                            ? `${notification.message.substring(0, truncateLength)}... `
                            : `${notification.message} `}
                          {notification.message.length > truncateLength && (
                            <button
                              onClick={(e) =>
                                toggleMessageExpand(e, notification._id)
                              }
                              className="text-[#389131] hover:underline font-medium focus:outline-none"
                            >
                              {expandedMessages[notification._id] ? "Show less" : "Show more"}
                            </button>
                          )}
                        </p>
                        <p className="mt-1.5 text-[10px] min-[400px]:text-xs font-medium text-gray-500 break-words">
                          Booking ID: {notification.bookingId}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2.5 sm:gap-3 sm:items-end">
                      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                        <span className="inline-flex max-w-full items-center rounded-full bg-[#E7F6E6] px-2.5 py-0.5 min-[400px]:px-3 min-[400px]:py-1 text-[10px] min-[400px]:text-xs font-semibold text-[#2F7A29] break-words text-left">
                          <span className="truncate">{notification.title}</span>
                        </span>
                        <p className="text-[10px] min-[400px]:text-xs text-gray-500">{createdAt}</p>
                      </div>
                      {isOwner && isNewRentalRequest ? (
                        processedRequests[notification.bookingId] ? (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold ${
                              processedRequests[notification.bookingId] ===
                              "Accepted"
                                ? "bg-[#E7F6E6] text-[#2F7A29]"
                                : "bg-[#FEE2E2] text-[#991B1B]"
                            }`}
                          >
                            {processedRequests[notification.bookingId]}
                          </span>
                        ) : (
                          <Link
                            onClick={() => handleMarkAsRead(notification._id)}
                            to={`/notifications/booking/${notification.bookingId}`}
                            state={{
                              renterFullName: notification.actorId?.fullName,
                              renterEmail: undefined,
                            }}
                            className="rounded-lg bg-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
                          >
                            View details
                          </Link>
                        )
                      ) : isPaymentCompleted && isOwner ? (
                        <Link
                          onClick={() => handleMarkAsRead(notification._id)}
                          to={`/pre-screening-complete/${notification.bookingId}`}
                          className="rounded-lg bg-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
                        >
                          View & Approve
                        </Link>
                      ) : isReadyForPickup && isOwner ? (
                        <Link
                          onClick={() => handleMarkAsRead(notification._id)}
                          to={`/pick-up-complete/${notification.bookingId}`}
                          className="rounded-lg bg-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
                        >
                          Mark Available
                        </Link>
                      ) : isBookingAcceptedByOwner && !isOwner ? (
                        <Link
                          onClick={() => handleMarkAsRead(notification._id)}
                          to={`/prescreening?bookingId=${encodeURIComponent(notification.bookingId)}`}
                          state={{
                            bookingId: notification.bookingId,
                          }}
                          className="rounded-lg bg-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
                        >
                          Start Pre-Screening
                        </Link>
                      ) : isPickupPhotosUploaded || isBookingAccepted || isPreScreeningCompleted ? (
                          !isNotificationRead ? (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="rounded-lg bg-white border border-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-[#389131] transition-colors hover:bg-[#F4FBF4]"
                            >
                              Mark as read
                            </button>
                          ) : null
                      ) : (
                          <Link
                            onClick={() => handleMarkAsRead(notification._id)}
                            to={
                              isBookingAcceptedByOwner
                                ? "/booking"
                                : isBookingReturned || isBookingUpdated
                                  ? "/booking"
                                  : isRequestSent
                                    ? "/booking"
                                    : `/booking/${notification.bookingId}`
                            }
                            className="rounded-lg bg-[#389131] px-3 py-1.5 text-xs min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
                          >
                            {isBookingAcceptedByOwner
                              ? "View details"
                              : isBookingReturned || isBookingUpdated
                                ? isBookingReturned
                                  ? "View status"
                                  : "View bookings"
                                : isRequestSent
                                  ? "View request status"
                                  : "View details"}
                          </Link>
                        )}
                      </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
