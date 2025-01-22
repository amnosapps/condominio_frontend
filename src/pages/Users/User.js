import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import UserModal from '../../components/Users/UserModal';

// Styled Components
const PageContainer = styled.div`
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
`;

const AddUserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 2.5rem;
    color: #333;
  }

  span {
    margin-top: 10px;
    font-size: 0.9rem;
    color: #6c757d;
  }
`;

const UserTableContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f7fa;
  border: 1px solid #e9ecef;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #e9ecef;
  }
`;

const FilterSelect = styled.select`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  color: #495057;
  cursor: pointer;

  &:focus {
    border-color: #80bdff;
    outline: none;
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 16px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #f8f9fa;
    color: #495057;
    font-size: 14px;
    border-bottom: 1px solid #dee2e6;
    text-transform: uppercase;
  }

  td {
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
    color: #555;
  }

  tr:hover td {
    background-color: #f1f3f5;
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  background-color: ${(props) => (props.color ? props.color : '#F46600')};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    border: none;
    background: none;
    cursor: pointer;
    color: #495057;
    font-size: 16px;

    &:hover {
      color: #007bff;
    }

    &.delete {
      color: #e74c3c;

      &:hover {
        color: #c0392b;
      }
    }
  }
`;

const UserRow = styled.tr`
  td:first-child {
    display: flex;
    align-items: center;
  }
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

      const allUsers = response.data.results;
      const filteredUsers =
        userType === 'all'
          ? allUsers
          : allUsers.filter((user) => user.user_type === userType);

      setUsers(filteredUsers);
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
      const userToDelete = users.find((user) => user.id === userId);
      const endpoint =
        userToDelete.user_type === 'Resident' ? 'residents' : 'owners';

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/${endpoint}/${userId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  return (
    <PageContainer>
      <HeaderContainer>
        <HeaderTitle>Gerenciamento de Usuários</HeaderTitle>
        <AddUserButton onClick={handleAddUser}>
          <FaPlus /> Adicionar Usuário
        </AddUserButton>
      </HeaderContainer>

      <StatsContainer>
        <StatCard>
          <h2>{users.length}</h2>
          <span>Usuários Totais</span>
        </StatCard>
        <StatCard>
          <h2>
            {users.filter((user) => user.user_type === 'Resident').length}
          </h2>
          <span>Residentes</span>
        </StatCard>
        <StatCard>
          <h2>{users.filter((user) => user.user_type === 'Owner').length}</h2>
          <span>Proprietários</span>
        </StatCard>
      </StatsContainer>

      <UserTableContainer>
        <TableHeader>
          <FilterContainer>
            <FilterSelect
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Resident">Residente</option>
              <option value="Owner">Proprietário</option>
            </FilterSelect>
            <FilterButton>
              <FaFilter /> Filtrar
            </FilterButton>
          </FilterContainer>
        </TableHeader>

        <UserTable>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id}>
                <td>
                  <Avatar>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </Avatar>
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td>
                  <ActionButtons>
                    <button onClick={() => handleEditUser(user)}>
                      <FaEdit />
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FaTrash />
                    </button>
                  </ActionButtons>
                </td>
              </UserRow>
            ))}
          </tbody>
        </UserTable>
      </UserTableContainer>

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
        />
      )}
    </PageContainer>
  );
};

export default UserManagement;
