import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { FaCamera, FaFileImage } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  max-height: 80vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Ensures content is aligned */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
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

const InputContainer = styled.div`
  margin-bottom: 15px;

  .custom-datepicker {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
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

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: auto; /* Pushes the button to the bottom */
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #09801d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  margin-bottom: 10px; /* Prevents overlapping */

  &:hover {
    background:#05440f;
  }
`;

const CaptureButton = styled(Button)`
  background: #f46600;
  margin-top: 1px;
  margin-bottom: 20px;

  &:hover {
    background: #e05a00;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 3px solid #e05a00;
  border-top: 3px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: ${spin} 1s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VisitorCreationModal = ({ onClose, fetchVisitors, condominium , apartments }) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [exit, setExit] = useState("");
  const [observations, setObservations] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [role, setRole] = useState(1); 
  const [isUploading, setIsUploading] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
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
    const compressedImageBase64 = canvas.toDataURL("image/jpeg", 0.8); // 80% quality
  
    // Validate file size before setting state
    fetch(compressedImageBase64)
      .then((res) => res.blob())
      .then((blob) => {
        console.log(`Final Image Size: ${(blob.size / 1024).toFixed(2)} KB`);
        if (blob.size > 100 * 1024) { // 100KB limit
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

  const handleCreateVisitor = async () => {
    setIsUploading(true);
    const token = localStorage.getItem("accessToken");

    // Get timezone offset in minutes and convert to hours/minutes format
    const now = new Date();
    const offsetMinutes = now.getTimezoneOffset(); // Returns offset in minutes (e.g., 180 for UTC-3)
    const offsetHours = String(Math.abs(Math.floor(offsetMinutes / 60))).padStart(2, '0');
    const offsetMins = String(Math.abs(offsetMinutes % 60)).padStart(2, '0');
    const sign = offsetMinutes > 0 ? '-' : '+'; // Reverse sign because getTimezoneOffset() gives minutes to subtract from UTC

    const localISOTime = now.getFullYear() +
        '-' + String(now.getMonth() + 1).padStart(2, '0') +
        '-' + String(now.getDate()).padStart(2, '0') +
        'T' + String(now.getHours()).padStart(2, '0') +
        ':' + String(now.getMinutes()).padStart(2, '0') +
        ':' + String(now.getSeconds()).padStart(2, '0') +
        '.' + String(now.getMilliseconds()).padStart(3, '0') +
        `${sign}${offsetHours}:${offsetMins}`;

    console.log(condominium)
    const newVisitor = {
      name,
      condominium: condominium.name,
      apartment: unit,
      observations,
      document,
      phone,
      role,
      entry: localISOTime, // Set entry as the current date/time
      entry_at: localISOTime, // Set entry as the current date/time
      exit: exit,
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
      setIsUploading(false);
    } catch (error) {
      console.error("Error creating visitor:", error.response?.data || error);
      alert("Falha ao criar visitante.");
      setIsUploading(false)
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
          <UploadContainer>
            <UploadIcon onClick={triggerFileInput}>
              <FaFileImage />
              <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
            </UploadIcon>
            <UploadIcon onClick={startCamera}>
              <FaCamera />
            </UploadIcon>
          </UploadContainer>
        </ProfileImageContainer>
        {showCamera && <Video ref={videoRef} autoPlay show />}
        {showCamera && <CaptureButton onClick={captureImage}>Capturar Foto</CaptureButton>}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="" disabled>
            Selecione a Unidade
          </option>
          {apartments?.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              Unidade {apartment.number}
            </option>
          ))}
        </Select>

        <Select value={role} onChange={(e) => setRole(Number(e.target.value))}>
          <option value={0}>Prestador de Serviço</option>
          <option value={1}>Visita</option>
        </Select>

        <Input
          type="text"
          placeholder="Nome do Visitante"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <InputContainer>
          <Label>Previsão de Saída</Label>
          <DatePicker
            selected={exit ? new Date(exit) : null}
            onChange={(date) => setExit(date.toISOString())} // Store full date-time in ISO format
            dateFormat="dd/MM/yyyy HH:mm" // Display in Brazilian format with time
            showTimeSelect // Enables time selection
            timeFormat="HH:mm" // 24-hour format
            timeIntervals={30} // Allows selection in 30-minute intervals
            timeCaption="Hora"
            placeholderText="Selecione data e hora"
            className="custom-datepicker"
          />
        </InputContainer>

        <InputContainer>
          <Label>Observações</Label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows="3"
            style={{
              width: "95%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        </InputContainer>
        <ButtonContainer>
          {isUploading ? <LoadingSpinner /> : <Button onClick={handleCreateVisitor}>Registrar Entrada</Button>}
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VisitorCreationModal;
