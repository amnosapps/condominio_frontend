import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FaBell, FaCalendarAlt, FaChartLine, FaCity, FaCloudSun, FaCog, FaCommentAlt, FaHome, FaKey, FaMoneyCheckAlt, FaPoll, FaRegCommentAlt, FaUnlockAlt, FaUsers } from 'react-icons/fa';

const SidebarContainer = styled.div`
    background-color: #fff;
    width: ${(props) => (props.isMobile ? (props.isOpen ? '250px' : '0') : '250px')};
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.isMobile ? (props.isOpen ? '1.5rem' : '0') : '1.5rem')};
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    align-items: center;
    z-index: 100;
    overflow-x: hidden;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
        width: ${(props) => (props.isOpen ? '300px' : '0')};
    }

    @media (max-width: 480px) {
        width: ${(props) => (props.isOpen ? '250px' : '0')};
        /* height: 90%; */
    }
`;

const HamburgerButton = styled.button`
    position: fixed;
    top: 1rem;
    left: 1rem;
    background: #f46600;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    z-index: 110;
    display: none;
    /* position: fixed; */

    @media (max-width: 768px) {
        display: block;
    }
`;

const Logo = styled.h2`
    font-size: 24px;
    color: #F46600;
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
        border-color: #F46600;
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

    @media (max-width: 480px) {
        margin-bottom: 8rem;
    }
`;

const ProfileContainer = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
`;

const Avatar = styled.div`
    width: 50px;
    height: 50px;
    background-color: #F46600;
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
    opacity: ${(props) => (props.isMobile && !props.isOpen ? '0' : '1')};
    visibility: ${(props) => (props.isMobile && !props.isOpen ? 'hidden' : 'visible')};
    transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const NavItem = styled.li`
    margin-bottom: 1rem;
`;

const NavButton = styled.button`
    color: ${(props) => (props.active ? '#F46600' : '#737373')};
    text-decoration: none;
    font-size: 18px;
    transition: color 0.3s;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
        color: #F46600;
        cursor: pointer;
    }
`;

const ImgSidebar = styled.img`
    width: 20px;
`;

const ImgLogo = styled.img`
    width: 200px;
`;

const LogoutButton = styled.button`
    color: #fff;
    font-size: 15px;
    transition: color 0.3s;
    background: linear-gradient(135deg, #F46600, #F16D61);
    border: none;
    border-radius: 40px;
    text-align: center;
    padding: 0.50rem 2rem;

    &:hover {
        cursor: pointer;
        background: linear-gradient(135deg, #F16D61, #F46600);
    }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
        /* border-color: #F46600; */
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

const NotificationListContainer = styled.div`
    position: absolute;
    bottom: 40px;
    left: 30px;
    width: 320px;
    max-height: 400px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    overflow: hidden;
`;

const NotificationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #F46600;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    /* z-index: 1000; */
`;

const NotificationBody = styled.div`
    max-height: 350px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 8px;
    }
`;

const NotificationFooter = styled.div`
    text-align: center;
    padding: 10px 0;
    background-color: #f9f9f9;
    border-top: 1px solid #ddd;
    cursor: pointer;

    > p {
        color: #FFE9D9;
    }

    &:hover {
        background-color: #f2f2f2;
    }
`;

const NotificationItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 15px;
    border-bottom: 1px solid #f2f2f2;
    background-color: ${(props) => (props.unread ? "#FFF7F0" : "#fff")};
    cursor: pointer;

    &:hover {
        background-color: ${(props) => (props.unread ? "#FFE9D9" : "#f9f9f9")};
    }
`;

const NotificationTitle = styled.div`
    text-align: start;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
`;

const NotificationMessage = styled.div`
    color: #555;
    text-align: start;
    font-size: 14px;
    margin-bottom: 5px;
`;

const CloseNotification = styled.div`
    color: #555;
    text-align: center;
    font-size: 16px;
    margin-bottom: 5px;
`;

const NotificationTime = styled.div`
    color: #999;
    font-size: 12px;
    text-align: right;
`;

const NotificationBellContainer = styled.div`
    position: absolute;
    margin-bottom: 40px;
    margin-left: 39px;
    cursor: pointer;
`;
const NotificationContainer = styled.div`
    position: absolute;
    cursor: pointer;
    z-index: 200;
    /* flex: 1; */
`;

const BellIcon = styled.div`
    font-size: 20px;
    color: #737373;

    &:hover {
        color: #F46600;
    }
`;

const UnreadCount = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    background: #F46600;
    color: #fff;
    border-radius: 50%;
    font-size: 10px;
    padding: 5px 7px;
    display: ${(props) => (props.count > 0 ? "inline" : "none")};
`;

