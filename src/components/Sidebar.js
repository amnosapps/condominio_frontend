import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const SidebarContainer = styled.div`
    background-color: #fff;
    width: 250px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    align-items: center;
    z-index: 10;

    @media (max-width: 768px) {
        width: 200px;
    }
`;

const Logo = styled.h2`
    font-size: 24px;
    color: #DE7066;
    margin-bottom: 2rem;
`;

const Select = styled.select`
    margin: 1rem 0;
    padding: 0.5rem;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;

    &:focus {
        border-color: #DE7066;
        box-shadow: 0 0 4px rgba(222, 112, 102, 0.4);
    }
`;

const ProfileAndLogoutContainer = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 4rem;
`;

const ProfileContainer = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
`;

const Avatar = styled.div`
    width: 50px;
    height: 50px;
    background-color: #DE7066;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 18px;
    margin-right: 15px;
`;

const ProfileInfo = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
`;

const CondoName = styled.span`
    font-size: 14px;
    color: #737373;
`;

const UserName = styled.span`
    font-size: 18px;
    color: #737373;
    /* font-weight: bold; */
`;

const NavList = styled.ul`
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
`;

const NavItem = styled.li`
    display: flex;
    margin-bottom: 1rem;
    align-items: center;
`;

const NavButton = styled.button`
    color: #737373;
    text-decoration: none;
    font-size: 18px;
    transition: color 0.3s;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
        color: #DE7066;
        cursor: pointer;
    }
`;

const ImgSidebar = styled.img`
    width: 20px;
`;

const LogoutButton = styled.button`
    color: #fff;
    font-size: 15px;
    transition: color 0.3s;
    background: linear-gradient(135deg, #DE7066, #F16D61);
    border: none;
    border-radius: 40px;
    text-align: center;
    padding: 0.50rem 2rem;

    &:hover {
        cursor: pointer;
        background: linear-gradient(135deg, #F16D61, #DE7066);
    }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #DE7066; /* Red */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const CenteredContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%; /* Takes up full height of the SidebarContainer */
`;

const StyledSelect = styled.select`
    margin-top: 10px;
    padding: 5px 4px;
    font-size: 16px;
    font-weight: 400;
    color: #737373;
    background-color: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    transition: all 0.3s;

    &:focus {
        /* border-color: #DE7066; */
        background-color: #fff;
        box-shadow: 0 0 5px rgba(222, 112, 102, 0.5);
    }

    &:hover {
        cursor: pointer;
    }

    option {
        font-size: 14px;
        color: #333;
        background-color: #fff;
        padding: 10px;
    }
`;

const NotificationBellContainer = styled.div`
    position: absolute;
    margin-bottom: 40px;
    margin-left: 39px;
    cursor: pointer;

    &:hover .notifications {
        display: block;
    }
`;

const BellIcon = styled.div`
    font-size: 18px;
    color: #737373;
    position: relative;

    &:hover {
        color: #DE7066;
    }
`;

const UnreadCount = styled.span`
    position: absolute;
    top: -5px;
    right: -10px;
    background: #DE7066;
    color: #fff;
    border-radius: 50%;
    font-size: 8px;
    padding: 5px 7px;
    display: ${(props) => (props.count > 0 ? 'inline' : 'none')};
`;

const NotificationList = styled.div`
    position: absolute;
    bottom: 15px;
    left: 15px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    width: 300px;
    z-index: 20;
    display: ${(props) => (props.show ? 'block' : 'none')};
`;

const NotificationItem = styled.div`
    padding: 10px;
    border-bottom: 1px solid #eee;
    color: #333;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f9f9f9;
        cursor: pointer;
    }
`;

const Sidebar = ({ condominium }) => {
    const navigate = useNavigate();
    const params = useParams();
    const selectedCondominium = condominium || params.condominium;

    const [profile, setProfile] = useState(null);
    const [condominiums, setCondominiums] = useState([]);
    const [loading, setLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(response.data);
                setCondominiums(response.data.condominiums || []);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        const fetchNotifications = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications(response.data);
                const unread = response.data.filter((notif) => !notif.is_read).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchUserProfile();
        fetchNotifications();
    }, [navigate]);

    const markNotificationAsRead = async (id) => {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/mark_as_read/`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, is_read: true } : notif
                )
            );
            setUnreadCount((prev) => prev - 1);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleCondominiumChange = (event) => {
        const newCondominium = event.target.value;
        navigate(`/${newCondominium}/occupation`);
    };

    if (loading) {
        return (
            <></>
            // <SidebarContainer>
            //     <CenteredContainer>
            //         <LoadingSpinner />
            //     </CenteredContainer>
            // </SidebarContainer>
        );
    }

    return (
        <SidebarContainer>
            <Logo>iGoove</Logo>
            
            <NavList>
                <NavItem>
                    <NavButton onClick={() => navigate(`/${selectedCondominium}/occupation`)}>
                        <ImgSidebar src="/calendar.png" alt="Calendar" />
                        Mapa de Ocupação
                    </NavButton>
                </NavItem>
                <NavItem>
                    <NavButton onClick={() => navigate(`/${selectedCondominium}/apartments`)}>
                        <ImgSidebar src="/apartament.png" alt="Apartments" />
                        Apartamentos
                    </NavButton>
                </NavItem>
                <NavItem>
                    <NavButton onClick={() => navigate(`/${selectedCondominium}/reports`)}>
                        <ImgSidebar src="/report.png" alt="Reports" />
                        Relatórios
                    </NavButton>
                </NavItem>
            </NavList>
            
            <ProfileAndLogoutContainer>
                {profile && (
                    <ProfileContainer>
                        <Avatar>
                            {profile.user?.charAt(0).toUpperCase() || "?"}
                            <NotificationBellContainer onClick={toggleNotifications}>
                                    <BellIcon>🔔</BellIcon>
                                    <UnreadCount count={unreadCount}>{unreadCount}</UnreadCount>
                                    <NotificationList show={showNotifications} className="notifications">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <NotificationItem
                                                    key={notif.id}
                                                    onClick={() => markNotificationAsRead(notif.id)}
                                                >
                                                    <strong>{notif.title}</strong>
                                                    <p>{notif.message}</p>
                                                </NotificationItem>
                                            ))
                                        ) : (
                                            <p>No notifications</p>
                                        )}
                                    </NotificationList>
                                </NotificationBellContainer>
                        </Avatar>
                        <ProfileInfo>
                            <UserName>{profile.user || "Usuário Desconhecido"}</UserName>
                            <StyledSelect value={selectedCondominium} onChange={handleCondominiumChange}>
                                {condominiums.map((condo) => (
                                    <option key={condo} value={condo}>
                                        {condo}
                                    </option>
                                ))}
                            </StyledSelect>
                        </ProfileInfo>
                    </ProfileContainer>
                )}
                <LogoutButton onClick={handleLogout}>
                    Sair
                </LogoutButton>
            </ProfileAndLogoutContainer>
        </SidebarContainer>
    );
};

export default Sidebar;
