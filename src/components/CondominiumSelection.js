import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
    max-width: 800px;
    width: 100%;
    height: 100%;
    margin: 50px auto;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    text-align: center;
`;

const Title = styled.h2`
    color: #F46600;
    margin-bottom: 20px;
    font-size: 1.5rem;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    justify-content: center;
    align-items: center;
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
`;

const CardImage = styled.img`
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
    object-fit: contain;
`;

const CardTitle = styled.h3`
    color: #F46600;
    font-size: 1.2rem;
    margin-bottom: 10px;
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
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 0.9rem;
    margin-top: 10px;
`;

const LoadingMessage = styled.div`
    color: #F46600;
    font-size: 1rem;
    margin-top: 20px;
`;

// Component
const CondominiumSelection = ({ condominiums: initialCondominiums = [], onSelect }) => {
    const [condominiums, setCondominiums] = useState(initialCondominiums);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCondominiums = async () => {
            if (initialCondominiums.length > 0) {
                setCondominiums(initialCondominiums);
                return;
            }

            setLoading(true);
            setError(null);

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError("You are not authenticated. Please log in again.");
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data?.condominiums?.length > 0) {
                    setCondominiums(response.data.condominiums);
                } else {
                    throw new Error("No condominiums found.");
                }
            } catch (err) {
                console.error("Error fetching condominiums:", err);
                setError("Failed to load condominiums. Please log in again.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchCondominiums();
    }, [initialCondominiums, navigate]);

    const handleCondominiumSelect = (condominium) => {
        onSelect(condominium);
        navigate(`/${condominium}/occupation`);
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
                {condominiums.map((condo) => (
                    <Card key={condo} onClick={() => handleCondominiumSelect(condo)}>
                        <CardImage src="apartament.png" alt="Apartment" />
                        <CardTitle>{condo}</CardTitle>
                    </Card>
                ))}
            </CardGrid>
        </Container>
    );
};

export default CondominiumSelection;
