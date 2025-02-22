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
      <LegendItem>
        <ColorBlock color="#FF9800" />
        <LegendText>Reserva Futura</LegendText>
      </LegendItem>

      <LegendItem>
        <ColorBlock color="#1E90FF" />
        <LegendText>Checkin Pendente</LegendText>
      </LegendItem>

      <LegendItem>
        <ColorBlock color="#539e56" />
        <LegendText>Reserva Vigente</LegendText>
      </LegendItem>
      
    </LegendContainer>
  );
};

export default RodapeCalendar;
