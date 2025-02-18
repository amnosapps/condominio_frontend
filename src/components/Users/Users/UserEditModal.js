import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaCamera, FaFileImage, FaTimes } from "react-icons/fa";

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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  button {
    background: none;
    border: none;
    font-size: 18px;
    color: #888;
    cursor: pointer;

    &:hover {
      color: #333;
    }
  }
`;

const Input = styled.input`
  width: 96%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const Tag = styled.div`
  background: #f46600;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
`;

const RemoveIcon = styled(FaTimes)`
  cursor: pointer;
  font-size: 12px;
  &:hover {
    color: #e05a00;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #09801d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background:#05440f;
  }
`;

const UserEditModal = ({ user, onClose, fetchUsers, condominium }) => {
  const [name, setName] = useState(user.name);
  const [document, setDocument] = useState(user.document || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "");
  const [userType, setUserType] = useState(user.role || "");
  const [image, setImage] = useState(user.image_base64 || null);
  const [apartment, setApartment] = useState(user.apartment || "");
  const [apartments, setApartments] = useState(user.apartments || []);
  const [availableApartments, setAvailableApartments] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch apartments for resident & visitor
  useEffect(() => {
    if (userType === "resident" || userType === "visitor") {
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
    }
  }, [userType, condominium]);

  const handleUpdateUser = async () => {
    const token = localStorage.getItem("accessToken");

    const updatedUser = ["admin", "worker", "owner", "manager"].includes(userType) ? {
      name,
      role,
      document,
      user_type: userType,
      phone,
      email,
      apartments,
      condominiums: [condominium.id],
      image_base64: image
    } : {
      name,
      role,
      condominium: condominium.id,
      document,
      user_type: userType,
      phone,
      email,
      apartment,
      image_base64: image
    };

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/condominium-users/${user.id}/`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Editar Usuário</h3>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>

        <Input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />

        <Input type="text" placeholder="Documento (CPF/RG)" value={document} onChange={(e) => setDocument(e.target.value)} />
        <Input type="text" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {(userType === "resident" || userType === "visitor") && (
          <Select value={apartment} onChange={(e) => setApartment(e.target.value)}>
            <option value="" disabled>Selecione a Unidade</option>
            {availableApartments.map((apt) => (
              <option key={apt.id} value={apt.id}>Unidade {apt.number}</option>
            ))}
          </Select>
        )}

        {(userType === "owner" || userType === "manager") && (
          <>
            <Select value="" onChange={(e) => setApartments([...apartments, e.target.value])}>
              <option value="" disabled>Adicionar Unidade</option>
              {availableApartments.filter((apt) => !apartments.includes(apt.id)).map((apt) => (
                <option key={apt.id} value={apt.number}>Unidade {apt.number}</option>
              ))}
            </Select>
            <TagContainer>
              {apartments.map((apt) => (
                <Tag key={apt}>
                  Unidade {apt} <RemoveIcon onClick={() => setApartments(apartments.filter(a => a !== apt))} />
                </Tag>
              ))}
            </TagContainer>
          </>
        )}

        {(userType === "user" || userType === "worker") && (
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled>Selecione a Função</option>
            <option value="receptionist">Recepcionista</option>
            <option value="worker">Funcionário</option>
          </Select>
        )}

        <Button onClick={handleUpdateUser}>Atualizar Usuário</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserEditModal;
