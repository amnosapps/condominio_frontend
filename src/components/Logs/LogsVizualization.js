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

  > span {
    font-weight: 700;
  }
`;

const LogsListComponent = ({ logs }) => {
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleLogDetails = (logId) => {
    setExpandedLogs((prevState) => ({
      ...prevState,
      [logId]: !prevState[logId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'null';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  const formatDateLog = (dateString) => {
    if (!dateString) return 'null';
    return new Date(dateString).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  const renderModifiedData = (oldData, newData) => {
    if (!oldData && !newData) {
      return <p>Nenhum dado disponível.</p>;
    }

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    const modifiedEntries = [...allKeys].filter((key) => JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key]));

    if (modifiedEntries.length === 0) {
      return <p>Nenhuma modificação.</p>;
    }

    return (
      <DataList>
        {modifiedEntries.map((key) => (
          <DataItem key={key}>
            <DataKey>{key}</DataKey>
            <DataValue>
              {key.includes('checkin') || key.includes('checkout') ? formatDate(oldData?.[key]) : JSON.stringify(oldData?.[key]) || 'null'} → <span>{key.includes('checkin') || key.includes('checkout') ? formatDate(newData?.[key]) : JSON.stringify(newData?.[key]) || 'null'}</span>
            </DataValue>
          </DataItem>
        ))}
      </DataList>
    );
  };

  const formatAction = (log) => {
    if (log.new_data?.checkin_at && !log.old_data?.checkin_at) return <span style={{ color: 'green' }}>Check-in</span>;
    if (log.new_data?.checkout_at && !log.old_data?.checkout_at) return <span style={{ color: 'red' }}>Check-out</span>;
    if (log.action === 'update') return 'Atualização';
    if (log.action === 'criada') return 'Criação';
    return log.action;
  };

  return (
    <LogsList>
      {logs.length > 0 ? (
        logs.map((log) => (
          <LogItem key={log.id}>
            <LogHeader onClick={() => toggleLogDetails(log.id)}>
              <LogHeaderItem>{log.user}</LogHeaderItem>
              <LogHeaderItem>{formatAction(log)}</LogHeaderItem>
              <LogHeaderItem>{formatDateLog(log.timestamp)}</LogHeaderItem>
              <CollapseIcon>{expandedLogs[log.id] ? '-' : '+'}</CollapseIcon>
            </LogHeader>
            {expandedLogs[log.id] && (
              <LogDetails>
                <h4>Modificações</h4>
                {renderModifiedData(log.old_data, log.new_data)}
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
