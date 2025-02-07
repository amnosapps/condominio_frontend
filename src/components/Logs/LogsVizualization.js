import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components
const LogsList = styled.div`
  margin-top: 20px;
`;

const LogItem = styled.div`
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f9f9f9;
  cursor: pointer;
  font-family: Arial, sans-serif;
`;

const LogHeaderItem = styled.span`
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: #333;
`;

const CollapseIcon = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-left: 10px;
`;

const LogDetails = styled.div`
  padding: 10px 15px;
  background: #fff;
  font-family: Arial, sans-serif;
`;

const DataList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DataItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
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

const LogsListComponent = ({ logs }) => {
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleLogDetails = (logId) => {
    setExpandedLogs((prevState) => ({
      ...prevState,
      [logId]: !prevState[logId],
    }));
  };

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
    <LogsList>
      {logs.length > 0 ? (
        logs.map((log) => (
          <LogItem key={log.id}>
            <LogHeader onClick={() => toggleLogDetails(log.id)}>
              <LogHeaderItem>{log.user}</LogHeaderItem>
              <LogHeaderItem>{log.action}</LogHeaderItem>
              <LogHeaderItem>{new Date(log.timestamp).toLocaleString()}</LogHeaderItem>
              <CollapseIcon>{expandedLogs[log.id] ? '-' : '+'}</CollapseIcon>
            </LogHeader>
            {expandedLogs[log.id] && (
              <LogDetails>
                <h4>Dados Antigos</h4>
                {renderData(log.old_data)}
                <h4>Dados Novos</h4>
                {renderData(log.new_data)}
              </LogDetails>
            )}
          </LogItem>
        ))
      ) : (
        <p>Não foram encontrados logs desta reserva.</p>
      )}
    </LogsList>
  );
};

export default LogsListComponent;
