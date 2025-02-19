import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import api from '../services/api';

// Styled components
const Container = styled.div`
    max-width: 800px;
    width: 100%;
    height: 100%;
    margin: 50px auto;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    text-align: center;

    @media (max-width: 768px) {
        padding: 10px;
        max-width: 300px;
    }
`;

const Title = styled.h2`
    color: #F46600;
    margin-bottom: 20px;
    font-size: 1.5rem;

    @media (max-width: 768px) {
        font-size: 2.3rem;
    }

    @media (max-width: 480px) {
        font-size: 1.6rem;
    }
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr; /* Single column for mobile */
        gap: 20px;
    }
`;

const Card = styled.div`
    background-color: #fff;
    border: 2px solid #F46600;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 480px) {
        padding: 15px;
    }
`;

const CardImage = styled.img`
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
    object-fit: contain;

    @media (max-width: 768px) {
        width: 50px;
        height: 50px;
    }

    @media (max-width: 480px) {
        width: 60px;
        height: 60px;
    }
`;

const CardTitle = styled.h3`
    color: #F46600;
    font-size: 1.2rem;
    margin-bottom: 10px;

    @media (max-width: 768px) {
        font-size: 1rem;
    }

    @media (max-width: 480px) {
        font-size: 1.4rem;
    }
`;

const CardButton = styled.button`
    background-color: #F46600;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #C95C58;
    }

    @media (max-width: 768px) {
        padding: 6px 12px;
        font-size: 0.8rem;
    }

    @media (max-width: 480px) {
        padding: 5px 10px;
        font-size: 0.7rem;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 0.9rem;
    margin-top: 10px;

    @media (max-width: 768px) {
        font-size: 0.8rem;
    }

    @media (max-width: 480px) {
        font-size: 0.7rem;
    }
`;

const LoadingMessage = styled.div`
    color: #F46600;
    font-size: 1rem;
    margin-top: 20px;

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }

    @media (max-width: 480px) {
        font-size: 0.8rem;
    }
`;

// Component
const CondominiumSelection = ({ condominiums, onSelect }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCondominiumSelect = (condominium) => {
        onSelect(condominium);
        navigate(`/${condominium.name}/home`);
    };

    if (loading) {
        return (
            <Container>
                <LoadingMessage>Loading condominiums...</LoadingMessage>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <ErrorMessage>{error}</ErrorMessage>
            </Container>
        );
    }

    if (condominiums.length === 0) {
        return (
            <Container>
                <ErrorMessage>No condominiums available. Please contact support.</ErrorMessage>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Selecione o Condominio</Title>
            <CardGrid>
                {condominiums?.map((condo) => (
                    <Card key={condo.id} onClick={() => handleCondominiumSelect(condo)}>
                        <CardImage src="condo.png" alt="Apartment" />
                        <CardTitle>{condo.name}</CardTitle>
                    </Card>
                ))}
            </CardGrid>
        </Container>
    );
};

export default CondominiumSelection;
