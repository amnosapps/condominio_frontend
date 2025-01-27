import React from "react";
import styled, { keyframes } from "styled-components";
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

const MarkAllButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }

  &:active {
    background-color: #3e8e41;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
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
  cursor: pointer;
`;

const NoNotificationsText = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-top: 80px;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: #9e9e9e;
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const AnimatedIcon = styled.div`
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
  animation: ${bounce} 2s infinite;
`;

const PlaceholderMessage = styled.p`
  font-size: 14px;
  color: #757575;
  text-align: center;
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

  const markAllAsRead = async () => {
    const token = localStorage.getItem("accessToken");

    try {
        // Iterate through each unread notification and mark it as read
        const unreadNotifications = notifications.filter((notif) => !notif.is_read);

        await Promise.all(
            unreadNotifications.map((notif) =>
                axios.post(
                    `${process.env.REACT_APP_API_URL}/api/notifications/${notif.id}/mark_as_read/`,
                    null,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
            )
        );

        // Update all notifications in the state to mark them as read
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, is_read: true }))
        );
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle>Notificações</WidgetTitle>
        {/* <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {unreadCount > 0 && <UnreadCount>{unreadCount}</UnreadCount>}
          <MarkAllButton
            onClick={markAllAsRead}
            disabled={unreadCount === 0} // Disable if there are no unread notifications
          >
            Marcar Tudo
          </MarkAllButton>
        </div> */}
      </WidgetHeader>
      <ChatContainer>
        {/* {notifications.length > 0 ? (
          notifications.map((notif) => (
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
          ))
        ) : (
          <NoNotificationsText>Nenhuma notificação disponível</NoNotificationsText>
        )} */}
        <PlaceholderMessage>
          Em Manuntenção  
          <AnimatedIcon>
            ⚙️
          </AnimatedIcon>
        </PlaceholderMessage>
       
      </ChatContainer>
    </Widget>
  );
};

export default NotificationsWidget;
