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
    flex-direction: column;
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

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [userType, setUserType] = useState('residents'); // Default to residents
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/${userType}/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
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
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/${userType}/${userId}/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSaveUser = async (userData) => {
        const token = localStorage.getItem('accessToken');
        try {
            if (userData.id) {
                const response = await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/${userType}/${userData.id}/`,
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === response.data.id ? response.data : user
                    )
                );
            } else {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/${userType}/`,
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers((prev) => [...prev, response.data]);
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userType]);

    return (
        <Container>
            <Header>
                <Title>
                    {userType === 'residents' ? 'Residents' : 'Owners'} Management
                </Title>
                <AddButton onClick={handleAddUser}>
                    <FaPlus /> Add {userType === 'residents' ? 'Resident' : 'Owner'}
                </AddButton>
            </Header>

            <UserList>
                {users.map((user) => (
                    <UserItem key={user.id}>
                        <UserDetails>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
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

            <div>
                <button onClick={() => setUserType('residents')}>Residents</button>
                <button onClick={() => setUserType('owners')}>Owners</button>
            </div>
        </Container>
    );
};

export default UserManagement;
