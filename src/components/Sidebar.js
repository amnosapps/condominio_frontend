// src/components/Sidebar.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for Sidebar
const SidebarContainer = styled.div`
    background-color: #2c3e50;
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

    @media (max-width: 768px) {
        width: 200px;
    }
`;

const Logo = styled.h2`
    font-size: 24px;
    color: #ecf0f1;
    margin-bottom: 2rem;
`;

const NavList = styled.ul`
    list-style: none;
    padding: 0;
`;

const NavItem = styled.li`
    margin-bottom: 1.5rem;
`;

const NavLink = styled.a`
    color: #ecf0f1;
    text-decoration: none;
    font-size: 18px;
    transition: color 0.3s;

    &:hover {
        color: #3498db;
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
            <Logo>Dashboard</Logo>
            <NavList>
                <NavItem>
                    <NavLink to="/apartments">Apartments</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink onClick={handleLogout} to="/">
                        <button>logout</button>
                    </NavLink>
                </NavItem>
            </NavList>
        </SidebarContainer>
    );
};

export default Sidebar;
