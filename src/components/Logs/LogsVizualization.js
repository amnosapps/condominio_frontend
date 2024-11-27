import React from 'react';
import styled from 'styled-components';

// Styled components for better visualization
const DataContainer = styled.div`
    padding: 0px 30px;
  margin-top: 10px;
  font-family: Arial, sans-serif;
`;

const DataTitle = styled.h4`
  margin: 10px 0;
  color: #333;
`;

const DataList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
`;

const DataItem = styled.li`
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 5px 0;
  &:last-child {
    border-bottom: none;
  }
`;

const DataKey = styled.span`
  font-weight: bold;
  color: #555;
`;

const DataValue = styled.span`
  color: #777;
`;

const LogsVisualization = ({ log }) => {
  const renderData = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return <p>Nenhum dado disponível.</p>;
    }

    return (
      <DataList>
        {Object.entries(data).map(([key, value]) => (
          <DataItem key={key}>
            <DataKey>{key}</DataKey>
            <DataValue>{JSON.stringify(value)}</DataValue>
          </DataItem>
        ))}
      </DataList>
    );
  };

  return (
    <DataContainer>
      <DataTitle>Dados Antigos:</DataTitle>
      {renderData(log.old_data)}

      <DataTitle>Dados Novos:</DataTitle>
      {renderData(log.new_data)}
    </DataContainer>
  );
};

export default LogsVisualization;
