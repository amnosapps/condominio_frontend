import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../services/api';
import UserDeviceModal from '../../components/Access/UserDeviceModal';

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

const AddUserDeviceButton = styled.button`
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

const TableContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
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

const VerifyButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;

  &:hover {
    color: #28a745;
  }

  &.error {
    color: #e74c3c;

    &:hover {
      color: #c0392b;
    }
  }
`;

const UserDeviceManagement = ({ condominium }) => {
    const [userDevices, setUserDevices] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUserDevice, setSelectedUserDevice] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState({});

    // Fetch User Devices
    const fetchUserDevices = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await api.get('/api/access/user-devices/', {
                headers: { Authorization: `Bearer ${token}` },
                params: { condominium: condominium.id },
            });
            setUserDevices(response.data);
        } catch (error) {
            console.error('Error fetching User Devices:', error);
        }
    };

    const handleAddUserDevice = () => {
        setSelectedUserDevice(null);
        setModalOpen(true);
    };

    const handleEditUserDevice = (device) => {
        setSelectedUserDevice(device);
        setModalOpen(true);
    };

    const handleDeleteUserDevice = async (user_id) => {
        const token = localStorage.getItem('accessToken');
        try {
            await api.delete(`/api/access/user-devices/${user_id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchUserDevices();
        } catch (error) {
            console.error('Error deleting User Device:', error);
        }
    };

    const handleCheckDevice = async (user_id, device_id) => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await api.get(`/api/access/user-devices/${user_id}/check-device/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { device_id },
            });

            if (response.status === 200) {
                setDeviceStatus((prevState) => ({
                    ...prevState,
                    [`${user_id}-${device_id}`]: "ok",
                }));
            }
        } catch (error) {
            console.error(`Error checking User on Device ${device_id}:`, error);
            setDeviceStatus((prevState) => ({
                ...prevState,
                [`${user_id}-${device_id}`]: "error",
            }));
        }
    };

    useEffect(() => {
        fetchUserDevices();
    }, [condominium]);

    return (
        <PageContainer>
            <HeaderContainer>
                <HeaderTitle>Gerenciamento de Usuários dos Dispositivos</HeaderTitle>
                <AddUserDeviceButton onClick={handleAddUserDevice}>
                    <FaPlus /> Adicionar Usuário a um Dispositivo
                </AddUserDeviceButton>
            </HeaderContainer>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>USER ID</th>
                            <th>Tipo</th>
                            <th>Autoridade</th>
                            <th>Dispositivos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userDevices?.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.user_device}</td>
                                <td>{user.type_display}</td>
                                <td>{user.authority_display}</td>
                                <td>
                                    {user.device.length > 0 ? (
                                        <ul>
                                            {user.device.map((dev) => (
                                                <li key={dev.id}>
                                                    {dev.name} - {dev.ip}
                                                    <VerifyButton
                                                        onClick={() => handleCheckDevice(user.id, dev.id)}
                                                    >
                                                        {deviceStatus[`${user.id}-${dev.id}`] === "ok" ? (
                                                            <FaCheckCircle style={{ color: "#28a745" }} />
                                                        ) : (
                                                            <FaTimesCircle style={{ color: "#e74c3c" }} />
                                                        )}
                                                    </VerifyButton>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        "Nenhum dispositivo"
                                    )}
                                </td>
                                <td>
                                    <ActionButtons>
                                        <button onClick={() => handleEditUserDevice(user)}>
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleDeleteUserDevice(user.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>

            {isModalOpen && (
                <UserDeviceModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    userDevice={selectedUserDevice}
                    condominium_id={condominium.id}
                    refreshList={fetchUserDevices}
                />
            )}
        </PageContainer>
    );
};

export default UserDeviceManagement;
