import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaBuilding, FaCamera, FaFileImage, FaTimes } from "react-icons/fa";

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

const ProfileImageContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f46600;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #e05a00;
  }

  input {
    display: none;
  }
`;

const Video = styled.video`
  display: ${({ show }) => (show ? "block" : "none")};
  width: 100%;
  max-height: 300px;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const CaptureButton = styled(Button)`
  background: #f46600;
  margin-top: 1px;
  margin-bottom: 20px;

  &:hover {
    background: #e05a00;
  }
`;


const UserEditModal = ({ user, onClose, fetchUsers, condominium, availableApartments }) => {
  const [name, setName] = useState(user.name);
  const [document, setDocument] = useState(user.document || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || null);
  const [userType, setUserType] = useState(user.user_type || "");
  const [image, setImage] = useState(user.image_base64 || null);
  const [apartment, setApartment] = useState(user.apartments?.length ? user.apartments[0].id : "");
  const [apartments, setApartments] = useState(user.apartments?.map(apt => apt.id) || []);

 
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const handleUpdateUser = async () => {
    const token = localStorage.getItem("accessToken");

    let updatedUser = {
      name,
      document,
      user_type: userType,
      phone,
      email,
      image_base64: image
    };

    if (["admin", "worker", "owner", "manager"].includes(userType)) {
        updatedUser = {
            ...updatedUser,
            apartments,
            condominiums: [condominium.id]
        };

        if (userType === "worker") {
            updatedUser.role = role;
        }
    } else {
        updatedUser = {
            ...updatedUser,
            entry: new Date().toISOString(),
            condominium: condominium.id,
            apartment
        };
    }

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

  const handleDeactivateUser = async () => {
    const token = localStorage.getItem("accessToken");
  
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/condominium-users/${user.id}/`,
        { active: false, user_type: userType, },
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
      console.error("Error deactivating user:", error);
      alert("Falha ao desativar usuário. Tente novamente.");
    }
  };

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          streamRef.current = stream;
      }
      setShowCamera(true)
      } catch (error) {
        console.error("Error accessing camera:", error);
      alert("Erro ao acessar a câmera.");
      }
  };

  const captureImage = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set fixed size to 500x500
      const TARGET_WIDTH = 500;
      const TARGET_HEIGHT = 500;
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Get the original video feed dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      // Determine scaling for best fit (crop if necessary)
      const scale = Math.max(TARGET_WIDTH / videoWidth, TARGET_HEIGHT / videoHeight);
      const scaledWidth = videoWidth * scale;
      const scaledHeight = videoHeight * scale;
      const offsetX = (scaledWidth - TARGET_WIDTH) / 2;
      const offsetY = (scaledHeight - TARGET_HEIGHT) / 2;

      // Draw the resized and cropped image onto the canvas
      context.drawImage(videoRef.current, -offsetX, -offsetY, scaledWidth, scaledHeight);

      // Convert to Base64 JPEG (compressed)
      const compressedImageBase64 = canvas.toDataURL("image/jpeg", 0.8);

      // Validate file size before setting state
      fetch(compressedImageBase64)
      .then((res) => res.blob())
      .then((blob) => {
          console.log(`Final Image Size: ${(blob.size / 1024).toFixed(2)} KB`);
          if (blob.size > 100 * 1024) {
          alert("O tamanho do arquivo não pode exceder 100KB.");
          return;
          }
          setImage(compressedImageBase64);
      })
      .catch((err) => console.error("Erro ao validar a imagem:", err));

      // Stop the camera stream
      setShowCamera(false);
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
  };

  const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
  };

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showCamera]);

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Editar Usuário</h3>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>

        <ProfileImageContainer>
          {image ? <ProfileImage src={image} alt="Profile" /> : <ProfileImage src="https://placehold.co/100x100.png" />}
        </ProfileImageContainer>
        <UploadContainer>
          <UploadIcon onClick={startCamera}><FaCamera /></UploadIcon>
          <UploadIcon onClick={() => fileInputRef.current.click()}><FaFileImage /></UploadIcon>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} hidden />
        </UploadContainer>
        {showCamera && (
          <>
            <Video ref={videoRef} autoPlay playsInline show={showCamera} />
            <CaptureButton onClick={captureImage}>Capturar Foto</CaptureButton>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <Input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />

        <Input type="text" placeholder="Documento (CPF/RG)" value={document} onChange={(e) => setDocument(e.target.value)} />
        <Input type="text" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {userType === "resident" && (
          <Select value={apartment} onChange={(e) => setApartment(e.target.value)}>
            <option value="" disabled>Selecione a Unidade</option>
            {availableApartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.number}
              </option>
            ))}
          </Select>
        )}

        {(userType === "owner" || userType === "manager") && (
          <>
            <Select value="" onChange={(e) => {
              const aptId = Number(e.target.value); // Ensure aptId is a number
              if (!apartments.includes(aptId)) {
                setApartments([...apartments, aptId]);
              }
            }}>
              <option value="" disabled>Adicionar Unidade</option>
              {availableApartments
                .filter((apt) => !apartments.includes(Number(apt.id))) // Ensure apt.id is compared as a number
                .map((apt) => (
                  <option key={apt.id} value={apt.id}>{apt.number}</option>
              ))}
            </Select>

            <TagContainer>
              {apartments.map((aptId) => {
                const apt = availableApartments.find(a => String(a.id) === String(aptId));
                console.log(aptId)
                return (
                  <Tag key={aptId}>
                    <FaBuilding color="#fff" /> {apt?.number}
                    <RemoveIcon onClick={() => setApartments(apartments.filter(a => a !== aptId))} />
                  </Tag>
                );
              })}
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
        <Button onClick={handleDeactivateUser} style={{ background: "#d9534f", marginTop: "5px" }}>
          Desativar Usuário
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserEditModal;
