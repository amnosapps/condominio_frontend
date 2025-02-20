import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaBuilding, FaEnvelope, FaExclamationTriangle, FaPhone, FaUserPlus } from "react-icons/fa";
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
  border: 3px solid ${({ role }) => {
    switch (role) {
      case "Síndico/Admin":
        return "#ff5733"; // Orange-red for admins
      case "Colaborador":
        return "#33a1ff"; // Blue for workers
      case "Residente":
        return "#28a745"; // Green for residents
      case "Proprietário":
        return "#ffc107"; // Yellow for owners
      case "Gestor":
        return "#6f42c1"; // Purple for managers
      default:
        return "#ccc"; // Default gray
    }
  }};
`;

const UserName = styled.h4`
  font-size: 18px;
  color: #333;
  margin-top: 10px;
  text-align: center;
`;

const UserRole = styled.p`
margin-top: -20px;
  font-size: 14px;
  font-weight: 700;
  color: #555;
`;

const ContactInfo = styled.div`
  font-size: 14px;
  color: #666;

  p {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 5px 0;
  }
`;

const ApartmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const ApartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 4 items per row */
  gap: 8px;
  width: 100%;
  max-width: 220px; /* Prevents excessive width */
`;

const ApartmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #444;
  background: #f1f1f1;
  padding: 6px 10px;
  border-radius: 5px;
  text-align: center;
  white-space: nowrap;
`;

const MoreText = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: #777;
  margin-top: 5px;
  text-align: center;
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  background: #fff3cd;
  color: #856404;
  padding: 6px;
  font-size: 12px;
  border-radius: 5px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
`;

const NoUsersMessage = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #777;
  text-align: center;
`;

// Role Mapping to Portuguese
const roleTranslations = {
  admin: "Síndico/Admin",
  worker: "Colaborador",
  resident: "Residente",
  owner: "Proprietário",
  manager: "Gestor",
};

const roleColors = {
  admin: "#ff5733", // Red-Orange for Admins
  worker: "#33a1ff", // Blue for Workers
  resident: "#28a745", // Green for Residents
  owner: "#ffc107", // Yellow for Owners
  manager: "#6f42c1", // Purple for Managers
};

// Main Component
const UsersPage = ({ profile, condominium }) => {
  const params = useParams();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("all");
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableApartments, setAvailableApartments] = useState([]);

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

  const toggleCreationModal = () => setIsCreationModalOpen((prev) => !prev);
  const toggleEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  useEffect(() => {
    fetchUsers();
  }, [userType]);

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/apartments/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { condominium: condominium.name },
          }
        );
        setAvailableApartments(response.data);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    fetchApartments();
  }, []);

  return (
    <Container>
      {/* Filters */}
      <FiltersRow>
        <SearchInput
          placeholder="Buscar Usuário"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="all">Todos</option>
          <option value="admin">Síndico/Admin</option>
          <option value="worker">Colaborador</option>
          <option value="resident">Residente</option>
          <option value="owner">Proprietário</option>
          <option value="manager">Gestor</option>
        </Select>
        <CreateButton onClick={() => setIsCreationModalOpen(true)}>
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
              >
                <ProfileImage
                  src={user.image_base64 || "https://placehold.co/100x100.png"}
                  alt="Profile"
                  role={roleTranslations[user.user_type] || "Sem cargo"}
                />
                <UserName>{user.name}</UserName>
                <UserRole role={user.user_type}>{roleTranslations[user.user_type] || "Sem cargo"}</UserRole>
                <ContactInfo>
                  {user.phone && (
                    <p>
                      <FaPhone /> {user.phone}
                    </p>
                  )}
                  {user.email && (
                    <p>
                      <FaEnvelope /> {user.email}
                    </p>
                  )}
                </ContactInfo>
                <ApartmentInfo>
                  {user.apartments?.length > 0 && (
                    <>
                      <ApartmentGrid>
                        {user.apartments.slice(0, 8).map((apt) => (
                          <ApartmentItem key={apt.id}>
                            <FaBuilding color="#6c757d" /> {apt.number}
                          </ApartmentItem>
                        ))}
                      </ApartmentGrid>
                      {user.apartments.length > 8 && <MoreText>+{user.apartments.length - 8} mais</MoreText>}
                    </>
                  )}
                </ApartmentInfo>


                {(!user.user_device || !user.image_base64) && (
                  <WarningMessage>
                    <FaExclamationTriangle color="#856404" style={{ marginRight: "5px" }} /> Usuário sem facial cadastrada
                  </WarningMessage>
                )}
              </UserCard>
            ))}
        </CardContainer>
      ) : (
        <NoUsersMessage>Nenhum usuário encontrado.</NoUsersMessage>
      )}

      {isCreationModalOpen && (
        <UserCreationModal 
          onClose={toggleCreationModal} 
          fetchUsers={fetchUsers} 
          condominium={condominium} 
          availableApartments={availableApartments} 
        />
      )}

      {isEditModalOpen && (
        <UserEditModal 
          user={selectedUser} 
          onClose={toggleEditModal} 
          fetchUsers={fetchUsers} 
          condominium={condominium} 
          availableApartments={availableApartments} 
        />
      )}
    </Container>
  );
};

export default UsersPage;
