// src/components/DashboardLayout.js

import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

// Styled components for the layout
const LayoutContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
`;

const MainContent = styled.main`
    margin-left: 18rem;
    padding: 2rem;
    flex: 1;
    background-color: #f7f9fc;

    @media (max-width: 768px) {
        margin-left: 200px;
    }
`;

const DashboardLayout = () => {
    return (
        <LayoutContainer>
            <Sidebar />
            <MainContent>
                <Outlet /> {/* This renders the nested route components */}
            </MainContent>
        </LayoutContainer>
    );
};

export default DashboardLayout;
