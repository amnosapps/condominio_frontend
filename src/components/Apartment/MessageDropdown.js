import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const Dropdown = styled.div`
    margin-top: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #f9f9f9;
    overflow: hidden;
    padding: 10px;
`;

const DropdownHeader = styled.div`
    padding: 0.35rem 1rem;
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

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.5);
    }

    &::-webkit-scrollbar-track {
        background-color: #f0f0f0;
        border-radius: 10px;
    }

    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) #f0f0f0;
`;

const MessageSection = styled.div`
    border-top: 1px solid #ccc;
`;

const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: ${({ isCurrentUser }) => (isCurrentUser ? 'flex-end' : 'flex-start')};
`;

const Message = styled.div`
    background: ${({ isCurrentUser }) => (isCurrentUser ? '#007bff' : '#f8f9fa')};
    color: ${({ isCurrentUser }) => (isCurrentUser ? 'white' : '#333')};
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5rem;
    max-width: 70%;
    text-align: ${({ isCurrentUser }) => (isCurrentUser ? 'right' : 'left')};
`;

const MessageHeader = styled.div`
    font-size: 0.7rem;
    color: ${({ isCurrentUser }) => (isCurrentUser ? '#f0f0f0' : '#495057')};
    margin-bottom: 0.3rem;
`;

const ModalInput = styled.textarea`
    width: 95%;
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

    &:hover {
        background-color: #0056b3;
    }
`;

function MessageDropdown({ messages, profile, markMessageAsRead, handleSendMessage, newMessage, setNewMessage }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dropdown>
            <DropdownHeader onClick={() => setIsOpen((prev) => !prev)}>
                Mensagens
                <span>▼</span>
            </DropdownHeader>
            <DropdownContent isOpen={true}>
                <MessageSection>
                    {messages.map((message, index) => {
                        const isCurrentUser = message.sender === profile.user;
                        return (
                            <MessageContainer key={index} isCurrentUser={isCurrentUser}>
                                <MessageHeader isCurrentUser={isCurrentUser}>
                                    {isCurrentUser ? 'Você' : `De: ${message.sender}`} |{' '}
                                    {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm')}
                                </MessageHeader>
                                <Message isCurrentUser={isCurrentUser}>{message.text}</Message>
                            </MessageContainer>
                        );
                    })}
                    
                </MessageSection>
            </DropdownContent>
            <ModalInput
                type="text"
                placeholder="Escreva uma mensagem"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <SaveButton onClick={handleSendMessage}>Enviar</SaveButton>
        </Dropdown>
    );
}

export default MessageDropdown;
