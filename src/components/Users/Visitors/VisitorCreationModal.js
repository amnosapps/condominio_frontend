import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaCamera } from "react-icons/fa";

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

const ProfileImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f46600;
`;

const UploadIcon = styled.div`
  position: absolute;
  bottom: -10px;
  right: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f46600;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #e05a00;
  }

  input {
    display: none;
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

const VisitorCreationModal = ({ onClose, fetchVisitors, selectedCondominium }) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [apartments, setApartments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/apartments/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { condominium: selectedCondominium },
          }
        );
        setApartments(response.data);
      } catch (error) {
        console.error("Error fetching apartments:", error.response?.data || error);
      }
    };

    fetchApartments();
  }, [selectedCondominium]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCreateVisitor = async () => {
    const token = localStorage.getItem("accessToken");

    const newVisitor = {
      name,
      condominium: selectedCondominium,
      apartment: unit,
      document,
      phone,
      entry: new Date().toISOString(), // Set entry as the current date/time
      image_base64: image,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/visitors/`,
        newVisitor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Visitor created:", response.data);
      fetchVisitors();
      onClose();
    } catch (error) {
      console.error("Error creating visitor:", error.response?.data || error);
      alert("Failed to create visitor. Please check the details and try again.");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Criar Visitante</h3>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        <ProfileImageContainer>
          {image ? (
            <ProfileImage src={image} alt="Profile" />
          ) : (
            <ProfileImage
              src="https://placehold.co/100x100.png"
              alt="Escolha uma imagem"
            />
          )}
          <UploadIcon onClick={triggerFileInput}>
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
          </UploadIcon>
        </ProfileImageContainer>
        <Input
          type="text"
          placeholder="Nome do Visitante"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="" disabled>
            Selecione a Unidade
          </option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              Unidade {apartment.number}
            </option>
          ))}
        </Select>
        <Input
          type="text"
          placeholder="Documento (CPF/RG)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button onClick={handleCreateVisitor}>Registrar Entrada</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VisitorCreationModal;
