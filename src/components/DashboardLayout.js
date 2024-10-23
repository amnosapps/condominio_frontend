// src/components/DashboardLayout.js

import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

// Styled components for the layout
const LayoutContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
`;

const MainContent = styled.main`
    margin-left: 250px;
    padding: 2rem;
    flex: 1;
    background-color: #f7f9fc;

    @media (max-width: 768px) {
        margin-left: 200px;
    }
`;

const DashboardLayout = ({ children }) => {
    return (
        <LayoutContainer>
            <Sidebar />
            <MainContent>
                {children}
            </MainContent>
        </LayoutContainer>
    );
};

export default DashboardLayout;
