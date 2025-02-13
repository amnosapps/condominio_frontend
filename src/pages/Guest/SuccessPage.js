import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

const ImgLogo = styled.img`
    width: 250px;
    margin-bottom: -4rem;

    @media (max-width: 480px) {
        width: 250px;
    }
`;

const Title = styled.h2`
  color: #28a745;
  margin-bottom: 20px;
`;

const Button = styled(Link)`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px;

  &:hover {
    background-color: #0056b3;
  }
`;

const SuccessPage = () => {
  return (
    <Container>
        <ImgLogo src="/IMG_0659.PNG" alt="home" />
        <Title>Cadastro realizado com sucesso!</Title>
        <p>Obrigado por preencher o formulário.</p>
        <Button to="/">Voltar à Página Inicial</Button>
    </Container>
  );
};

export default SuccessPage;
