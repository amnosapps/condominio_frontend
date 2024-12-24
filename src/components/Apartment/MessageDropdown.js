import React, { useState } from 'react';
import styled from 'styled-components';

const Dropdown = styled.div`
    margin-top: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #f9f9f9;
    overflow: hidden;
`;

const DropdownHeader = styled.div`
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    background: #36A2EB;
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
        background: #0056b3;
    }
`;

const DropdownContent = styled.div`
    max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
    overflow-y: auto;
    transition: max-height 0.3s ease-in-out;
    padding: 0 1rem;

    /* Styling the scrollbar */
    &::-webkit-scrollbar {
        width: 6px; /* Make the scrollbar thinner */
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3); /* Subtle dark color for thumb */
        border-radius: 10px; /* Rounded edges for thumb */
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.5); /* Darker on hover */
    }

    &::-webkit-scrollbar-track {
        background-color: #f0f0f0; /* Light background for track */
        border-radius: 10px; /* Rounded edges for track */
    }

    /* Fallback for non-WebKit browsers */
    scrollbar-width: thin; /* Firefox-specific: Makes scrollbar thin */
    scrollbar-color: rgba(0, 0, 0, 0.3) #f0f0f0; /* Thumb color and track color */
`;

const MessageSection = styled.div`
    padding: 1rem;
    border-top: 1px solid #ccc;
`;

const Message = styled.div`
    background: ${({ read }) => (read ? '#f8f9fa' : '#fff3cd')};
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
        font-size: 0.9rem;
        color: #495057;
    }
`;

const MarkAsReadButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #218838;
    }
`;

const ModalInput = styled.input`
    width: 100%;
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
    }
`;

const SaveButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 8px;
    margin-bottom: 10px;

    &:hover {
        background-color: #0056b3;
    }
`;

function MessageDropdown({ messages, profile, markMessageAsRead, handleSendMessage, newMessage, setNewMessage }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dropdown>
            <DropdownHeader onClick={() => setIsOpen(!isOpen)}>
                Observações e Mensagens
                <span>{isOpen ? '▲' : '▼'}</span>
            </DropdownHeader>
            <DropdownContent isOpen={isOpen}>
                <MessageSection>
                    {messages.map((message, index) => (
                        <Message key={index} read={message.read}>
                            <span>{message.text}</span>
                            {message.sender === profile.user ? (
                                <span>{message.read ? 'Lida' : 'Não lida'}</span>
                            ) : (
                                !message.read && (
                                    <MarkAsReadButton onClick={() => markMessageAsRead(index)}>
                                        Marcar como lida
                                    </MarkAsReadButton>
                                )
                            )}
                        </Message>
                    ))}
                    <ModalInput
                        type="text"
                        placeholder="Escreva uma mensagem"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <SaveButton onClick={handleSendMessage}>Enviar</SaveButton>
                </MessageSection>
            </DropdownContent>
        </Dropdown>
    );
}

export default MessageDropdown;
