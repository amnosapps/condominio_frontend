import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: start;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  margin-top: 100px;
  margin-left: 100px;
  background-color: white;
  width: 80%;
  max-width: 400px;
  max-height: 80vh; /* Constrain height to 80% of the viewport */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow-y: auto; /* Enable vertical scrolling */

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const StyledLink = styled.a`
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4682b4;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #35688a;
  }
`;

const GreenButton = styled.button`
  margin: 10px 5px;
  padding: 20px 30px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const RedButton = styled.button`
  margin: 10px 5px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const EditableInput = styled.input`
  width: 95%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const TitleInput = styled.input`
  width: 95%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const ImagePreview = styled.img`
  width: 100%;
  margin-top: 10px;
  border-radius: 5px;
`;

const VideoContainer = styled.div`
  margin-top: 10px;
`;

const VideoPreview = styled.video`
  width: 100%;
  border-radius: 5px;
`;

const StyledFileInput = styled.input`
  display: none; // Hide the default file input
`;

const FileInputLabel = styled.label`
  display: inline-block;
  cursor: pointer;
  width: 30px; // Set width for the "image"
  height: 30px; // Set height for the "image"
  background: url("photos.png") no-repeat center center;
  background-size: cover; // Ensure the background image covers the label
  border-radius: 10px; // Optional: make the image corners rounded
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05); // Slight zoom effect on hover
  }
`;

