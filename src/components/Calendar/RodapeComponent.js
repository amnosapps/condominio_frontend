import React from 'react';
import styled from 'styled-components';

const LegendContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 2px;
  background-color: #F5F5F5;
  border-top: 2px solid #ddd;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 0 15px;
`;

const ColorBlock = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${(props) => props.color};
`;

const LegendText = styled.span`
  font-size: 13px;
  color: #666;
`;

const RodapeCalendar = () => {
  return (
    <LegendContainer>
      {/* Future booking (yellow) */}
      <LegendItem>
        <ColorBlock color="#FFC107" />
        <LegendText>Reserva Futura</LegendText>
      </LegendItem>

      {/* Expired check-in (red) */}
      <LegendItem>
        <ColorBlock color="#FF5722" />
        <LegendText>Checkin Pendente</LegendText>
      </LegendItem>

      {/* Active reservation (green) */}
      <LegendItem>
        <ColorBlock color="#4CAF50" />
        <LegendText>Reserva Vigente</LegendText>
      </LegendItem>

      {/* Pending checkout (black) */}
      <LegendItem>
        <ColorBlock color="#000" />
        <LegendText>Checkout Pendente</LegendText>
      </LegendItem>

      {/* Closed reservation (grey) */}
      <LegendItem>
        <ColorBlock color="#9E9E9E" />
        <LegendText>Reserva Encerrada</LegendText>
      </LegendItem>

      {/* Future booking (orange for today) */}
      <LegendItem>
        <ColorBlock color="#FFA500" />
        <LegendText>Checkin Próximo</LegendText>
      </LegendItem>
    </LegendContainer>
  );
};

export default RodapeCalendar;
