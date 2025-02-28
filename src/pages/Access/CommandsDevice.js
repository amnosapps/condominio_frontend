import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaDoorOpen, FaDoorClosed, FaEye } from 'react-icons/fa';
import api from '../../services/api';
import { useParams } from 'react-router-dom';

const PageContainer = styled.div`
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const DeviceTableContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const DeviceTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 20px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #f8f9fa;
    color: #495057;
    font-size: 16px;
    border-bottom: 1px solid #dee2e6;
    text-transform: uppercase;
  }

  td {
    border-bottom: 1px solid #e9ecef;
    font-size: 16px;
    color: #555;
  }

  tr:hover td {
    background-color: #f1f3f5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 20px;
    padding: 10px;
    border-radius: 8px;
    transition: 0.2s;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status {
    background: #17a2b8;
    color: white;
  }

  .open {
    background: #28a745;
    color: white;
  }

  .close {
    background: #dc3545;
    color: white;
  }

  button:hover {
    opacity: 0.8;
  }
`;

const AlertContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${(props) => (props.type === 'success' ? '#28a745' : props.type === 'warning' ? '#ffc107' : '#17a2b8')};
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 16px;
  display: ${(props) => (props.show ? 'block' : 'none')};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const DeviceCommandPage = ({ condominium }) => {
  const params = useParams();
  const [devices, setDevices] = useState([]);
  const [alert, setAlert] = useState({ show: false, title: '', message: '', type: '' });

  const fetchDevices = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await api.get('/api/access/devices/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { condominium: condominium.id },
      });
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const showAlert = (title, message, type) => {
    setAlert({ show: true, title, message, type });
    setTimeout(() => setAlert({ show: false, title: '', message: '', type: '' }), 3000);
  };

  const handleDoorStatus = async (deviceId) => {
    try {
      const response = await api.get(`/api/access/devices/${deviceId}/door-status/`);
      showAlert('Status da Porta', response.data.response, 'info');
    } catch (error) {
      console.error('Error fetching door status:', error);
    }
  };

  const handleOpenDoor = async (deviceId) => {
    try {
      const response = await api.post(`/api/access/devices/${deviceId}/open-door/`, {
        user_id: 'test_user', // Replace with actual user ID
      });
      showAlert('Abrir Porta', response.data.response, 'success');
    } catch (error) {
      console.error('Error opening door:', error);
    }
  };

  const handleCloseDoor = async (deviceId) => {
    try {
      const response = await api.post(`/api/access/devices/${deviceId}/close-door/`);
      showAlert('Fechar Porta', response.data.response, 'warning');
    } catch (error) {
      console.error('Error closing door:', error);
    }
  };

  return (
    <PageContainer>
      <HeaderContainer>
        <HeaderTitle>Controle da Portaria</HeaderTitle>
      </HeaderContainer>

      <AlertContainer show={alert.show} type={alert.type}>
        <strong>{alert.title}</strong>: {alert.message}
      </AlertContainer>

      <DeviceTableContainer>
        <DeviceTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Verificar</th>
              <th>Abrir</th>
              <th>Fechar</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td>
                  <ActionButtons>
                    <button className="status" onClick={() => handleDoorStatus(device.id)}>
                      <FaEye />
                    </button>
                  </ActionButtons>
                </td>
                <td>
                  <ActionButtons>
                    <button className="open" onClick={() => handleOpenDoor(device.id)}>
                      <FaDoorOpen />
                    </button>
                  </ActionButtons>
                </td>
                <td>
                  <ActionButtons>
                    <button className="close" onClick={() => handleCloseDoor(device.id)}>
                      <FaDoorClosed />
                    </button>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </DeviceTable>
      </DeviceTableContainer>
    </PageContainer>
  );
};

export default DeviceCommandPage;
