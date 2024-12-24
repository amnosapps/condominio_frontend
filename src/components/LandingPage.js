import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for the Stripe-style landing page

// Container for the entire landing page
const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #f6f9fc;
`;

const Header = styled.header`
    width: 100%;
    padding: 1rem 0;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ImgLogo = styled.img`
    width: 200px;
    margin-top: -80px;
    margin-bottom: -50px;

    @media (max-width: 768px) {
        width: 250px;
        margin-top: -60px;
        margin-bottom: -60px;
    }
`;

const ImgHeroSection = styled.img`
    width: 400px;

    @media (max-width: 768px) {
        width: 300px;
        margin-top: 1rem;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

const HeaderContent = styled.div`
    width: 70%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        width: 90%;
        flex-direction: column;
        gap: 1rem;
    }
`;

const Nav = styled.nav`
    display: flex;
    gap: 2rem;
    align-items: center;

    @media (max-width: 768px) {
        gap: 1rem;
    }
`;

const LoginButton = styled.a`
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #F46600, #F16D61);
    border: none;
    border-radius: 40px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #F16D61, #F46600);
    }

    @media (max-width: 768px) {
        font-size: 18px;
        padding: 0.5rem 1.5rem;
    }
`;

const HeroSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    background-color: white;
    text-align: center;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
    }
`;

const HeroContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    max-width: 600px;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        align-items: center;
        text-align: center;
        padding: 1rem 2rem;
    }
`;

const HeroTitle = styled.h1`
    font-size: 50px;
    font-weight: 400;
    margin-bottom: 1rem;
    text-align: start;
    color: #3C3C3C;
    line-height: 1.2;

    > b {
        color: #F46600;
    }

    @media (max-width: 768px) {
        font-size: 36px;
        text-align: center;
        /* margin-bottom: 1rem; */
    }

    @media (max-width: 480px) {
        font-size: 36px;
        /* margin-bottom: 1rem; */
    }
`;

const HeroSubtitle = styled.p`
    font-size: 20px;
    color: #3C3C3C;
    margin-bottom: -35px;
    text-align: start;

    @media (max-width: 768px) {
        font-size: 18px;
        text-align: center;
        margin-bottom: -20px;
    }
`;

const GradientButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #F46600, #F16D61);
    border: none;
    border-radius: 40px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 300px;

    &:hover {
        background: linear-gradient(135deg, #F16D61, #F46600);
    }

    @media (max-width: 768px) {
        font-size: 24px;
        padding: 0.75rem 1.5rem;
        width: 100%;
    }
`;

const Footer = styled.footer`
    width: 100%;
    padding: 2rem;
    background-color: #3C3C3C;
    color: white;
    text-align: center;

    > a {
        text-decoration: none;
        color: white;
        cursor: pointer;
    }
`;

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <ImgLogo src="/IMG_0659.PNG" alt="home" />
                    <Nav>
                        <LoginButton onClick={handleLoginClick}>Entrar</LoginButton>
                    </Nav>
                </HeaderContent>
            </Header>

            <HeroSection>
                <HeroContent>
                    <HeroSubtitle>Gestão de condomínio sem dor de cabeça</HeroSubtitle>
                    <HeroTitle>
                        A solução em <b>tecnologia</b> que garante <b>governança</b> para seu condomínio
                    </HeroTitle>
                    <GradientButton onClick={handleLoginClick}>Fale com nossa equipe</GradientButton>
                </HeroContent>
                <HeroContent>
                    <ImgHeroSection src="/hero.png" alt="home" />
                </HeroContent>
            </HeroSection>

            <Footer>
                <p>
                    © {new Date().getFullYear()} Desenvolvido por{' '}
                    <a href="https://www.instagram.com/amnosapps/">Amnos Apps 🚀</a>
                </p>
            </Footer>
        </Container>
    );
};

export default LandingPage;
