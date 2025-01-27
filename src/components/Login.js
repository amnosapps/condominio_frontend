import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import api from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Styled Components for Login Form
const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f7f9fc;
    padding: 1rem;

    @media (max-width: 768px) {
        padding: 2rem;
    }
`;

const LoginBox = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    padding: 3rem 2rem;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;

    @media (max-width: 480px) {
        padding: 2rem 2rem;
    }
`;

const ImgLogo = styled.img`
    width: 200px;
    /* margin-bottom: 1rem; */

    @media (max-width: 480px) {
        width: 200px;
    }
`;

const Title = styled.a`
    margin-bottom: 1.5rem;
    font-size: 24px;
    text-align: center;
    color: #F46600;
    text-decoration: none;
    font-weight: 600;

    @media (max-width: 480px) {
        font-size: 20px;
    }

    &:hover {
        cursor: pointer;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const InputGroup = styled.div`
    margin-bottom: 1.5rem;

    @media (max-width: 480px) {
        margin-bottom: 1rem;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-size: 14px;

    @media (max-width: 480px) {
        font-size: 16px;
    }
`;

const PasswordContainer = styled.div`
    display: flex;
    align-items: center;
    position: relative;
`;

const EyeIcon = styled.div`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #F46600;

    &:hover {
        color: #E35144;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.2s;

    &:focus {
        border-color: #F46600;
        outline: none;
    }

    @media (max-width: 480px) {
        padding: 0.8rem;
        font-size: 16px;
    }
`;

const Button = styled.button`
    background-color: #F46600;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #E35144;
    }

    &:disabled {
        background-color: #b3d7ff;
        cursor: not-allowed;
    }

    @media (max-width: 480px) {
        padding: 0.6rem;
        font-size: 16px;
    }
`;

const FooterCallToAction = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;

    > p {
        text-align: center;
        opacity: 60%;
        font-size: 14px;

        @media (max-width: 480px) {
            font-size: 16px;
        }
    }
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 14px;
    text-align: center;
    margin-top: -1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 480px) {
        font-size: 16px;
    }
`

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error before attempting login

        try {
            // Authenticate user
            const response = await api.post(`/api/token/`, {
                username,
                password,
            });

            // Save tokens to localStorage
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);

            // Fetch user profile
            const profileResponse = await api.get(`/api/profile/`, {
                headers: { Authorization: `Bearer ${response.data.access}` },
            });

            const userProfile = profileResponse.data;
            onLoginSuccess(userProfile);

            // Navigation logic
            if (userProfile.condominiums && userProfile.condominiums.length === 1) {
                // If only one condominium, navigate directly
                navigate(`/${userProfile.condominiums[0]}/home`);
            } else if (userProfile.condominiums && userProfile.condominiums.length > 1) {
                // If multiple condominiums, navigate to selection page
                navigate('/select-condominium');
            } else {
                // Handle case where no condominiums are available
                setError('Nenhum condomínio foi associado ao seu perfil.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('Erro ao fazer login. Verifique suas credenciais ou procure o suporte.');
        }
    };

    return (
        <Container>
            <LoginBox>
                <ImgLogo src="/IMG_0659.PNG" alt="home" />
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Usuário:</Label>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Senha:</Label>
                        <PasswordContainer>
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <EyeIcon onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </EyeIcon>
                        </PasswordContainer>
                    </InputGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Button type="submit">Entrar</Button>
                </Form>
                <FooterCallToAction>
                    <p>
                        Ainda não é nosso cliente? Fale conosco
                    </p>
                </FooterCallToAction>
            </LoginBox>
        </Container>
    );
}

export default Login;
