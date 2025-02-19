import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import DeviceModal from '../../components/Access/DeviceModal';
import api from '../../services/api';
import { useParams } from 'react-router-dom';

// Styled Components
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
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
`;

const AddDeviceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }
`;

const DeviceTableContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  color: #495057;
  cursor: pointer;

  &:focus {
    border-color: #80bdff;
    outline: none;
  }
`;

const DeviceTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 16px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #f8f9fa;
    color: #495057;
    font-size: 14px;
    border-bottom: 1px solid #dee2e6;
    text-transform: uppercase;
  }

  td {
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
    color: #555;
  }

  tr:hover td {
    background-color: #f1f3f5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    border: none;
    background: none;
    cursor: pointer;
    color: #495057;
    font-size: 16px;

    &:hover {
      color: #007bff;
    }

    &.delete {
      color: #e74c3c;

      &:hover {
        color: #c0392b;
      }
    }
  }
`;

const DeviceRow = styled.tr`
  td:first-child {
    display: flex;
    align-items: center;
  }
`;

const DeviceManagement = ({ profile, condominium }) => {
    const params = useParams();
    const [devices, setDevices] = useState([]);
    const [deviceType, setDeviceType] = useState('all'); // Default to all devices
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const fetchDevices = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await api.get('/api/access/devices/', {
                headers: { Authorization: `Bearer ${token}` },
                params: { condominium: condominium.id },
            });
            const allDevices = response.data;
            const filteredDevices =
                deviceType === 'all'
                ? allDevices
                : allDevices.filter((device) => device.type === deviceType);

            setDevices(filteredDevices);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const handleAddDevice = () => {
        setSelectedDevice(null);
        setModalOpen(true);
    };

    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setModalOpen(true);
    };

    const handleDeleteDevice = async (deviceId) => {
        const token = localStorage.getItem('accessToken');
        try {
            await api.delete(`/api/access/devices/${deviceId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDevices((prevDevices) => prevDevices.filter((device) => device.id !== deviceId));
            fetchDevices();
        } catch (error) {
            console.error('Error deleting device:', error);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [deviceType]);

    return (
        <PageContainer>
        <HeaderContainer>
            <HeaderTitle>Gerenciamento de Dispositivos</HeaderTitle>
            <AddDeviceButton onClick={handleAddDevice}>
            <FaPlus /> Adicionar Dispositivo
            </AddDeviceButton>
        </HeaderContainer>

        <DeviceTableContainer>
            <TableHeader>
            <FilterContainer>
                <FilterSelect
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                >
                <option value="all">Todos</option>
                <option value="0">Reconhecimento Facial</option>
                </FilterSelect>
                <FaFilter /> Filtrar
            </FilterContainer>
            </TableHeader>

            <DeviceTable>
            <thead>
                <tr>
                <th>Nome</th>
                <th>IP</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {devices?.map((device) => (
                    <DeviceRow key={device.id}>
                        <td>{device.name}</td>
                        <td>{device.ip}</td>
                        <td>{device.type_display}</td>
                        <td>{device.brand_display}</td>
                        <td>
                        <ActionButtons>
                            <button onClick={() => handleEditDevice(device)}>
                            <FaEdit />
                            </button>
                            <button
                            className="delete"
                            onClick={() => handleDeleteDevice(device.id)}
                            >
                            <FaTrash />
                            </button>
                        </ActionButtons>
                        </td>
                    </DeviceRow>
                ))}
            </tbody>
            </DeviceTable>
        </DeviceTableContainer>

        {isModalOpen && (
            <DeviceModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                device={selectedDevice}
                condominium_id={condominium.id}
                fetchDevices={fetchDevices}
            />
        )}
        </PageContainer>
    );
};

export default DeviceManagement;
