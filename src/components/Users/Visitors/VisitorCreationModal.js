import React, { useState } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  button {
    background: none;
    border: none;
    font-size: 18px;
    color: #888;
    cursor: pointer;

    &:hover {
      color: #333;
    }
  }
`;

const Input = styled.input`
  width: 96%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #f46600;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #e05a00;
  }
`;

const VisitorCreationModal = ({ onClose, fetchVisitors }) => {
  const [name, setName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreateVisitor = () => {
    // Simulate creating a visitor
    console.log("Creating visitor:", { name, visitDate, unit, phone });
    onClose(); // Close the modal
    fetchVisitors(); // Refresh visitors list (replace with API call if needed)
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Criar Visitante</h3>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        <Input
          type="text"
          placeholder="Nome do Visitante"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data da Visita"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Unidade"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button onClick={handleCreateVisitor}>Adicionar Visitante</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VisitorCreationModal;
