import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams  } from "react-router-dom";
import styled from "styled-components";
import CryptoJS from "crypto-js";
import axios from "axios";
import Webcam from "react-webcam";
import { FaCamera, FaFileUpload, FaTrash } from "react-icons/fa";
import { formatCPF } from "../../utils/regex";

const API_URL = process.env.REACT_APP_API_URL;
const SECRET_KEY = process.env.REACT_APP_QRCODE_SECRET || "your-secret-key";

// Styled Components
const Container = styled.div`
width: 100%;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 50px;
  overflow-y: auto;
  height: 90vh; /* Enable scrolling for long content */
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    max-width: 350px;
    height: auto;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-top: -30px;
  font-size: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-top: 10px;
`;

const Input = styled.input`
  width: 95%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const FileInput = styled.input`
  margin-top: 5px;
`;

const IconButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  width: 40px;
  height: 40px;
  
  &:hover {
    background-color: #0056b3;
  }

  input {
    display: none; /* Hide the default file input */
  }
`;

const SmallButton = styled.button`
margin-top: 10px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  width: 40px;
  height: 40px;

  &:hover {
    background-color: #0056b3;
  }
`;

const TrashButton = styled(SmallButton)`
  background-color: #dc3545;
  &:hover {
    background-color: #b02a37;
  }
`;


const Button = styled.button`
  width: 100%;
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  margin-top: 15px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ImgPreview = styled.img`
  width: 100%;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 5px;
  object-fit: cover;
`;

const ImgLogo = styled.img`
  width: 150px;
  display: block;
  margin: auto;
  margin-top: -70px;
