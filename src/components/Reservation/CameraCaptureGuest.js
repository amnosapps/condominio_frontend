import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FaCamera, FaTimes } from "react-icons/fa";
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
  width: 360px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
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

const Video = styled.video`
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const CaptureButton = styled.button`
  background: #f46600;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;

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

const CameraCaptureModal = ({ onClose, reservationId, guestType, guestIndex, additionalGuests, fetchReservations }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        async function startCamera() {
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                });
                setStream(videoStream);
                if (videoRef.current) videoRef.current.srcObject = videoStream;
            } catch (error) {
                console.error("Camera access error:", error);
                alert("Erro ao acessar a câmera.");
                onClose();
            }
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [onClose]);

    const captureImage = async () => {
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
            })
            .catch((err) => console.error("Erro ao validar a imagem:", err));
        // Send the image update request
        await updateGuestImage(compressedImageBase64);
    };

    const updateGuestImage = async (imageBase64) => {
        setIsUploading(true);
        const token = localStorage.getItem("accessToken");
        const formData = new FormData();

        if (guestType === "main") {
            formData.append("image_base64", imageBase64);
        } else if (guestType === "additional") {
            // Ensure guestIndex is within bounds
            if (guestIndex >= 0 && guestIndex < additionalGuests.length) {
                additionalGuests[guestIndex].image_base64 = imageBase64;
            } else {
                console.error("Invalid guest index:", guestIndex);
                alert("Erro: Índice de hóspede adicional inválido.");
                setIsUploading(false);
                return;
            }

            // Append the updated list of guests
            formData.append("additional_guests", JSON.stringify(additionalGuests));
        }

        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                alert("Imagem atualizada com sucesso!");
                fetchReservations(); // Refresh data
                onClose();
                setIsUploading(false);
            } else {
                alert("Falha ao atualizar a imagem.");
            }
        } catch (error) {
            console.error("Erro ao atualizar imagem:", error);
            alert("Erro ao atualizar a imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
                <h3>Capturar Foto</h3>
                <Video ref={videoRef} autoPlay />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <CaptureButton onClick={captureImage} disabled={isUploading}>
                    <FaCamera style={{ marginRight: "7px" }} /> {isUploading ? <LoadingSpinner /> : "Capturar"}
                </CaptureButton>
            </ModalContent>
        </ModalOverlay>
    );
};

export default CameraCaptureModal;
