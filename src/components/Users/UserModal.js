import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContainer = styled.div`
    background: white;
    padding: 20px;
    width: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
    margin-bottom: 20px;
    font-size: 20px;
    text-align: center;
`;

const Input = styled.input`
    width: 94%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const UserTypeDisplay = styled.div`
    margin-bottom: 15px;
    font-size: 16px;
    color: #555;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Button = styled.button`
    background-color: ${(props) => (props.cancel ? '#e74c3c' : '#007bff')};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: ${(props) => (props.cancel ? '#c0392b' : '#0056b3')};
    }
`;

const UserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState(
        user || { name: '', email: '', user_type: 'Resident' } // Default to 'Resident' for new users
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    const translateUserType = (userType) => {
        switch (userType) {
            case 'Resident':
                return 'Residente';
            case 'Owner':
                return 'Proprietário';
            default:
                return userType; // Default to the original type if no match
        }
    };


    return (
        <Overlay>
            <ModalContainer>
                <ModalTitle>{user ? 'Editar' : `Adicionar`}</ModalTitle>
                {/* Show dropdown for adding new users */}
                {!user && (
                    <Select
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleInputChange}
                    >
                        <option value="Resident">Residente</option>
                        <option value="Owner">Proprietário</option>
                    </Select>
                )}
                {/* Display user type when editing */}
                {user && (
                    <UserTypeDisplay>
                        Tipo: {translateUserType(formData.user_type) || 'Unknown'}
                    </UserTypeDisplay>
                )}
                <Input
                    name="name"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={handleInputChange}
                />
                <Input
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
                <ButtonGroup>
                    <Button cancel onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

export default UserModal;