`;

const WebcamContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const WebcamCapture = styled(Webcam)`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 10px;
`;


const GuestForm = () => {
  const navigate = useNavigate();

  const decryptReservationId = (token) => {
    try {
      const bytes = CryptoJS.AES.decrypt(decodeURIComponent(token), SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8); // Convert back to string
    } catch (error) {
      console.error("Erro ao descriptografar token:", error);
      return null;
    }
  };

  const [searchParams] = useSearchParams();
  const encryptedToken = searchParams.get("token"); // ✅ Extract token from URL
  const reservationId = decryptReservationId(encryptedToken);
  const [reservation, setReservation] = useState(null);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_document: "",
    guest_phone: "",
    document_type: "",
    address: {
      endereco: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      pais: "",
    },
    guest_photo: "", // Store base64 image
    additional_guests: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRefs = useRef([]); // Multiple webcam references for additional guests
  const [isGuestCameraOpen, setIsGuestCameraOpen] = useState([]); // Control for each guest's camera

  const webcamRef = useRef(null);

  // Fetch reservation details when page loads
  useEffect(() => {
    if (!reservationId) {
      alert("Acesso inválido.");
      window.location.href = "/"; // Redirect to home if token is invalid
      return;
    }

    const fetchReservation = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/${reservationId}/guest-access/`);
        setReservation(response.data);
        setFormData({
          guest_name: response.data.guest_name || "",
          guest_document: response.data.guest_document || "",
          guest_phone: response.data.guest_phone || "",
          document_type: response.data.document_type || "",
          address: response.data.address || {
            endereco: "",
            bairro: "",
            cep: "",
            cidade: "",
            estado: "",
            pais: "",
          },
          additional_guests: Array.isArray(response.data.additional_guests) ? response.data.additional_guests : [], // ✅ Ensure array,
          guest_photo: response.data.guest_photo || "",
        });

        if (response.data.guest_photo) {
          setImagePreview(response.data.guest_photo);
        }
      } catch (error) {
        console.error("Error fetching reservation:", error);
      }
    };
    fetchReservation();
  }, [reservationId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          guest_photo: reader.result, // Store Base64 image
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prev) => ({
      ...prev,
      guest_photo: imageSrc,
    }));
    setImagePreview(imageSrc);
    setIsCameraOpen(false);
  };

  // Function to add a new guest safely
  const addAdditionalGuest = () => {
    if (formData.additional_guests.length >= (reservation.guest_qty)) {
      alert(`O limite máximo de hóspedes adicionais é ${reservation.guest_qty}.`);
      return;
    }
  
    setFormData((prev) => ({
      ...prev,
      additional_guests: [
        ...(Array.isArray(prev.additional_guests) ? prev.additional_guests : []),
        { name: "", document: "", document_type: "", age: 0, is_child: false, guest_photo: "" },
      ],
    }));
  };

  // Function to update guest details safely
  const updateGuestDetails = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additional_guests: [...(prev.additional_guests || [])].map((guest, i) =>
        i === index ? { ...guest, [field]: value } : guest
      ),
    }));
  };

  // Function to remove a guest safely
  const removeAdditionalGuest = (index) => {
    setFormData((prev) => ({
      ...prev,
      additional_guests: (Array.isArray(prev.additional_guests) ? prev.additional_guests : []).filter((_, i) => i !== index),
    }));
  };

  const handleGuestImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateGuestDetails(index, "guest_photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const captureGuestPhoto = (index) => {
    const imageSrc = webcamRefs.current[index]?.getScreenshot();
    if (imageSrc) {
      updateGuestDetails(index, "guest_photo", imageSrc);
      setIsGuestCameraOpen((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formDataPayload = new FormData();
  
      // Append text fields
      formDataPayload.append("guest_name", formData.guest_name);
      formDataPayload.append("guest_document", formData.guest_document);
      formDataPayload.append("guest_phone", formData.guest_phone);
      formDataPayload.append("document_type", formData.document_type);
  
      // Append address as JSON string
      formDataPayload.append("address", JSON.stringify(formData.address));
  
      // Append guest photo if available
      if (formData.guest_photo?.startsWith("data:image")) {
        const response = await fetch(formData.guest_photo);
        const blob = await response.blob();
        formDataPayload.append("guest_photo", blob, "guest_photo.jpg");
      }
  
      // ✅ Ensure additional_guests is always an array
      const guestsArray = await Promise.all(
        (formData.additional_guests || []).map(async (guest, index) => {
          // Validation checks
          if (!guest.name?.trim()) throw new Error(`Hóspede ${index + 1}: Nome é obrigatório.`);
          if (!guest.document?.trim()) throw new Error(`Hóspede ${index + 1}: Documento é obrigatório.`);
          if (!guest.document_type?.trim()) throw new Error(`Hóspede ${index + 1}: Tipo de documento é obrigatório.`);
          if (guest.is_child && (guest.age === null || guest.age === "" || guest.age < 0))
            throw new Error(`Hóspede ${index + 1}: Crianças devem ter idade especificada.`);
  
          const guestData = {
            name: guest.name.trim(),
            document: guest.document.trim(),
            document_type: guest.document_type.trim(),
            is_child: guest.is_child,
            age: guest.is_child ? guest.age : null, // Store age only if guest is a child
          };
  
          return guestData;
        })
      );
  
      // Append guests to FormData
      formDataPayload.append("additional_guests", JSON.stringify(guestsArray));
  
      // Send the formDataPayload to the API
      await axios.post(`${API_URL}/api/reservations/${reservationId}/guest-update/`, formDataPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("Dados enviados com sucesso!");
      navigate("/success");
    } catch (error) {
      console.error("Erro ao enviar os dados:", error);
      alert(error.message || "Erro ao enviar os dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  if (!reservation) {
    return <p>Carregando...</p>;
  }

  return (
    <Container>
      <ImgLogo src="/IMG_0659.PNG" alt="home" />
      <Title>PREENCHA SEU CADASTRO</Title>

      <form onSubmit={handleSubmit}>
        <Label>Nome</Label>
        <Input
          type="text"
          value={formData.guest_name}
          onChange={(e) => handleChange("guest_name", e.target.value)}
          required
        />

        <Label>Tipo de Documento</Label>
        <Select
          value={formData.document_type}
          onChange={(e) => handleChange("document_type", e.target.value)}
          required
        >
          <option value="">Selecione</option>
          <option value="cpf">CPF</option>
          <option value="rg">RG</option>
          <option value="passport">Passaporte</option>
        </Select>
        <Label>Documento</Label>
        <Input
          type="text"
          value={formData.guest_document}
          onChange={(e) => {
            const value = e.target.value;
            const formattedValue =
              formData.document_type === "cpf" ? formatCPF(value) : value;
            handleChange("guest_document", formattedValue);
          }}
          required
        />

        <Label>Contato</Label>
        <Input
          type="text"
          value={formData.guest_phone}
          onChange={(e) => handleChange("guest_phone", e.target.value)}
          required
        />

        <Label>Endereço</Label>
        <Input
          type="text"
          placeholder="Rua"
          value={formData.address.endereco}
          onChange={(e) => handleAddressChange("endereco", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Bairro"
          value={formData.address.bairro}
          onChange={(e) => handleAddressChange("bairro", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="CEP"
          value={formData.address.cep}
          onChange={(e) => handleAddressChange("cep", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Cidade"
          value={formData.address.cidade}
          onChange={(e) => handleAddressChange("cidade", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Estado"
          value={formData.address.estado}
          onChange={(e) => handleAddressChange("estado", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="País"
          value={formData.address.pais}
          onChange={(e) => handleAddressChange("pais", e.target.value)}
          required
        />

        <div style={{ display: "flex", alignItems: "center"}}>
          <SmallButton>
            <FaFileUpload />
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </SmallButton>
          <SmallButton type="button" onClick={() => setIsCameraOpen(!isCameraOpen)}>
            <FaCamera />
          </SmallButton>
        </div>
        
        {imagePreview && <ImgPreview src={imagePreview} alt="Preview" />}
        
        <WebcamContainer>
          
          {isCameraOpen && (
            <>
              <WebcamCapture ref={webcamRef} screenshotFormat="image/jpeg" />
              <Button type="button" onClick={capturePhoto}>
                Capturar Foto
              </Button>
            </>
          )}
        </WebcamContainer>

        {/* Additional Guests Section */}
        <div style={{ marginTop: '15px' }}>
          <Label>Hóspedes Adicionais</Label>

          {formData.additional_guests?.map((guest, index) => (
            <div key={index} style={{ marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Label>Hóspede {index + 1}</Label>
                <TrashButton type="button" onClick={() => removeAdditionalGuest(index)}>
                  <FaTrash />
                </TrashButton>
              </div>
              <Label>Nome</Label>
              <Input
                type="text"
                placeholder="Nome"
                value={guest.name}
                onChange={(e) => updateGuestDetails(index, "name", e.target.value)}
              />

              <Label>Tipo de Documento</Label>
              <Select
                value={guest.document_type}
                onChange={(e) => updateGuestDetails(index, "document_type", e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="passport">Passaporte</option>
              </Select>

              <Label>Documento</Label>
              <Input
                type="text"
                placeholder="Número do Documento"
                value={guest.document}
                onChange={(e) => updateGuestDetails(index, "document", e.target.value)}
              />

              <div style={{ display: "flex", alignItems: "center"}}>
                <SmallButton>
                  <FaFileUpload />
                  <input type="file" accept="image/*" hidden onChange={(e) => handleGuestImageUpload(e, index)} />
                </SmallButton>
                {guest.guest_photo && <ImgPreview src={guest.guest_photo} alt={`Guest ${index + 1}`} />}

                <SmallButton type="button" onClick={() => setIsGuestCameraOpen((prev) => {
                    const newState = [...prev];
                    newState[index] = !newState[index];
                    return newState;
                  })}
                >
                  <FaCamera />
                </SmallButton>
              </div>

              {isGuestCameraOpen[index] && (
                <>
                  <WebcamCapture ref={(el) => (webcamRefs.current[index] = el)} screenshotFormat="image/jpeg" />
                  <Button type="button" onClick={() => captureGuestPhoto(index)}>
                    Capturar Foto
                  </Button>
                </>
              )}

              
            </div>
          ))}
          <Button type="button" onClick={addAdditionalGuest} style={{ backgroundColor: "#28a745" }}>
              + Adicionar Hóspede
            </Button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Dados"}
        </Button>
      </form>
    </Container>
  );
};

export default GuestForm;
