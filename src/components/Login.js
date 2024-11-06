import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from React Router
import axios from 'axios';
import styled from 'styled-components';

// Styled Components for Login Form
const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f7f9fc;
    padding: 1rem;
`;

const LoginBox = styled.div`
    align-items: center;
    background-color: white;
    padding: 3rem 2rem;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
`;

const Title = styled.a`
    margin-bottom: 1.5rem;
    font-size: 24px;
    text-align: center;
    color: #DE7066;
    text-decoration: none;
    font-weight: 600;
    text-align: center;
    padding: 7.5rem;

    @media (max-width: 768px) {
        padding: 5rem;
    }

    &:hover {
        cursor: pointer;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const InputGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-size: 14px;
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
        border-color: #DE7066;
        outline: none;
    }
`;

const Button = styled.button`
    background-color: #DE7066;
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
`;

const FooterCallToAction = styled.div`
    display: flex;
    align-items: center;
    align-content: center;
    padding-left: 1.5rem;

    > p {
        text-align: center;
        opacity: 60%;
    }
`

const ErrorMessage = styled.p`
    color: red;
    font-size: 14px;
    text-align: center;
    margin-top: -1rem;
    margin-bottom: 1.5rem;
`;

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Using React Router's useNavigate for navigation

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/`, {
                username,
                password,
            });
            console.log(`${process.env.REACT_APP_API_URL}/api/token/`)
            // Store the JWT token in localStorage
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            onLoginSuccess();  // Call the login success callback
            navigate('/occupation'); // Redirect to the apartments route after login success
        } catch (err) {
            console.log(err)
            setError('Erro ao fazer login, procure o suporte.');
        }
    };

    return (
        <Container>
            <LoginBox>
                <Title href='/'>iGestão</Title>
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
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