const ReservationModal = ({
  closeModal,
  selectedReservation,
  loadData
}) => {
  const [reservationData, setReservationData] = useState({
    guest_name: selectedReservation?.guest_name || "",
    guest_document: selectedReservation?.guest_document || "",
    guest_phone: selectedReservation?.guest_phone || "", // Handle null values
    guests_qty: selectedReservation?.guests_qty || "",
    apartment: selectedReservation?.apartment || "", // Optional apartment number
    apartment_owner: selectedReservation?.apartment_owner || "", // Optional apartment owner name
    hasChildren: selectedReservation?.hasChildren || "no",
    photos: selectedReservation?.photos || "", // Main photo URL
    additional_photos: selectedReservation?.additional_photos || [], // Additional photos array
    checkin: selectedReservation?.checkin || null, // Check-in timestamp
    checkout: selectedReservation?.checkout || null, // Checkout timestamp
    checkin_at: selectedReservation?.checkin_at || null, // Check-in timestamp
    checkout_at: selectedReservation?.checkout_at || null, // Checkout timestamp
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]); // Store multiple photos
  const videoRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "$1 $2-$3").trim();
    }
    handleChange("guest_phone", value);
  };

  const handleSaveCheckin = async () => {
    const confirmMessage = reservationData.checkin_at
      ? "Você tem certeza que deseja atualizar as informações?"
      : "Você tem certeza que deseja fazer o checkin?";
    if (!window.confirm(confirmMessage)) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    // Format `checkin_at` to ISO 8601
    const formattedCheckinAt = reservationData.checkin_at
      ? new Date(reservationData.checkin_at).toISOString()
      : new Date().toISOString();
  
    // Append reservation data to formData
    formData.append("guest_name", reservationData.guest_name);
    formData.append("guest_document", reservationData.guest_document);
    formData.append("guest_phone", reservationData.guest_phone || "");
    formData.append("guests_qty", reservationData.guests_qty);
    formData.append("has_children", reservationData.hasChildren === "yes");
    formData.append("checkin_at", formattedCheckinAt);
  
    // Append old photos as URLs (these won't be uploaded but retained as references)
    reservationData.additional_photos.forEach((photoUrl, index) => {
      formData.append(`existing_photos[${index}]`, photoUrl);
    });
  
    // Append new photos by converting Blob URLs to files
    for (const [index, photo] of capturedPhotos.entries()) {
      try {
        const response = await fetch(photo);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `additional_photo_${Date.now()}_${index + 1}.png`,
          { type: blob.type }
        );
        formData.append(`additional_photos[${index}]`, file); // Use indexed keys
      } catch (error) {
        console.error(`Erro ao processar a foto adicional ${index + 1}:`, error);
      }
    }
  
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      if (pair[0].startsWith("additional_photos")) {
        console.log(`${pair[0]}: ${pair[1].name}`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
  
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Informações salvas com sucesso!");
        loadData();
        closeModal();
        sessionStorage.setItem("reopenModalId", selectedReservation.id);
      } else {
        console.error("Unexpected response status:", response.status);
        alert("Falha ao salvar as informações. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a reserva:", error);
  
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(
          `Erro no servidor: ${error.response.status}. Mensagem: ${
            error.response.data.detail || "Erro desconhecido"
          }`
        );
      } else if (error.request) {
        console.error("Request data:", error.request);
        alert("Erro na comunicação com o servidor. Verifique sua conexão.");
      } else {
        console.error("Error message:", error.message);
        alert(`Erro inesperado: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckout = async () => {
    if (!window.confirm("Você tem certeza que deseja fazer o checkout?")) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    formData.append("checkout_at", new Date().toISOString());
    console.log("FormData:", formData);
  
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log("Response received:", response);
        if (response.status === 200) {
          alert("Checkout realizado com sucesso!");
          loadData()
          closeModal();
          sessionStorage.setItem("reopenModalId", selectedReservation.id);
        } else {
          console.error("Unexpected response status:", response.status);
          alert("Falha ao realizar o checkout. Tente novamente.");
        }
      })
      .catch((error) => {
        console.error("Erro completo:", error);
  
        // Handle server response errors
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          alert(
            `Erro no servidor: ${error.response.status}. Mensagem: ${error.response.data.detail || "Erro desconhecido"}`
          );
        } else if (error.request) {
          // Handle no response received
          console.error("Request data:", error.request);
          alert("Erro na comunicação com o servidor. Verifique sua conexão.");
        } else {
          // Handle other errors
          console.error("Error message:", error.message);
          alert(`Erro inesperado: ${error.message}`);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      console.error("Video reference is not available");
      return;
    }
  
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
  
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Unable to get 2D context for canvas");
      return;
    }
  
    context.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          return;
        }
  
        const photoUrl = URL.createObjectURL(blob);
        setCapturedPhotos((prev) => [...prev, photoUrl]);
      },
      "image/png",
      1.0
    );
  };

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing the camera:", error);
          setCameraActive(false);
        });
    }
  }, [cameraActive]);

  const handleImagePick = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setCapturedPhotos((prev) => [...prev, URL.createObjectURL(file)]);
    }
  };

  const handleCameraShot = () => {
    setCameraActive(true);
  };

  const closeModal1 = () => {
    setSelectedImage(null);
    setCapturedPhotos([]);
    setCameraActive(false);
    closeModal();
  };

  if (!selectedReservation) return null;

  console.log(reservationData.checkin)

  return (
    <ModalOverlay onClick={closeModal1}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={closeModal1}>X</CloseButton>
        <div style={{ marginBottom: "10px" }}>
          <p><strong>Apto {reservationData.apartment}</strong> ({reservationData.apartment_owner})</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <a href="/occupation" target="_blank" rel="noopener noreferrer">
              <img
                src="download-pdf.png"
                alt="PDF Reserva"
                style={{ width: "30px", height: "auto", cursor: "pointer" }}
              />
            </a>
            <p>
              {format(new Date(reservationData.checkin), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(reservationData.checkout), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        <div>
          <div>
            <strong>Nome do Hóspede:</strong>
            <EditableInput
              type="text"
              value={reservationData.guest_name}
              onChange={(e) => handleChange("guest_name", e.target.value)}
            />
          </div>
          <div>
            <strong>Documento do Hóspede:</strong>
            <EditableInput
              type="text"
              value={reservationData.guest_document}
              onChange={(e) => handleChange("guest_document", e.target.value)}
            />
          </div>
          <div>
            <strong>Contato do Hóspede:</strong>
            <EditableInput
              type="text"
              value={reservationData.guest_phone || ""}
              onChange={handlePhoneChange}
              placeholder="88 88888-8888"
            />
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>Quantidade de Hóspedes:</strong>
              <select
                value={reservationData.guests_qty || ""}
                onChange={(e) => handleChange("guests_qty", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "10px 0",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
              >
                <option value="" disabled>
                  Selecione a quantidade
                </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <strong>Tem crianças?</strong>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <label>
                  <input
                    type="radio"
                    name="hasChildren"
                    value="yes"
                    checked={reservationData.hasChildren === "yes"}
                    onChange={(e) => handleChange("hasChildren", e.target.value)}
                  />
                  Sim
                </label>
                <label>
                  <input
                    type="radio"
                    name="hasChildren"
                    value="no"
                    checked={reservationData.hasChildren === "no"}
                    onChange={(e) => handleChange("hasChildren", e.target.value)}
                  />
                  Não
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Capturar Imagens:</p>
            <div style={{ marginLeft: "10px" }}>
              <StyledFileInput
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImagePick}
              />
              <FileInputLabel htmlFor="imageUpload" />
            </div>
            <div style={{ marginLeft: "10px" }} onClick={handleCameraShot}>
              <img
                src="camera.png"
                style={{ width: "30px", height: "auto", cursor: "pointer" }}
              />
            </div>
          </div>
          {cameraActive && (
            <VideoContainer>
              <VideoPreview ref={videoRef} autoPlay></VideoPreview>
              <button onClick={capturePhoto}>Capturar</button>
            </VideoContainer>
          )}

          <div style={{ marginTop: "20px" }}>
            {reservationData.additional_photos.length > 0 && (
              <strong>Fotos:</strong>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {/* Display old photos */}
              {reservationData.additional_photos?.map((photoUrl, index) => (
                <div
                  key={`old-${index}`}
                  style={{ position: "relative", width: "20%" }}
                >
                  <ImagePreview src={photoUrl} alt={`Old Photo ${index + 1}`} />
                  <button
                    onClick={() => {
                      const updatedPhotos = [...reservationData.additional_photos];
                      updatedPhotos.splice(index, 1); // Remove this photo
                      setReservationData((prev) => ({
                        ...prev,
                        additional_photos: updatedPhotos,
                      }));
                    }}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* Display new photos */}
              {capturedPhotos.map((photo, index) => (
                <div
                  key={`new-${index}`}
                  style={{ position: "relative", width: "20%" }}
                >
                  <ImagePreview src={photo} alt={`New Photo ${index + 1}`} />
                  <button
                    onClick={() =>
                      setCapturedPhotos((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>


        <div style={{ display: "flex", justifyContent: "start", gap: "10px" }}>
          {reservationData.checkin_at ? (
            <>
              <GreenButton onClick={handleSaveCheckin} disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Atualizar Informações"}
              </GreenButton>
              {reservationData.checkout_at ? (
                <RedButton style={{ backgroundColor: 'grey' }} disabled={true}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                </RedButton>
              ) : (
                <RedButton onClick={handleCheckout} disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                </RedButton>
              )}
            </>
          ) : (
            <GreenButton onClick={handleSaveCheckin} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Checkin"}
            </GreenButton>
          )}
          <RedButton onClick={closeModal1}>Cancelar</RedButton>
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReservationModal;
