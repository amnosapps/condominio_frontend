import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import UserEditModal from "../../components/Users/Users/UserEditModal";
import UserCreationModal from "../../components/Users/Users/UserCreationModal";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 98%;
  background: #f9f9f9;
  font-family: "Roboto", sans-serif;
  padding: 20px;
`;

const CreateButton = styled.button`
  background: #f46600;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: rgb(255, 135, 50);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
`;

const UserCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 220px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
  filter: ${({ disabled }) => (disabled ? "grayscale(100%)" : "none")};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f46600;
`;

const UserName = styled.h4`
  font-size: 16px;
  color: #333;
  margin-top: 10px;
  text-align: center;
`;

const UserRole = styled.p`
  font-size: 14px;
  color: #555;
`;

const NoUsersMessage = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #777;
  text-align: center;
`;

// Main Component
const UsersPage = ({ profile, condominium }) => {
  const params = useParams();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("all");
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/condominium-users/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { condominium: condominium.name, user_type: userType },
        }
      );
  
      let fetchedUsers = [];
      if (userType === "all") {
        Object.values(response.data).forEach((userList) => {
          fetchedUsers = [...fetchedUsers, ...userList];
        });
      } else {
        fetchedUsers = response.data;
      }
  
      // Sort users: Those with user_device come first
      fetchedUsers.sort((a, b) => (b.user_device ? 1 : 0) - (a.user_device ? 1 : 0));
  
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const toggleCreationModal = () => setIsCreationModalOpen(!isCreationModalOpen);
  const toggleEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  return (
    <Container>
      {/* Filters */}
      <FiltersRow>
        <SearchInput
          placeholder="Buscar Usuário"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="all">Todos</option>
          <option value="admin">Admin</option>
          <option value="user">Usuário</option>
          <option value="worker">Funcionário</option>
          <option value="resident">Residente</option>
          <option value="owner">Proprietário</option>
          <option value="manager">Gerente</option>
          <option value="visitor">Visitante</option>
        </Select>
        <CreateButton onClick={toggleCreationModal}>
          <FaUserPlus /> Adicionar Usuário
        </CreateButton>
      </FiltersRow>

      {/* Users List */}
      {users.length > 0 ? (
        <CardContainer>
          {users
            .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((user) => (
              <UserCard 
                key={user.id} 
                onClick={() => handleUserClick(user)}
                disabled={!user.user_device}
              >
                <ProfileImage
                  src={user.image_base64 || "https://placehold.co/100x100.png"}
                  alt="Profile"
                />
                <UserName>{user.name}</UserName>
                <UserRole>{user.role || "Sem cargo"}</UserRole>
              </UserCard>
            ))}
        </CardContainer>
      ) : (
        <NoUsersMessage>Nenhum usuário encontrado.</NoUsersMessage>
      )}

      {isCreationModalOpen && <UserCreationModal onClose={toggleCreationModal} fetchUsers={fetchUsers} condominium={condominium} />}
      {isEditModalOpen && <UserEditModal user={selectedUser} onClose={toggleEditModal} fetchUsers={fetchUsers} condominium={condominium} />}
    </Container>
  );
};

export default UsersPage;
