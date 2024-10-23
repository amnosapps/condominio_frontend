import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for the Stripe-style landing page

// Container for the entire landing page
const Container = styled.div`
    display: flex;
    flex-direction: column;
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

const HeaderContent = styled.div`
    width: 70%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        width: 90%;
    }
`;

const Logo = styled.h1`
    font-size: 24px;
    font-weight: bold;
    color: #6772e5;
`;

const Nav = styled.nav`
    display: flex;
    gap: 2rem;
`;

const NavLink = styled.a`
    color: #333;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
        color: #6772e5;
    }
`;

const HeroSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    background-color: white;
    text-align: center;
`;

const HeroContent = styled.div`
    max-width: 900px;
    margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
    font-size: 64px;
    font-weight: bold;
    color: #32325d;
    margin-bottom: 1rem;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 48px;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 20px;
    color: #525f7f;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const GradientButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #6772e5, #9b51e0);
    border: none;
    border-radius: 40px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #5469d4, #8e44ad);
    }

    @media (max-width: 768px) {
        font-size: 16px;
        padding: 0.75rem 1.5rem;
    }
`;

const FeaturesSection = styled.section`
    width: 100%;
    padding: 4rem 0;
    background-color: #f6f9fc;
`;

const FeaturesGrid = styled.div`
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    gap: 2rem;
    margin: 0 auto;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const FeatureCard = styled.div`
    flex: 1;
    min-width: 250px;
    max-width: 350px;
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
`;

const FeatureTitle = styled.h3`
    font-size: 20px;
    margin-bottom: 1rem;
    color: #32325d;
`;

const FeatureDescription = styled.p`
    font-size: 16px;
    color: #525f7f;
`;

const Footer = styled.footer`
    width: 100%;
    padding: 2rem;
    background-color: #32325d;
    color: white;
    text-align: center;
`;

const FooterText = styled.p`
    font-size: 14px;
    margin: 0;
`;

const LandingPage = () => {
    const navigate = useNavigate();

    // Navigate to the login page on button click
    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <Logo>iGestão</Logo>
                    <Nav>
                        <NavLink onClick={() => navigate('/signup')}>Fale com nossa equipe</NavLink>
                        <NavLink onClick={() => navigate('/login')}>Entrar</NavLink>
                    </Nav>
                </HeaderContent>
            </Header>

            <HeroSection>
                <HeroContent>
                    <HeroTitle>Gestão de condomínio sem dor de cabeça</HeroTitle>
                    <HeroSubtitle>
                        Antecipe Problemas e Garanta a Tranquilidade no Seu Condomínio!
                    </HeroSubtitle>
                    <GradientButton onClick={handleLoginClick}>Fale com nossa equipe</GradientButton>
                </HeroContent>
            </HeroSection>

            <FeaturesSection>
                <FeaturesGrid>
                    <FeatureCard>
                        <FeatureTitle>Effortless Management</FeatureTitle>
                        <FeatureDescription>
                            Keep track of your apartments with our intuitive dashboard.
                        </FeatureDescription>
                    </FeatureCard>
                    <FeatureCard>
                        <FeatureTitle>User Permissions</FeatureTitle>
                        <FeatureDescription>
                            Assign and manage user roles effortlessly with built-in controls.
                        </FeatureDescription>
                    </FeatureCard>
                    <FeatureCard>
                        <FeatureTitle>Detailed Analytics</FeatureTitle>
                        <FeatureDescription>
                            Get real-time insights and reports on your apartment data.
                        </FeatureDescription>
                    </FeatureCard>
                </FeaturesGrid>
            </FeaturesSection>

            <Footer>
                <FooterText>© {new Date().getFullYear()} Desenvolvido por <a href='https://www.instagram.com/amnosapps/'>Amnos Apps</a></FooterText>
            </Footer>
        </Container>
    );
};

export default LandingPage;
