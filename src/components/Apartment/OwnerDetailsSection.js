import React, { useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const OwnerDetailsSidebar = styled.div`
    flex: 1.5; /* Same width as the messages sidebar */
    background: #F8F9FA; /* Light gray background for distinction */
    border-left: 1px solid #e9ecef;
    padding: 1rem;
    overflow-y: auto;
`;

const ModalLabel = styled.label`
    font-size: 1rem;
    font-weight: 500;
    color: #555555;
`;

const ModalInput = styled.input`
    width: 90%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;
    margin-top: 10px;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
    }
`;

const PasswordContainer = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 10px;
`;

const EyeIcon = styled.div`
    position: absolute;
    right: 25px;
    cursor: pointer;
    color: #007bff;

    &:hover {
        color: #0056b3;
    }
`;

// Owner Details Section Component
const OwnerDetailsSection = ({ ownerDetails, ownerToAdd, setOwnerToAdd, handleAddOwner, handleRemoveOwner, profile, SaveButton, RemoveButton }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <h3 style={{ marginBottom: '-9px' }}>Proprietário</h3>
            {!ownerDetails.name && profile.user_type === 'admin' ? (
                <>
                    <h4 style={{ marginBottom: '-3px' }}>Adicionar Proprietário</h4>
                    <ModalInput
                        type="text"
                        placeholder="Nome"
                        value={ownerToAdd.name}
                        onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <ModalInput
                        type="email"
                        placeholder="Email"
                        value={ownerToAdd.email}
                        onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, email: e.target.value }))}
                    />
                    <ModalInput
                        type="text"
                        placeholder="Documento"
                        value={ownerToAdd.document}
                        onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, document: e.target.value }))}
                    />
                    <ModalInput
                        type="text"
                        placeholder="Telefone"
                        value={ownerToAdd.phone}
                        onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    {/* <ModalInput
                        type="text"
                        placeholder="Username"
                        value={ownerToAdd.username}
                        onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, username: e.target.value }))}
                    />
                    <PasswordContainer>
                        <ModalInput
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={ownerToAdd.password}
                            onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, password: e.target.value }))}
                        />
                        <EyeIcon onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </EyeIcon>
                    </PasswordContainer> */}
                    <SaveButton onClick={handleAddOwner}>Adicionar Proprietário</SaveButton>
                </>
            ) : (
                <>
                    <p><b>Nome:</b> {ownerDetails.name || 'N/A'}</p>
                    <p><b>Email:</b> {ownerDetails.email || 'N/A'}</p>
                    <p><b>Telefone:</b> {ownerDetails.phone || 'N/A'}</p>
                    {profile.user_type === 'admin' && (
                        <RemoveButton onClick={handleRemoveOwner}>Remover Proprietário</RemoveButton>
                    )}
                </>
            )}
        </div>
    );
};

export default OwnerDetailsSection;
