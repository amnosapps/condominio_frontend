import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

// Styled Components
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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #09801d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #05440f;
  }
`;

const UserEditModal = ({ user, onClose, fetchUsers }) => {
  const [name, setName] = useState(user.name);

  const handleUpdate = async () => {
    // Add update logic here
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={handleUpdate}>Atualizar</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserEditModal;
