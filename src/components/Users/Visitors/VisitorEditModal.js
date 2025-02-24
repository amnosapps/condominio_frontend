import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaCamera, FaCheck, FaFileImage } from "react-icons/fa";
import axios from "axios";
import DatePicker from "react-datepicker";

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
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 90vh;
  overflow-y: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
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

const ProfileImageWrapper = styled.div`
  position: relative;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
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

const CaptureButton = styled(Button)`
  background: #f46600;
  margin-top: 1px;
  margin-bottom: 20px;

  &:hover {
    background: #e05a00;
  }
`;

const SaveImageButton = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #008000;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #006400;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
`;

const VisitorEditModal = ({ visitor, onClose, fetchVisitors, condominium }) => {
  const [name, setName] = useState(visitor.name || "");
  const [visitDate, setVisitDate] = useState(visitor.entry || "");
  const [expectedExit, setExpectedExit] = useState(visitor.exit ? new Date(visitor.exit) : null);
  const [exitDate, setExitDate] = useState(visitor.exit_at || null);
  const [observations, setObservations] = useState(visitor.observations || "");
  const [unit, setUnit] = useState(visitor.apartment || "");
  const [document, setDocument] = useState(visitor.document || "");
  const [phone, setPhone] = useState(visitor.phone || "");
  const [image, setImage] = useState(visitor.image_base64 || "");
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
        setApartments(response.data);
      } catch (error) {
        console.error("Error fetching apartments:", error.response?.data || error);
      }
    };

    fetchApartments();
  }, [condominium]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      setIsImageUpdated(true);
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
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL("image/png");
    setImage(imageData);
    setIsImageUpdated(true);

    // Stop the camera stream and close camera view
    setShowCamera(false);
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRegisterExit = async () => {
    const token = localStorage.getItem("accessToken");
    const now = new Date().toISOString();
    setExitDate(now);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        { exit_at: now, condominium: condominium.name },
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

  const handleUpdateImage = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        { image_base64: image, condominium: condominium.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsImageUpdated(false);
      fetchVisitors();
      alert("Imagem atualizada com sucesso!");
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Erro ao atualizar a imagem. Tente novamente.");
    }
  };

  const handleUpdateExpectedExit = async () => {
    if (!expectedExit) {
      alert("Selecione uma data válida para a previsão de saída.");
      return;
    }
  
    const token = localStorage.getItem("accessToken");
  
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        { exit: expectedExit.toISOString(), condominium: condominium.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      fetchVisitors(); // Refresh the visitors list
      alert("Previsão de saída atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar a previsão de saída:", error);
      alert("Erro ao atualizar a previsão de saída. Tente novamente.");
    }
  };

  const handleUpdateObservations = async () => {
    const token = localStorage.getItem("accessToken");
  
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/visitors/${visitor.id}/`,
        { observations, condominium: condominium.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      fetchVisitors(); // Refresh the visitors list
      alert("Observações atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar observações:", error);
      alert("Erro ao atualizar as observações. Tente novamente.");
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
            <ProfileImageWrapper>
              <ProfileImage src={image} alt="Profile" />
              {isImageUpdated && (
                <SaveImageButton onClick={handleUpdateImage}>
                  <FaCheck />
                </SaveImageButton>
              )}
            </ProfileImageWrapper>
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
        
        <InputContainer>
          <Label>Nome do Visitante</Label>
          <Input disabled={true} type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </InputContainer>
        <div style={{ display: "flex"}}>
          <InputContainer>
            <Label>Data de Entrada</Label>
            <Input disabled={true} type="text" value={new Date(visitDate).toLocaleString('pt-BR')} />
          </InputContainer>
          
          {exitDate ? (
            <InputContainer>
              <Label>Data de Saída</Label>
              <Input disabled={true} type="text" value={new Date(exitDate).toLocaleString('pt-BR')} />
            </InputContainer>
          ):(
            <InputContainer>
              <Label>Previsão de Saída</Label>
              <DatePicker
                selected={expectedExit}
                onChange={(date) => setExpectedExit(date)}
                dateFormat="dd/MM/yyyy HH:mm"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="Hora"
                placeholderText="Selecione a data e hora"
                className="custom-datepicker"
              />
            </InputContainer>
          )}
        </div>
        
        <InputContainer>
          <Label>Documento (CPF/RG)</Label>
          <Input disabled={true} type="text" value={document} onChange={(e) => setDocument(e.target.value)} />
        </InputContainer>
        <InputContainer>
          <Label>Telefone</Label>
          <Input disabled={true} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </InputContainer>
        <InputContainer>
          <Label>Observações</Label>
          <textarea
            disabled
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows="3"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        </InputContainer>
        <ButtonRow>
          {!exitDate && (
            <Button className="red" onClick={handleRegisterExit}>
              Registrar Saída
            </Button>
          )}
          <Button onClick={handleUpdateExpectedExit}>Salvar Previsão de Saída</Button>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VisitorEditModal;
