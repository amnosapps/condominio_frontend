import React from "react";
import styled from "styled-components";

// Styled Components for Reservations Widget
const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  max-height: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
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
  margin-bottom: 20px;
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 260px; 
`;

const ReservationItem = styled.div`
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
const ReservationsWidget = ({ reservations }) => (
  <Widget>
    <WidgetTitle>Reservations Today</WidgetTitle>
    <button>+</button>
    <ReservationList>
      {reservations?.map((res) => (
        <ReservationItem key={res.id}>
          <GuestImage src={res.image} alt={`${res.guest}'s avatar`} />
          <ReservationDetails>
            <GuestName>{res.guest}</GuestName>
            <RoomDetails>{res.room}</RoomDetails>
            <Dates>{res.dates}</Dates>
          </ReservationDetails>
          <ChevronIcon>➔</ChevronIcon>
        </ReservationItem>
      ))}
    </ReservationList>
  </Widget>
);

export default ReservationsWidget;
