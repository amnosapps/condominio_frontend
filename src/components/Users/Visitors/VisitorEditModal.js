import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaCamera } from "react-icons/fa";
import axios from "axios";

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
  right: 15px;
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

const InputContainer = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
`;

const Input = styled.input`
  width: 96%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &[disabled] {
    background-color: #f9f9f9;
    color: #777;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  background: #f46600;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #e05a00;
  }

  &.red {
    background: #d32f2f;

    &:hover {
      background: #b71c1c;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
`;

const VisitorEditModal = ({ visitor, onClose, fetchVisitors, selectedCondominium }) => {
  const [name, setName] = useState(visitor.name || "");
  const [visitDate, setVisitDate] = useState(visitor.entry || "");
  const [unit, setUnit] = useState(visitor.apartment || "");
  const [document, setDocument] = useState(visitor.document || "");
  const [phone, setPhone] = useState(visitor.phone || "");
  const [image, setImage] = useState(visitor.image_base64 || "");
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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("accessToken");

    const updatedVisitor = {
      name,
      apartment: unit,
      document,
      phone,
      entry: visitDate,
      image_base64: image,
    };

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        updatedVisitor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Visitor updated successfully:", response.data);
      fetchVisitors();
      onClose();
    } catch (error) {
      console.error("Error updating visitor:", error.response?.data || error);
      alert("Failed to update visitor. Please try again.");
    }
  };

  const handleRegisterExit = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        { exit: new Date().toISOString() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Exit registered successfully:", response.data);
      fetchVisitors();
      onClose();
    } catch (error) {
      console.error("Error registering exit:", error.response?.data || error);
      alert("Failed to register exit. Please try again.");
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Editar Visitante</h3>
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
        <InputContainer>
          <Label>Nome do Visitante</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </InputContainer>
        <InputContainer>
          <Label>Data de Entrada</Label>
          <Input
            type="text"
            value={new Date(visitDate).toLocaleString('pt-BR')}
            disabled
          />
        </InputContainer>
        <InputContainer>
          <Label>Unidade</Label>
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
        </InputContainer>
        <InputContainer>
          <Label>Documento (CPF/RG)</Label>
          <Input
            type="text"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
          />
        </InputContainer>
        <InputContainer>
          <Label>Telefone</Label>
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </InputContainer>
        <ButtonRow>
          <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
          <Button className="red" onClick={handleRegisterExit}>
            Registrar Saída
          </Button>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VisitorEditModal;
