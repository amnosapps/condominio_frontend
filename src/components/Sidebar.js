// src/components/Sidebar.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for Sidebar
const SidebarContainer = styled.div`
    background-color: #fff;
    width: 250px;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    color: white;
    align-items: center;

    @media (max-width: 768px) {
        width: 200px;
    }
`;

const Logo = styled.h2`
    font-size: 24px;
    color: #DE7066;
    margin-bottom: 2rem;
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

const LogoutButton = styled.a`
    color: #fff;
    text-decoration: none;
    font-size: 15px;
    transition: color 0.3s;
    background: linear-gradient(135deg, #DE7066, #F16D61);
    border: none;
    border-radius: 40px;
    text-align: center;
    padding: 0.50rem 2rem;

    &:hover {
        color: #fff;
        cursor: pointer;
        background: linear-gradient(135deg, #F16D61, #DE7066);
    }
`;

const Sidebar = (IsAuthenticated) => {
    const navigate = useNavigate();

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
                    <ImgSidebar src='calendar.png' />
                    <NavLink href="/occupation">Mapa de Ocupação</NavLink>
                </NavItem>
                <NavItem>
                    <ImgSidebar src='apartament.png' />
                    <NavLink href="/apartments">Apartamentos</NavLink>
                </NavItem>
                <NavItem>
                    <ImgSidebar src='report.png' />
                    <NavLink href="/services">Serviços</NavLink>
                </NavItem>
            </NavList>
            <LogoutButton onClick={handleLogout} to="/">
                Sair
            </LogoutButton>
        </SidebarContainer>
    );
};

export default Sidebar;
