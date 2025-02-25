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

const CameraSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
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
`;

const CameraCaptureModal = ({ onClose, reservationId, guestType, guestIndex, additionalGuests, fetchReservations, onImageCaptured }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState("");

    useEffect(() => {
        async function getCameras() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === "videoinput");
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDevice(videoDevices[0].deviceId);
                    startCamera(videoDevices[0].deviceId);
                }
            } catch (error) {
                console.error("Error fetching cameras:", error);
                alert("Erro ao acessar as câmeras.");
                onClose();
            }
        }

        getCameras();

        return () => stopCamera();
    }, []);

    const startCamera = async (deviceId) => {
        stopCamera(); // Stop any existing stream before starting a new one

        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
            });
            setStream(videoStream);
            if (videoRef.current) videoRef.current.srcObject = videoStream;
        } catch (error) {
            console.error("Camera access error:", error);
            alert("Erro ao acessar a câmera.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = 500;
        canvas.height = 500;

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        const scale = Math.max(500 / videoWidth, 500 / videoHeight);
        const scaledWidth = videoWidth * scale;
        const scaledHeight = videoHeight * scale;
        const offsetX = (scaledWidth - 500) / 2;
        const offsetY = (scaledHeight - 500) / 2;

        context.drawImage(videoRef.current, -offsetX, -offsetY, scaledWidth, scaledHeight);

        const compressedImageBase64 = canvas.toDataURL("image/jpeg", 0.8);

        fetch(compressedImageBase64)
            .then(res => res.blob())
            .then(blob => {
                console.log(`Final Image Size: ${(blob.size / 1024).toFixed(2)} KB`);
                if (blob.size > 100 * 1024) {
                    alert("O tamanho do arquivo não pode exceder 100KB.");
                    return;
                }
            })
            .catch(err => console.error("Erro ao validar a imagem:", err));

        await updateGuestImage(compressedImageBase64);
    };

    const updateGuestImage = async (imageBase64) => {
        setIsUploading(true);
        const token = localStorage.getItem("accessToken");
        const formData = new FormData();

        formData.append("update_device", "true");

        if (guestType === "main") {
            formData.append("image_base64", imageBase64);
        } else if (guestType === "additional") {
            if (guestIndex >= 0 && guestIndex < additionalGuests.length) {
                additionalGuests[guestIndex].image_base64 = imageBase64;
            } else {
                console.error("Invalid guest index:", guestIndex);
                alert("Erro: Índice de hóspede adicional inválido.");
                setIsUploading(false);
                return;
            }

            formData.append("additional_guests", JSON.stringify(additionalGuests));
        }

        try {
            stopCamera(); // Stop camera before closing modal
            onClose();
            fetchReservations();
            onImageCaptured(imageBase64, guestType, guestIndex);
            setIsUploading(false);

            await axios.patch(`${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

        } catch (error) {
            setIsUploading(false);
            alert("Erro ao atualizar a imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <CloseButton onClick={() => { stopCamera(); onClose(); }}>
                    <FaTimes />
                </CloseButton>
                <h3>Capturar Foto</h3>
                <CameraSelect onChange={(e) => startCamera(e.target.value)} value={selectedDevice}>
                    {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId}`}
                        </option>
                    ))}
                </CameraSelect>
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
