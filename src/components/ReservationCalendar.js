import React, { useState, useEffect, useRef  } from "react";
import axios from "axios";
import styled, { css, keyframes } from "styled-components";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday,
  isWeekend,
  parseISO,
  differenceInCalendarDays,
  min,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const slideDown = keyframes`
  from {
    transform: translateY(-30%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

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
  margin-top: 300px;
  margin-left: 100px;
  background-color: white;
  width: 80%;
  max-width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  animation: ${slideDown} 0.5s ease forwards;
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100vw;
`

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  margin: auto;
  align-items: center;
  align-content: center;
  margin-bottom: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 18px;
  color: #e46f65;
  margin: 0;
  padding: 10px;
`;

const SearchWrapper = styled.div`
  display: flex;
  /* align-items: center; */
  margin-left: 50%;
`;

const SearchInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
  width: 200px;

  &::placeholder {
    color: #888;
  }
`;

const SearchButton = styled.button`
  padding: 8px 12px;
  background-color: #E46F65;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #3579a6;
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  width: 90%;
  margin: auto;
  font-family: Arial, sans-serif;
  background-color: #fff;
  border: 1px solid #ddd;
`;

const Calendar = styled.div`
  flex: 1;
  background-color: #e46f65;
`;

const CalendarHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e46f65;
  padding: 1px 50px;

  .header-title {
    font-size: 18px;
    font-weight: 300;
    color: #fff;
  }

  > button {
    background-color: #e46f65;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
`;

const CalendarDay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-weight: bold;
  background-color: #fff;
  border: 1px solid #ddd;

  ${(props) =>
    props.isCurrentDay &&
    css`
      background-color: #ffe2e2;
      color: #d9534f;
    `}

  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #e5f2ff;
      color: #004085;
    `}

  > h1 {
    font-weight: 300;
    font-size: 15px;
    margin-bottom: -11px;
  }

  > h2 {
    font-weight: 300;
    font-size: 15px;
  }
`;

const CalendarEmptyCell = styled.div`
  background-color: #fff;
`;

const CalendarRow = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
`;

const CalendarApartment = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-weight: bold;
  background-color: #f4f4f4;
  border: 1px solid #ddd;

  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #fff;
      color: #5c5c5c;
    `}
`;

const CalendarCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: #fff;
  position: relative;
`;

const Reservation = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #4c92d0;
  color: white;
  border-radius: 3px;
  cursor: pointer;

  > h1 {
    font-size: 0.9em;
    text-align: center;
    font-weight: 500;
    padding: 0px 15px;
  }
`;

const ReservationCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApartments(response.data.map(apartment => `${apartment.number}`));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    const fetchReservations = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(response.data.map(reservation => ({
          id: reservation.id,
          name: reservation.guest_name,
          guests_qty: reservation.guests_qty,
          apt_owner_name: reservation.apt_owner_name,
          photo: reservation.photo,
          apartment: `${reservation.apt_number}`,
          beginDate: parseISO(reservation.checkin.split("T")[0]),
          endDate: parseISO(reservation.checkout.split("T")[0]),
        })));
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchApartments(), fetchReservations()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handlePrevWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const handleNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));

  const daysOfWeek = Array.from({ length: 7 }, (_, index) => addDays(currentWeek, index));

  const calculateReservationSpan = (reservation, day) => {
    const displayEnd = min([reservation.endDate, endOfWeek(day)]);
    return differenceInCalendarDays(displayEnd, day) + 1;
  };

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const handleImagePick = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Preview the selected image
      uploadPhoto(file); // Upload the photo to the server
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      // Start camera stream when cameraActive is true and videoRef is available
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setCameraActive(false); // Disable camera if there's an error
        });
    }

    return () => {
      // Cleanup function to stop the camera stream when modal closes
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]); // Run this effect only when cameraActive changes

  const handleCameraShot = () => {
    setCameraActive(true); // Enable camera, triggering useEffect
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_photo.png", { type: "image/png" });
      setCapturedPhoto(URL.createObjectURL(blob)); // Display the captured photo
      setCameraActive(false); // Close the camera
      uploadPhoto(file); // Upload the photo to the server
    });
  };

  const closeModal = () => {
    setSelectedReservation(null);
    setSelectedImage(null);
    setCapturedPhoto(null);
    setCameraActive(false); // Close the camera if open
  };

  const uploadPhoto = async (file) => {
    if (!selectedReservation) return;
  
    const formData = new FormData();
    formData.append("photo", file);
  
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
  
      // Update the selectedReservation state with the new photo URL
      setSelectedReservation({
        ...selectedReservation,
        photo: response.data.photo,
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const updateReservationTime = async (type) => {
    if (!selectedReservation) return;

    const timestamp = new Date().toISOString();
    const updateData = type === "checkin" ? { checkin_at: timestamp } : { checkout_at: timestamp };

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        updateData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setSelectedReservation({ ...selectedReservation, ...updateData });
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const getReservationsCountForDay = (day) => {
    return reservations.filter(
      (reservation) => day >= reservation.beginDate && day <= reservation.endDate
    ).length;
  };

  return (
    <Container>
      <HeaderContainer>
        <Title>Calendário de Ocupação</Title>
        <SearchWrapper>
          <SearchInput placeholder="Buscar Hóspede" />
          <SearchButton>Buscar</SearchButton>
        </SearchWrapper>
      </HeaderContainer>
      <CalendarContainer>
        <Calendar>
          <CalendarHeader>
            <button onClick={handlePrevWeek}>{'<'}</button>
            <h2 className="header-title">{`${format(currentWeek, "dd MMM yyyy", { locale: ptBR })} - ${format(
              addDays(currentWeek, 6), "dd MMM yyyy", { locale: ptBR })}`}</h2>
            <button onClick={handleNextWeek}>{'>'}</button>
          </CalendarHeader>

          <CalendarGrid>
            <CalendarDays>
              <CalendarEmptyCell />
              {daysOfWeek.map((day, index) => (
                <CalendarDay key={index} isCurrentDay={isToday(day)} isWeekend={isWeekend(day)}>
                  <h1>{format(day, "dd", { locale: ptBR })}</h1>
                  <h2>{format(day, "EE", { locale: ptBR })}</h2>
                </CalendarDay>
              ))}
            </CalendarDays>

            {apartments.map((apartment, index) => (
              <CalendarRow key={index}>
                <CalendarApartment>{apartment}</CalendarApartment>
                {daysOfWeek.map((day, dayIndex) => {
                  const reservationForCell = reservations.find(
                    (reservation) => reservation.apartment === apartment &&
                    day >= reservation.beginDate && day <= reservation.endDate
                  );

                  const isCurrentDay = isToday(day);
                  const isWeekendDay = isWeekend(day);

                  if (reservationForCell) {
                    const isReservationStartOfWeek = dayIndex === 0 ||
                      day.getTime() === reservationForCell.beginDate.getTime() ||
                      day.getTime() === startOfWeek(day).getTime();

                    if (isReservationStartOfWeek) {
                      const span = calculateReservationSpan(reservationForCell, day);
                      return (
                        <CalendarCell key={dayIndex} isCurrentDay={isCurrentDay} isWeekend={isWeekendDay} style={{ gridColumn: `span ${span}` }}>
                          <Reservation onClick={() => handleReservationClick(reservationForCell)}>
                            <h1>{reservationForCell.name}</h1>
                          </Reservation>
                        </CalendarCell>
                      );
                    }
                  }
                  return <CalendarCell key={dayIndex} isCurrentDay={isCurrentDay} isWeekend={isWeekendDay}></CalendarCell>;
                })}
                <CalendarCell></CalendarCell>
              </CalendarRow>
            ))}
            <CalendarRow>
              <CalendarApartment><strong>Total</strong></CalendarApartment>
              {daysOfWeek.map((day, dayIndex) => (
                <CalendarCell key={dayIndex}>
                  <h2>{getReservationsCountForDay(day)}</h2>
                </CalendarCell>
              ))}
            </CalendarRow>
          </CalendarGrid>
        </Calendar>

        {selectedReservation && (
          <ModalOverlay onClick={closeModal}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>X</CloseButton>
              <h3>Detalhes da Reserva</h3>
              <p><strong>Apartamento:</strong> {selectedReservation.apartment} <strong>Proprietário:</strong> {selectedReservation.apt_owner_name}</p>
              <p><strong>Nome do Hóspede:</strong> {selectedReservation.name}</p>
              <p><strong>Quantidade de Hóspedes:</strong> {selectedReservation.guests_qty}</p>
              <p><strong>Data de Início:</strong> {format(selectedReservation.beginDate, "dd MMM yyyy", { locale: ptBR })}</p>
              <p><strong>Data de Fim:</strong> {format(selectedReservation.endDate, "dd MMM yyyy", { locale: ptBR })}</p>
          
              <button onClick={() => updateReservationTime("checkin")}>Checkin</button>
              <button onClick={() => updateReservationTime("checkout")}>Checkout</button>
          
              {/* Image Picker */}
              <p><strong>Upload Image:</strong></p>
              <input type="file" accept="image/*" onChange={handleImagePick} />
              {selectedImage && <img src={selectedImage} alt="Selected" style={{ width: "100%", marginTop: "10px" }} />}
          
              {/* Camera Shot */}
              <p><strong>Take a Photo:</strong></p>
              {cameraActive ? (
                <div>
                  <video ref={videoRef} autoPlay style={{ width: "100%" }}></video>
                  <button onClick={capturePhoto}>Capture Photo</button>
                </div>
              ) : (
                <button onClick={handleCameraShot}>Open Camera</button>
              )}
              {capturedPhoto && <img src={capturedPhoto} alt="Captured" style={{ width: "100%", marginTop: "10px" }} />}
          
              {/* Display saved photo */}
              {selectedReservation.photo && (
                <img src={selectedReservation.photo} alt="Reservation Photo" style={{ width: "100%", marginTop: "10px" }} />
              )}
            </ModalContainer>
          </ModalOverlay>
        )}
      </CalendarContainer>
    </Container>
  );
};

export default ReservationCalendar;
