import React from "react";
import styled from "styled-components"; // Ensure this import is included

const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 260px;
  overflow-y: auto; /* Enable vertical scrolling */

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
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 15px;
`;

const VisitorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const VisitorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const VisitorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const VisitorName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const VisitorSchedule = styled.span`
  font-size: 14px;
  color: #555;
`;

const ChevronIcon = styled.span`
  font-size: 18px;
  color: #4caf50;
  cursor: pointer;
`;

const VisitorsWidget = ({ visitors }) => (
  <Widget>
    <WidgetTitle>Visitantes do Dia</WidgetTitle>
    <button>+</button>
    <VisitorList>
      {visitors?.map((visitor) => (
        <VisitorItem key={visitor.id}>
          <VisitorDetails>
            <VisitorName>{visitor.name}</VisitorName>
            <VisitorSchedule>{visitor.schedule}</VisitorSchedule>
          </VisitorDetails>
          <ChevronIcon>➔</ChevronIcon>
        </VisitorItem>
      ))}
    </VisitorList>
  </Widget>
);

export default VisitorsWidget;
