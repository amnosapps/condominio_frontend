import styled from "styled-components";

const ReservationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: #8e44ad; /* Purple border on hover */
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e1e4e8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 15px;
`;

const ReservationContent = styled.div`
  flex: 1;
`;

const GuestNameRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GuestName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const StatusBadge = styled.div`
  background: ${(props) =>
    props.status === "pending" ? "#ff9800" : "#4caf50"};
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const DetailsRow = styled.div`
  display: flex;
  align-items: center;
  color: #555;
  font-size: 14px;
  margin-top: 5px;
`;

const DetailAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
`;

const DetailText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.span`
  font-size: 14px;
  color: #888;
`;

const ReservationCard = ({ reservation, onClick }) => {
  const getInitials = (name) => {
    const parts = name.split(" ");
    return parts.map((part) => part[0]).join("").toUpperCase();
  };

  return (
    <ReservationItem onClick={() => onClick(reservation)}>
      <Avatar>{getInitials(reservation.guest_name || "NA")}</Avatar>
      <ReservationContent>
        <GuestNameRow>
          <GuestName>{reservation.guest_name}</GuestName>
          <StatusBadge status={reservation.checkin_at ? "active" : "pending"}>
            {reservation.checkin_at ? "Checked-in" : "Pending"}
          </StatusBadge>
        </GuestNameRow>
        <DetailsRow>
          <DetailAvatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              reservation.guest_name || "NA"
            )}`}
            alt={reservation.guest_name}
          />
          <DetailText>
            {reservation.apt_number
              ? `Apartment ${reservation.apt_number}`
              : "No details available"}
          </DetailText>
        </DetailsRow>
      </ReservationContent>
      <TimeStamp>
        {reservation.checkin
          ? new Date(reservation.checkin).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A"}
      </TimeStamp>
    </ReservationItem>
  );
};

export default ReservationCard;
