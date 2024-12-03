import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    /* border: 2px solid #F46600; */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

const HomePage = ({ condominium }) => {
    const params = useParams();
    const selectedCondominium = condominium || params.condominium;
    const navigate = useNavigate();

    const navigationItems = [
        {
            title: "Mapa de Ocupação",
            icon: "/calendar.png",
            path: `/${selectedCondominium}/occupation`,
        },
        {
            title: "Apartamentos",
            icon: "/apartament.png",
            path: `/${selectedCondominium}/apartments`,
        },
        {
            title: "Relatórios",
            icon: "/report.png",
            path: `/${selectedCondominium}/reports`,
        },
    ];

    return (
        <Container>
            <Title>Selecione uma Opção</Title>
            <CardGrid>
                {navigationItems.map((item) => (
                    <Card key={item.title} onClick={() => navigate(item.path)}>
                        <CardImage src={item.icon} alt={item.title} />
                        <CardTitle>{item.title}</CardTitle>
                    </Card>
                ))}
            </CardGrid>
        </Container>
    );
};

export default HomePage;
