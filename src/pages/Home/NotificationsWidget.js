import React from "react";
import styled from "styled-components";
import axios from "axios";

// Styled Components
const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: 270px;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const WidgetTitle = styled.h3`
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
`;

const UnreadCount = styled.span`
  font-size: 14px;
  background-color: #ff5252;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 600;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 150px;
  overflow-y: auto;
  width: 100%;
  margin-top: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
  }
`;

const ChatMessage = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${(props) => (props.isUnread ? "#fbe9e7" : "#f5f5f5")};
  color: ${(props) => (props.isUnread ? "#d32f2f" : "#333")};
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: ${(props) => (props.isUnread ? "600" : "400")};
  cursor: pointer; /* Add cursor pointer for clickable effect */
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: #9e9e9e;
`;

// Notifications Widget
const NotificationsWidget = ({ notifications, setNotifications }) => {
  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  const markNotificationAsRead = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/notifications/${id}/mark_as_read/`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update notifications state to mark the notification as read
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle>Notificações</WidgetTitle>
        {unreadCount > 0 && <UnreadCount>{unreadCount}</UnreadCount>}
      </WidgetHeader>
      <ChatContainer>
        {notifications.map((notif) => (
          <ChatMessage
            key={notif.id}
            isUnread={!notif.is_read}
            onClick={() => markNotificationAsRead(notif.id)}
          >
            <div>
              <strong>{notif.title}</strong>
              <div>{notif.message}</div>
            </div>
            <TimeStamp>
              {new Date(notif.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </TimeStamp>
          </ChatMessage>
        ))}
      </ChatContainer>
    </Widget>
  );
};

export default NotificationsWidget;