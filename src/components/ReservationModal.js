import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

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
  padding: 10px 20px;
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
  fetchReservations,
}) => {
  const [reservationData, setReservationData] = useState({
    guestName: selectedReservation?.guestName || "",
    guests_qty: selectedReservation?.guests_qty || "",
    hasChildren: "no",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]); // Store multiple photos
  const videoRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission (Checkin button)
  const handleSaveCheckin = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken"); // Assuming the token is stored in localStorage
      const formData = new FormData();

      // Append reservation data
      formData.append("guestName", reservationData.guestName);
      formData.append("guests_qty", reservationData.guests_qty);
      formData.append("hasChildren", reservationData.hasChildren);
      formData.append("checkin_at", new Date().toISOString());

      // Append image files if they exist
      if (selectedImage) {
        formData.append("photo", selectedImage);
      }
      for (const photoUrl of capturedPhotos) {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        formData.append(
          "photos",
          new File([blob], `captured_photo_${Date.now()}.png`, { type: "image/png" })
        );
      }

      // Send PATCH request
      await axios.patch(
        `/reservations/${selectedReservation.id}/`, // Endpoint for updating reservation
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Reservation updated successfully!");
      fetchReservations(); // Refresh reservations list
      closeModal(); // Close the modal
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Failed to update reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setCameraActive(false); // Disable camera if there's an error
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const photoUrl = URL.createObjectURL(blob);
      setCapturedPhotos((prev) => [...prev, photoUrl]); // Add photo to the array
    });
  };

  const handleImagePick = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file); // Save the file object for submission
      setCapturedPhotos((prev) => [...prev, URL.createObjectURL(file)]); // Add preview
    }
  };

  const handleCameraShot = () => {
    setCameraActive(true); // Enable camera, triggering useEffect
  };

  const closeModal1 = () => {
    setSelectedImage(null);
    setCapturedPhotos([]);
    setCameraActive(false); // Close the camera if open
    closeModal();
  };

  if (!selectedReservation) return null;

  return (
    <ModalOverlay onClick={closeModal1}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={closeModal1}>X</CloseButton>
        <a href="/occupation" target="_blank" rel="noopener noreferrer">
          <img
            src="download-pdf.png" // Replace this with the actual image path
            alt="PDF Reserva"
            style={{ width: "30px", height: "auto", cursor: "pointer" }} // Adjust the styling as needed
          />
        </a>
        <div>
          <div>
            <strong>Nome do Hóspede:</strong>
            <EditableInput
              type="text"
              value={reservationData.guestName}
              onChange={(e) => handleChange("guestName", e.target.value)}
            />
          </div>
          <div>
            <strong>Contato do Hóspede:</strong>
            <EditableInput
              type="number"
              value={reservationData.guestName}
              onChange={(e) => handleChange("guestPhone", e.target.value)}
            />
          </div>
          <div>
            <strong>Quantidade de Hóspedes:</strong>
            <EditableInput
              type="number"
              value={reservationData.guests_qty}
              onChange={(e) => handleChange("guests_qty", e.target.value)}
            />
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

        <div>
          <div>
            <p>Imagens:</p>
            <StyledFileInput
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImagePick} // Pass the full event here
            />
            <FileInputLabel htmlFor="imageUpload" />
            <div onClick={handleCameraShot}>
              <img
                src="camera.png" // Replace this with the actual image path
                style={{ width: "30px", height: "auto", cursor: "pointer" }} // Adjust the styling as needed
              />
            </div>
          </div>
          <div>
            {cameraActive && (
              <VideoContainer>
                <VideoPreview ref={videoRef} autoPlay></VideoPreview>
                <button onClick={capturePhoto}>
                  Capturar
                </button>
              </VideoContainer>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {capturedPhotos.map((photo, index) => (
                <div key={index} style={{ position: "relative", width: "20%" }}>
                  <ImagePreview src={photo} alt={`Captured ${index + 1}`} />
                  <button
                    onClick={() => setCapturedPhotos((prev) => prev.filter((_, i) => i !== index))}
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

        <GreenButton onClick={handleSaveCheckin} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Checkin"}
        </GreenButton>
        <RedButton onClick={closeModal1}>Cancel</RedButton>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReservationModal;