const Sidebar = ({ condominium }) => {
    const navigate = useNavigate();
    const location = useLocation()
    const params = useParams();
    const selectedCondominium = condominium || params.condominium;

    const [profile, setProfile] = useState(null);
    const [condominiums, setCondominiums] = useState([]);
    const [loading, setLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [isOpen, setIsOpen] = useState(true); // Open by default for desktop
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

        const handleResize = () => {
            const isNowMobile = window.innerWidth <= 768;
            setIsMobile(isNowMobile);
            if (!isNowMobile) setIsOpen(true); // Ensure sidebar is open for desktop
        };

        fetchUserProfile();
        fetchNotifications();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [navigate]);

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setIsOpen(false); // Close sidebar on mobile navigation
        }
    };

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

    const markAllNotificationsAsRead = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const unreadNotifications = notifications.filter((notif) => !notif.is_read);

            await Promise.all(
                unreadNotifications.map((notif) =>
                    axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/${notif.id}/mark_as_read/`, null, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );

            setNotifications((prev) =>
                prev.map((notif) => ({
                    ...notif,
                    is_read: true,
                }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const formatTime = (time) => {
        const date = new Date(time);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric',
        });
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
        <>
             {isMobile && (
                <HamburgerButton onClick={() => setIsOpen((prev) => !prev)}>
                    ☰
                </HamburgerButton>
            )}
            <SidebarContainer isOpen={isOpen} isMobile={isMobile}>
                <NavList isMobile={isMobile} isOpen={isOpen}>
                    <ImgLogo src="/IMG_0659.PNG" alt="home" />
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/home`)}
                            active={location.pathname.includes(`${selectedCondominium}/home`)}
                        >
                            <FaHome />
                            Início
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/occupation`)}
                            active={location.pathname.includes(`${selectedCondominium}/occupation`)}
                        >
                            <FaCalendarAlt />
                            Mapa de Ocupação
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/apartments`)}
                            active={location.pathname.includes(`${selectedCondominium}/apartments`)}
                        >
                            <FaKey />
                            Apartamentos
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/reports`)}
                            active={location.pathname.includes(`${selectedCondominium}/reports`)}
                        >
                            <FaChartLine />
                            Relatórios
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                            <FaCloudSun />
                            Espaço
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaCog />
                        Serviços
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaMoneyCheckAlt />
                        Financeiro
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaUnlockAlt />
                        Controle de Acesso
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaCity />
                        Condomínio
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/users`)}
                            active={location.pathname.includes(`${selectedCondominium}/users`)}
                        >
                        <FaUsers />
                        Usuários
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaCommentAlt />
                        Mensagens
                        </NavButton>
                    </NavItem>
                    <NavItem>
                        <NavButton
                            onClick={() => handleNavigation(`/${selectedCondominium}/soon`)}
                            // active={location.pathname.includes(`${selectedCondominium}/soon`)}
                        >
                        <FaBell />
                        Notificações
                        </NavButton>
                    </NavItem>
                </NavList>
                
                <ProfileAndLogoutContainer>
                    {profile && (
                        <ProfileContainer>
                            <Avatar>
                                {profile.name?.charAt(0).toUpperCase() || "?"}
                                    {/* <NotificationBellContainer onClick={toggleNotifications}>
                                        <BellIcon>🔔</BellIcon>
                                        <UnreadCount count={unreadCount}>{unreadCount}</UnreadCount>
                                    </NotificationBellContainer> */}
                                    {showNotifications && (
                                        <NotificationContainer>
                                            <NotificationListContainer>
                                                <NotificationHeader>
                                                    Notificações
                                                    <span onClick={markAllNotificationsAsRead} style={{ cursor: 'pointer', fontSize: 12 }}>
                                                        Marcar todos como lido
                                                    </span>
                                                </NotificationHeader>
                                                <NotificationBody>
                                                    {notifications.length > 0 ? (
                                                        notifications.map((notif) => (
                                                            <NotificationItem
                                                                key={notif.id}
                                                                unread={!notif.is_read}
                                                                onClick={() => {
                                                                    markNotificationAsRead(notif.id);
                                                                }}
                                                            >
                                                                <NotificationTitle>{notif.title}</NotificationTitle>
                                                                <NotificationMessage>{notif.message}</NotificationMessage>
                                                                <NotificationTime>{formatTime(notif.created_at)}</NotificationTime>
                                                            </NotificationItem>
                                                        ))
                                                    ) : (
                                                        <p style={{ padding: '15px', textAlign: 'center' }}>No notifications</p>
                                                    )}
                                                </NotificationBody>
                                                    
                                                <NotificationFooter onClick={toggleNotifications}>
                                                    <>Fechar</>
                                                </NotificationFooter>
                                            </NotificationListContainer>
                                        </NotificationContainer>
                                    )}
                            </Avatar>
                            <ProfileInfo>
                                <UserName>Olá, {profile.name || "Usuário Desconhecido"}!</UserName>
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
        </>
    );
};

export default Sidebar;
