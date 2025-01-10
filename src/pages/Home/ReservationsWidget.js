import React, { useState } from "react";
import styled from "styled-components";
import ReservationModal from "../../components/ReservationModal";

// Styled Components for Reservations Widget
const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  max-height: 260px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
  }
`;

const WidgetTitle = styled.h3`
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const OpenButton = styled.button`
  background-color: #f46600;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #ff7e21;
  }

  &:active {
    background-color: #3e8e41;
  }

  &:focus {
    outline: none;
  }
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 260px;
  margin-bottom: 100px;
`;

const ReservationItem = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const GuestImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const ReservationDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const GuestName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const RoomDetails = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const Dates = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

const ChevronIcon = styled.span`
  font-size: 20px;
  color: #4caf50;
  cursor: pointer;
`;

// ReservationsWidget Component
const ReservationsWidget = ({
  onOpen,
  reservations,
  fetchReservations,
  selectedCondominium,
}) => {
  const [selectedReservation, setSelectedReservation] = useState(null);

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  return (
    <Widget>
      <Header>
        <WidgetTitle>Checkins Próximos</WidgetTitle>
        <OpenButton onClick={onOpen}>+ Nova Reserva</OpenButton>
      </Header>
      <ReservationList>
        {reservations?.map((res) => (
          <ReservationItem
            key={res.id}
            onClick={() => handleReservationClick(res)}
          >
            <GuestImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                res.guest_name
              )}`}
              alt={`${res.guest_name}'s avatar`}
            />
            <ReservationDetails>
              <GuestName>{res.guest_name || "Unknown Guest"}</GuestName>
              <RoomDetails>{`Apartment ${res.apt_number || "N/A"}`}</RoomDetails>
              <Dates>
                {new Date(res.checkin).toLocaleDateString("pt-BR")} -{" "}
                {new Date(res.checkout).toLocaleDateString("pt-BR")}
              </Dates>
            </ReservationDetails>
            <ChevronIcon>➔</ChevronIcon>
          </ReservationItem>
        ))}
      </ReservationList>

      {selectedReservation && (
        <ReservationModal
          closeModal={closeModal}
          selectedReservation={selectedReservation}
          fetchReservations={fetchReservations}
          selectedCondominium={selectedCondominium}
        />
      )}
    </Widget>
  );
};

export default ReservationsWidget;
