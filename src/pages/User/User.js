import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import UserModal from '../../components/Users/UserModal';

const Container = styled.div`
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 24px;
    color: #333;
`;

const AddButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background-color: #0056b3;
    }
`;

const UserList = styled.div`
    margin-top: 20px;
`;

const UserItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;

    &:last-child {
        border-bottom: none;
    }
`;

const UserDetails = styled.div`
    display: flex;
    align-items: center; /* Vertically center items */
    gap: 30px; /* Add spacing between items */
`;

const UserDetail = styled.div`
    flex: 1; /* Allow items to grow/shrink as needed */
    text-align: left; /* Align text to the left */
`;

const UserActions = styled.div`
    display: flex;
    gap: 10px;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #555;
    font-size: 18px;

    &:hover {
        color: #007bff;
    }

    &.delete {
        color: #e74c3c;

        &:hover {
            color: #c0392b;
        }
    }
`;

const FilterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const FilterSelect = styled.select`
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [userType, setUserType] = useState('all'); // Default to all users
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/users/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('API Response:', response.data);
            const allUsers = response.data.results;

            const filteredUsers =
                userType === 'all'
                    ? allUsers
                    : allUsers.filter((user) => user.user_type === userType);

            setUsers(filteredUsers);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        const token = localStorage.getItem('accessToken');
        try {
            const userToDelete = users.find((user) => user.id === userId);
            const endpoint =
                userToDelete.user_type === 'Resident'
                    ? 'residents'
                    : 'owners'; // Use the specific type endpoint

            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/${endpoint}/${userId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
        }
    };

    const handleSaveUser = async (userData) => {
        const token = localStorage.getItem('accessToken');
        try {
            const endpoint =
                userData.user_type === 'Resident'
                    ? 'residents'
                    : 'owners'; // Use the specific type endpoint

            if (userData.id) {
                // Update existing user
                const response = await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/${endpoint}/${userData.id}/`,
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === response.data.id ? response.data : user
                    )
                );
            } else {
                // Add new user
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/${endpoint}/`,
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers((prev) => [...prev, response.data]);
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
        }
    };

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

    useEffect(() => {
        fetchUsers();
    }, [userType]);

    return (
        <Container>
            <Header>
                <Title>Gerenciamento de Usuários</Title>
                {/* <AddButton onClick={handleAddUser}>
                    <FaPlus /> Adicionar Usuário
                </AddButton> */}
            </Header>

            <FilterContainer>
                <FilterSelect
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                >
                    <option value="all">Todos</option>
                    <option value="Resident">Residente</option>
                    <option value="Owner">Proprietário</option>
                </FilterSelect>
            </FilterContainer>

            <UserList>
                {users.map((user) => (
                    <UserItem key={user.id}>
                        <UserDetails>
                            <UserDetail>
                                <strong>{user.name}</strong>
                            </UserDetail>
                            <UserDetail>
                                <span>{user.email}</span>
                            </UserDetail>
                            <UserDetail>
                                <span style={{ fontStyle: 'italic', color: '#555' }}>
                                    {translateUserType(user.user_type)}
                                </span>
                            </UserDetail>
                        </UserDetails>
                        <UserActions>
                            <IconButton onClick={() => handleEditUser(user)}>
                                <FaEdit />
                            </IconButton>
                            <IconButton
                                className="delete"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                <FaTrash />
                            </IconButton>
                        </UserActions>
                    </UserItem>
                ))}
            </UserList>

            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    user={selectedUser}
                    onSave={handleSaveUser}
                />
            )}
        </Container>
    );
};

export default UserManagement;
