import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const LayoutContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;

    @media (max-width: 768px) {
        flex-direction: column;
    }

    &::-webkit-scrollbar {
        width: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #b3b3b3;
    }
`;

const MainContent = styled.main`
    margin-left: 19rem;
    padding: 2rem;
    flex: 1;
    background-color: #f7f9fc;

    @media (max-width: 768px) {
        margin-left: 0;
        padding: 1rem;
    }

    @media (max-width: 480px) {
        padding: 2.5rem;
        margin-left: 0;
    }

    &::-webkit-scrollbar {
        width: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #b3b3b3;
    }
`;

const DashboardLayout = ({ profile }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    return (
        <LayoutContainer>
            <Sidebar profile={profile} isOpen={isSidebarOpen} onToggle={setSidebarOpen} />
            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};

export default DashboardLayout;
