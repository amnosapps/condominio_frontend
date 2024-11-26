import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

// Styled Components
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

const PhotoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PhotoItem = styled.div`
  position: relative;
  width: 20%;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CaptureButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const PhotoCapture = ({ existingPhotos, onPhotosChange }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const videoRef = useRef(null);

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
      const photoUrl = URL.createObjectURL(file);
      setCapturedPhotos((prev) => [...prev, photoUrl]);
      onPhotosChange([...capturedPhotos, photoUrl]);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const photoUrl = URL.createObjectURL(blob);
      setCapturedPhotos((prev) => [...prev, photoUrl]);
      onPhotosChange([...capturedPhotos, photoUrl]);
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = capturedPhotos.filter((_, i) => i !== index);
    setCapturedPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
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
        <div style={{ marginLeft: "10px" }} onClick={() => setCameraActive(true)}>
          <img
            src="camera.png"
            style={{ width: "30px", height: "auto", cursor: "pointer" }}
          />
        </div>
      </div>
      {cameraActive && (
        <VideoContainer>
          <VideoPreview ref={videoRef} autoPlay></VideoPreview>
          <CaptureButton onClick={capturePhoto}>Capturar</CaptureButton>
        </VideoContainer>
      )}

      <PhotoContainer>
        {existingPhotos?.map((photoUrl, index) => (
          <PhotoItem key={`existing-${index}`}>
            <ImagePreview src={photoUrl} alt={`Existing Photo ${index + 1}`} />
            <RemoveButton onClick={() => onPhotosChange(existingPhotos.filter((_, i) => i !== index))}>
              &times;
            </RemoveButton>
          </PhotoItem>
        ))}
        {capturedPhotos.map((photo, index) => (
          <PhotoItem key={`new-${index}`}>
            <ImagePreview src={photo} alt={`New Photo ${index + 1}`} />
            <RemoveButton onClick={() => removePhoto(index)}>&times;</RemoveButton>
          </PhotoItem>
        ))}
      </PhotoContainer>
    </div>
  );
};

export default PhotoCapture;
