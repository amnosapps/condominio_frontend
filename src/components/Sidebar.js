import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

// Styled components for Sidebar
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
    font-size: 16px;
    color: #333;
    font-weight: bold;
`;

const ImgSidebar = styled.img`
    width: 20px;
    margin-right: 10px;
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

const NavLink = styled.a`
    color: #737373;
    text-decoration: none;
    font-size: 18px;
    transition: color 0.3s;

    &:hover {
        color: #DE7066;
        cursor: pointer;
    }
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #DE7066; /* Red */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Sidebar = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(response.data); // Assuming a single profile is returned
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <SidebarContainer>
            <Logo>iGestão</Logo>
            <NavList>
                <NavItem>
                    <ImgSidebar src="calendar.png" />
                    <NavLink href="/occupation">Mapa de Ocupação</NavLink>
                </NavItem>
                <NavItem>
                    <ImgSidebar src="apartament.png" />
                    <NavLink href="/apartments">Apartamentos</NavLink>
                </NavItem>
                <NavItem>
                    <ImgSidebar src="report.png" />
                    <NavLink href="/">Relatórios</NavLink>
                </NavItem>
            </NavList>
            <ProfileAndLogoutContainer>
                {profile ? (
                    <ProfileContainer>
                        <Avatar>
                            {profile.user.charAt(0).toUpperCase()} {/* First letter of username */}
                        </Avatar>
                        <ProfileInfo>
                            <UserName>{profile.user}</UserName>
                            <CondoName>{profile.condominium.join(", ")}</CondoName>
                        </ProfileInfo>
                    </ProfileContainer>
                ) : (
                    <LoadingSpinner />
                )}
                <LogoutButton onClick={handleLogout}>
                    Sair
                </LogoutButton>
            </ProfileAndLogoutContainer>
        </SidebarContainer>
    );
};

export default Sidebar;
