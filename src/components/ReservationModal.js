import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { format, isSameDay, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PhotoCapture from "./PhotoCapture";
import LogsListComponent from "./Logs/LogsVizualization";
import { FaArrowAltCircleRight, FaCheck, FaEdit, FaPlus } from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../services/api";

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  width: 90%;
  max-width: 1000px;
  max-height: 650px;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  /* top: 10px; */
  right: 500px;
  background: none;
  border: none;
  font-size: 40px;
  cursor: pointer;
`;


const GreenButton = styled.button`
  margin: 1px 5px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  background-color: #0056B3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color:rgb(33, 107, 185);
  }
`;

const RedButton = styled.button`
  margin: 1px 5px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const RemoveGuestButton = styled.button`
  /* margin: 5px 5px; */
  padding: 5px 5px;
  background-color: transparent;
  color: white;
  border: none;
  border-radius: 5px;
  /* font-size: 14px; */
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const AddGuestButton = styled.button`
  padding: 10px 10px;
  background-color: #F46600;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background-color: #d89591;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  /* margin-top: 9px; */
  width: 100%;
  padding: 7px;
  font-size: 16px;
  color: #333;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  overflow-y: auto; /* Enables scrolling */
  max-height: 100%; /* Limits dropdown size */

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  &:hover {
    border-color: #555;
  }

  option {
    font-size: 16px;
    color: #333;
  }
`;


const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 15px;
  height: 15px;
  background: ${(props) => (props.checked ? "#28a745" : "white")};
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: all 150ms;
  cursor: pointer;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5);
  }

  &:hover {
    border-color: #999;
  }

  &:after {
    content: "";
    display: ${(props) => (props.checked ? "block" : "none")};
    width: 10px;
    height: 10px;
    margin: 4px;
    background: white;
    border-radius: 2px;
  }
`;

const Label = styled.label`
  margin-left: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const EditableInput = styled.input`
  width: 95%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
`;

const LogsModalContainer = styled.div`
  margin-top: 50px;
  background-color: white;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const LogsButton = styled.button`
  margin: 1px 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;


const LogsModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const CloseLogsButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;


const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1px;
  flex-wrap: wrap;
`;

const Column = styled.div`
  flex: 1;
  margin-right: 15px;
  min-width: 150px; /* Ensure columns are responsive */
`;

const FieldLabel = styled.strong`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: #555;

  .custom-date-picker {
    width: 180px; /* Larger width for the input */
    padding: 8px 10px; /* Add padding for larger clickable area */
    font-size: 16px; /* Bigger font for readability */
    border-radius: 6px; /* Rounded corners for better appearance */
    border: 1px solid #ccc; /* Subtle border for distinction */
    outline: none;
  }
`;

const Badge = styled.span`
  margin-left: 10px;
  display: inline-block;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  background-color: ${(props) => (props.active ? "#28a745" : "#dc3545")};
`;

const ReservationModal = ({
  closeModal,
  selectedReservation,
  fetchReservations,
  selectedApartment,
  profile,
  selectedCondominium
}) => {
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [reservationData, setReservationData] = useState({
    checkin: selectedReservation?.checkin ? new Date(selectedReservation.checkin) : null,
    checkout: selectedReservation?.checkout ? new Date(selectedReservation.checkout) : null,
    guest_name: selectedReservation?.guest_name || "",
    observations: selectedReservation?.observations || "",
    guest_document: selectedReservation?.guest_document || "",
    document_type: selectedReservation?.document_type || "",
    guest_phone: selectedReservation?.guest_phone || "", // Handle null values
    guests_qty: selectedReservation?.guests_qty || 0,
    apartment: selectedReservation?.apt_number || "", // Optional apartment number
    apartment_owner: selectedReservation?.apartment_owner || "", // Optional apartment owner name
    hasChildren: selectedReservation?.hasChildren || "no",
    photos: selectedReservation?.photos || "", // Main photo URL
    additional_photos: selectedReservation?.additional_photos || [], // Additional photos array
    checkin: selectedReservation?.checkin || null, // Check-in timestamp
    checkout: selectedReservation?.checkout || null, // Checkout timestamp
    checkin_at: selectedReservation?.checkin_at || null, // Check-in timestamp
    checkout_at: selectedReservation?.checkout_at || null, // Checkout timestamp
    address: selectedReservation?.address || {
      endereco: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      pais: "",
    },
    vehicle_plate: selectedReservation?.vehicle_plate || "",
    additional_guests: selectedReservation?.additional_guests || [],
    reservation_file: selectedReservation?.reservation_file || "",
  });

  const [hasCar, setHasCar] = useState(!!selectedReservation?.vehicle_plate);
  const [vehiclePlate, setVehiclePlate] = useState(
    selectedReservation?.vehicle_plate || ""
  );
  
  const [additionalGuests, setAdditionalGuests] = useState(() => {
    const qty = selectedReservation?.guests_qty ? selectedReservation.guests_qty : 0; 
    return selectedReservation?.additional_guests.length > 0 
      ? selectedReservation.additional_guests.map((guest) => ({
          name: guest.name || "",
          document: guest.document || "",
          document_type: guest.document_type || "",
          age: guest.age || 0,
          is_child: guest.is_child || false,
        }))
      : Array.from({ length: qty }, () => ({
          name: "",
          document: "",
          document_type: "",
          age: 0,
          is_child: false,
        }));
  });

  const [maxGuests, setMaxGuests] = useState(selectedApartment ? selectedApartment.max_occupation : 1);
  
  const [address, setAddress] = useState(reservationData.address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(
        `/api/logs/`, // Replace with your actual logs endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { object_id: selectedReservation.id, model_name: "Reservation" },
        }
      );
      setLogs(response.data);
      setIsLogsOpen(true); // Open the logs modal
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to load logs. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHasCarChange = (e) => {
    const checked = e.target.checked;
    setHasCar(checked);
    if (!checked) {
      setVehiclePlate(""); // Clear vehicle plate if no car
      handleChange("vehicle_plate", ""); // Sync with reservationData
    }
  };

  const addAdditionalGuest = () => {
    setAdditionalGuests((prev) => [
      ...prev,
      { name: "", document: "", age: 0, is_child: false },
    ]);
  };

  const removeAdditionalGuest = (index) => {
    setAdditionalGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGuestDetails = (index, field, value) => {
    setAdditionalGuests((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value, // Update only the specified field
      };
      return updated;
    });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "$1 $2-$3").trim();
    }
    handleChange("guest_phone", value);
  };

  const handleUpdateReservation = async () => {
    if (!window.confirm("Você tem certeza que deseja atualizar as informações?")) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    // Append updated reservation data
    if (reservationData.checkin != selectedReservation.checkin) {
      formData.append("checkin", new Date(reservationData.checkin).toISOString());
    }

    if (reservationData.checkout != selectedReservation.checkout) {
      formData.append("checkout", new Date(reservationData.checkout).toISOString());
    }
    
    formData.append("observations", reservationData.observations);
    formData.append("guest_name", reservationData.guest_name);
    formData.append("guest_document", reservationData.guest_document);
    formData.append("document_type", reservationData.document_type);
    formData.append("guest_phone", reservationData.guest_phone || "");
    formData.append("guests_qty", reservationData.guests_qty);
    formData.append("has_children", additionalGuests.some((guest) => guest.is_child));
  
    // Debugging Address Data
    console.log("Address Data:", address);
    formData.append("address", JSON.stringify(address));
  
    // Vehicle plate if applicable
    if (hasCar) {
      console.log("Appending vehicle_plate:", vehiclePlate);
      formData.append("vehicle_plate", vehiclePlate);
    }
  
    // Append additional guests
    console.log("Additional Guests:", additionalGuests);
    formData.append("additional_guests", JSON.stringify(additionalGuests));
  
    // Debugging FormData Content
    console.log("FormData Content:");
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await api.patch(
        `/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        alert("Informações atualizadas com sucesso!");
      } else {
        alert("Falha ao atualizar as informações. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a reserva:", error);
      alert("Erro ao atualizar as informações. Verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false)
      fetchReservations(1, "right", false)
    }
  };

  const handleSaveCheckin = async () => {
    // Validate required fields
    const requiredFields = [
      { field: reservationData.guest_name, label: "Nome do hóspede" },
      { field: reservationData.guest_document, label: "Documento do hóspede" },
      { field: reservationData.document_type, label: "Tipo de documento" },
      { field: reservationData.guest_phone, label: "Contato do hóspede" },
      { field: reservationData.checkin, label: "Data de entrada" },
      { field: reservationData.checkout, label: "Data de saída" },
    ];
  
    const requiredAddressFields = [
      { field: address.endereco, label: "Endereço" },
      { field: address.bairro, label: "Bairro" },
      { field: address.cep, label: "CEP" },
      { field: address.cidade, label: "Cidade" },
      { field: address.estado, label: "Estado" },
      { field: address.pais, label: "País" },
    ];
  
    const missingFields = requiredFields.filter((item) => !item.field);
    const missingAddressFields = requiredAddressFields.filter((item) => !item.field);
  
    if (missingFields.length > 0 || missingAddressFields.length > 0) {
      const missingFieldLabels = [...missingFields, ...missingAddressFields]
        .map((item) => item.label)
        .join(", ");
      alert(`Os seguintes campos são obrigatórios: ${missingFieldLabels}`);
      return;
    }
  
    const confirmMessage = reservationData.checkin_at
      ? "Você tem certeza que deseja atualizar as informações?"
      : "Você tem certeza que deseja fazer o checkin?";
    if (!window.confirm(confirmMessage)) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    const formattedCheckinAt = reservationData.checkin_at
      ? new Date(reservationData.checkin_at).toISOString()
      : new Date().toISOString();
  
    const hasChildren = additionalGuests.some((guest) => guest.is_child);
  
    if (hasChildren && reservationData.additional_photos.length === 0) {
      alert("Você deve adicionar pelo menos uma foto se houver crianças na reserva.");
      setIsSubmitting(false);
      return;
    }
  
    // Append reservation data to formData
    formData.append("observations", reservationData.observations);
    formData.append("guest_name", reservationData.guest_name);
    formData.append("guest_document", reservationData.guest_document);
    formData.append("document_type", reservationData.document_type);
    formData.append("guest_phone", reservationData.guest_phone || "");
    formData.append("guests_qty", reservationData.guests_qty);
    formData.append("has_children", hasChildren);
    formData.append("checkin_at", formattedCheckinAt);
  
    // Append Address information
    formData.append("address", JSON.stringify(address));
  
    // Append Vehicle Plate if the user has a car
    if (hasCar) {
      formData.append("vehicle_plate", vehiclePlate);
    }
  
    // Append Additional Guests
    formData.append("additional_guests", JSON.stringify(additionalGuests));
  
    console.log(reservationData.additional_photos);
    const photos = reservationData.additional_photos.map(async (photoUrl, index) => {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      return new File([blob], `photo-${index}.jpg`, { type: blob.type });
    });
  
    const photoFiles = await Promise.all(photos);
  
    photoFiles.forEach((file) => {
      formData.append("additional_photos", file);
    });
  
    try {
      const response = await api.patch(
        `/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Informações salvas com sucesso!");
        fetchReservations(1, "right", false);
        closeModal();
        sessionStorage.setItem("reopenModalId", selectedReservation.id);
      } else {
        alert("Falha ao salvar as informações. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a reserva:", error);
  
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(`Erro no servidor: ${error.response.status}. Mensagem: ${error.response.data.detail || "Erro desconhecido"}`);
      } else if (error.request) {
        console.error("Request data:", error.request);
        alert("Erro na comunicação com o servidor. Verifique sua conexão.");
      } else {
        console.error("Error message:", error.message);
        alert(`Erro inesperado: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };
  
  const handleCheckout = async () => {
    if (!window.confirm("Você tem certeza que deseja fazer o checkout?")) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    formData.append("checkout_at", new Date().toISOString());
    console.log("FormData:", formData);
  
    api
      .patch(
        `/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log("Response received:", response);
        if (response.status === 200) {
          alert("Checkout realizado com sucesso!");
          fetchReservations(1, "right", false)
          closeModal();
          sessionStorage.setItem("reopenModalId", selectedReservation.id);
        } else {
          console.error("Unexpected response status:", response.status);
          alert("Falha ao realizar o checkout. Tente novamente.");
        }
      })
      .catch((error) => {
        console.error("Erro completo:", error);
  
        // Handle server response errors
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          alert(
            `Erro no servidor: ${error.response.status}. Mensagem: ${error.response.data.detail || "Erro desconhecido"}`
          );
        } else if (error.request) {
          // Handle no response received
          console.error("Request data:", error.request);
          alert("Erro na comunicação com o servidor. Verifique sua conexão.");
        } else {
          // Handle other errors
          console.error("Error message:", error.message);
          alert(`Erro inesperado: ${error.message}`);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteReservation = async () => {
    if (!window.confirm("Você tem certeza que deseja excluir esta reserva?")) return;

    const token = localStorage.getItem("accessToken");

    try {
      await api.delete(
        `/api/reservations/${selectedReservation.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Reserva excluída com sucesso!");
      fetchReservations(1, "right", false);
      closeModal();
    } catch (error) {
      console.error("Erro ao excluir a reserva:", error);
      alert("Erro ao excluir a reserva. Tente novamente.");
    } finally {
      fetchReservations(1, "right", false)
    }
  };

  const handleDateChange = (field, date) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const updatePhotos = (photos) => {
    setReservationData((prev) => ({
      ...prev,
      additional_photos: photos,
    }));
  };

  const closeModal1 = () => {
    closeModal();
  };

  const generateDocumentPdf = () => {
    const {
      id,
      guest_name,
      guest_document,
      guest_phone,
      checkin,
      checkout,
      observations,
      address,
      vehicle_plate,
      additional_guests,
      apartment,
      apartment_owner,
    } = reservationData;
  
    const doc = new jsPDF();
  
    // Set document title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Reserva #${selectedReservation.id}`, 105, 20, null, null, "center");
  
    // Condominium and Apartment Information
    doc.setFontSize(14);
    doc.text("Condomínio", 10, 30);
    doc.setFont("helvetica", "normal");
    doc.text(`Condomínio: ${selectedCondominium || "N/A"}`, 10, 40);
    doc.text(`Apartamento: ${apartment || "N/A"}`, 10, 50);
    if (apartment_owner) {
      doc.text(`Proprietário: ${apartment_owner}`, 10, 60);
    }
  
    // Add a divider
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(10, 65, 200, 65);
  
    // Add basic information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Informações Gerais", 10, 75);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Hóspede: ${guest_name}`, 10, 85);
    doc.text(`Documento: ${guest_document}`, 10, 95);
    doc.text(`Contato: ${guest_phone || "N/A"}`, 10, 105);
    doc.text(`Check-in: ${format(new Date(checkin), "dd/MM/yyyy")}`, 10, 115);
    doc.text(`Check-out: ${format(new Date(checkout), "dd/MM/yyyy")}`, 10, 125);
  
    // Add observations
    doc.setFont("helvetica", "bold");
    doc.text("Observações", 10, 135);
    doc.setFont("helvetica", "normal");
    doc.text(observations || "Nenhuma observação.", 10, 145);
  
    // Add address
    doc.setFont("helvetica", "bold");
    doc.text("Endereço", 10, 155);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${address.endereco || "N/A"}, ${address.bairro || "N/A"}, ${address.cidade || "N/A"}, ${address.estado || "N/A"}, ${address.pais || "N/A"} (${address.cep || "N/A"})`,
      10,
      165
    );
  
    // Add vehicle information
    if (vehicle_plate) {
      doc.setFont("helvetica", "bold");
      doc.text("Veículo", 10, 175);
      doc.setFont("helvetica", "normal");
      doc.text(`Placa: ${vehicle_plate}`, 10, 185);
    }
  
    // Add additional guests
    if (additional_guests.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Hóspedes Adicionais", 10, 195);
      additional_guests.forEach((guest, index) => {
        doc.setFont("helvetica", "normal");
        doc.text(
          `${index + 1}. ${guest.name || "N/A"} - ${guest.document || "N/A"} (${
            guest.is_child ? "Criança" : "Adulto"
          })`,
          10,
          205 + index * 10
        );
      });
    }
  
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Documento gerado automaticamente.",
      105,
      290,
      null,
      null,
      "center"
    );
  
    // Save the PDF
    doc.save(`${selectedCondominium}_reserva_${selectedReservation.id}_${apartment}.pdf`);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const isCheckinToday = reservationData.checkin
    ? isSameDay(new Date(), reservationData.checkin) // Use the Date object directly
    : false;

  const isCheckinPassed = reservationData.checkin
    ? isBefore(new Date(), reservationData.checkin) // Check if it's a past date
    : false;

  const canCheckin = reservationData.checkin && reservationData.checkout
    ? isBefore(new Date(), reservationData.checkout) && isAfter(new Date(), reservationData.checkin)// Check if check-in is before checkout
    : false;

  if (!selectedReservation) return null;

  const handleCancelReservation = async () => {
    const confirmCancel = window.confirm(
      "Você tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
    );
    if (!confirmCancel) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("active", false);
  
    try {
      const response = await api.patch(
        `/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Reserva cancelada com sucesso!");
        fetchReservations(1, "right", false); // Refresh reservations
        closeModal(); // Close the modal
      } else {
        alert("Falha ao cancelar a reserva. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao cancelar a reserva:", error);
      alert("Erro ao cancelar a reserva. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleReactivateReservation = async () => {
    const confirmReactivate = window.confirm(
      "Você tem certeza que deseja reativar esta reserva?"
    );
    if (!confirmReactivate) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("active", true);
  
    try {
      const response = await api.patch(
        `/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Reserva reativada com sucesso!");
        fetchReservations(1, "right", false); // Refresh reservations
        closeModal(); // Close the modal
      } else {
        alert("Falha ao reativar a reserva. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao reativar a reserva:", error);
      alert("Erro ao reativar a reserva. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  console.log(selectedReservation.active)
  return (
    <ModalOverlay onClick={closeModal1}>
      <ModalContainer onClick={(e) => e.stopPropagation()} className="modal-container">
        <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", margin: '1px 0px' }}>
            <a onClick={generateDocumentPdf} style={{ color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>
              <img
                  src="/download-pdf.png"
                  alt="PDF Reserva"
                  style={{ width: "30px", height: "auto", cursor: "pointer" }}
                />
            </a>
          </div>
          <div><strong style={{ fontSize: '20px' }}>#{selectedReservation.id} - Apto {reservationData.apartment}</strong></div>
          {!selectedReservation.active && (
            <Badge active={selectedReservation.active}>
              {selectedReservation.active ? "Ativo" : "Cancelado"}
            </Badge>
          )}
          <CloseButton onClick={closeModal1}>&times;</CloseButton>
        </div>
        <div>
          {isLogsOpen && (
            <LogsModalOverlay onClick={() => setIsLogsOpen(false)}>
              <LogsModalContainer onClick={(e) => e.stopPropagation()}>
                <CloseLogsButton onClick={() => setIsLogsOpen(false)}>X</CloseLogsButton>
                <h3>Logs da Reserva</h3>
                <LogsListComponent logs={logs} />
              </LogsModalContainer>
            </LogsModalOverlay>
          )}
        </div>

        {profile?.user_type === 'owner' || profile?.user_type === 'admin' ? (
          <>
            <Row style={{ alignItems: "center", marginBottom: '1px' }}>
              <Column>
                <FieldLabel>Data de Entrada:</FieldLabel>
                <FieldValue>
                  <DatePicker
                    selected={reservationData.checkin}
                    onChange={(date) => handleDateChange("checkin", date)}
                    dateFormat="dd/MM/yyyy"
                    disabled={!isEditing}
                     className="custom-date-picker"
                  />
                </FieldValue>
              </Column>
              <Column>
                <FieldLabel>Data de Saída:</FieldLabel>
                <FieldValue>
                  <DatePicker
                    selected={reservationData.checkout}
                    onChange={(date) => handleDateChange("checkout", date)}
                    dateFormat="dd/MM/yyyy"
                    disabled={!isEditing}
                     className="custom-date-picker"
                  />
                </FieldValue>
              </Column>
            </Row>
          </>
        ) : (
          <Row style={{ alignItems: "center", gap: "2px" }}>
              <Column>
                <FieldLabel>Data de Entrada:</FieldLabel>
                <FieldValue>
                  <DatePicker
                    selected={selectedReservation.checkin}
                    dateFormat="dd/MM/yyyy"
                    disabled={true}
                     className="custom-date-picker"
                  />
                </FieldValue>
              </Column>
              <Column>
                <FieldLabel>Data de Saída:</FieldLabel>
                <FieldValue>
                  <DatePicker
                    selected={selectedReservation.checkout}
                    dateFormat="dd/MM/yyyy"
                    disabled={true}
                     className="custom-date-picker"
                  />
                </FieldValue>
              </Column>
            </Row>
        )}

        {/* Guest Information */}
        <Row>
          <Column>
            <FieldLabel>Nome:</FieldLabel>
            <FieldValue>
              <EditableInput
                disabled={!isEditing} 
                type="text"
                value={reservationData.guest_name}
                onChange={(e) => handleChange("guest_name", e.target.value)}
              />
            </FieldValue>
          </Column>

          <Column>
            <FieldLabel>Contato:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={reservationData.guest_phone || ""}
                onChange={handlePhoneChange}
                placeholder="88 88888-8888"
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>

          <Column>
            <FieldLabel>Tipo de Documento:</FieldLabel>
            <FieldValue>
              <StyledSelect
                value={reservationData.document_type || ""}
                onChange={(e) => handleChange("document_type", e.target.value)}
                disabled={!isEditing} 
              >
                <option value="">Selecione</option>
                <option value="cpf">CPF</option>
                <option value="passport">Passaporte</option>
              </StyledSelect>
            </FieldValue>
          </Column>
          
          <Column>
            <FieldLabel>Documento:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={reservationData.guest_document}
                onChange={(e) => handleChange("guest_document", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          
          <Column>
            <FieldLabel>Acompanhantes:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={reservationData.guests_qty}
                onChange={(e) => handleChange("guests_qty", e.target.value)}
                disabled={true}
              />
            </FieldValue>
          </Column>
          {hasCar && (
            <Column>
              <FieldLabel>Placa do Veículo:</FieldLabel>
              <FieldValue>
                <EditableInput
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  disabled={!isEditing} 
                />
              </FieldValue>
            </Column>
          )}
        </Row>
        <div style={{ marginBottom: '10px', marginTop: '5px' }}>
          <CheckboxContainer>
            <HiddenCheckbox
              checked={hasCar}
              onChange={handleHasCarChange}
              disabled={!isEditing} 
            />
            <StyledCheckbox
              checked={hasCar}
              onClick={() => {
                if (!isEditing) return; // Ignore clicks if disabled
                handleHasCarChange({ target: { checked: !hasCar } });
              }}
              disabled={!isEditing} 
            />
            <Label>Tem veículo?</Label>
          </CheckboxContainer>
        </div>  
        <Row>
          <Column>
            <FieldLabel>Endereço:</FieldLabel>
            <FieldValue>
              <EditableInput
              type="text"
              value={address.endereco || ""}
              onChange={(e) => handleAddressChange("endereco", e.target.value)}
              disabled={!isEditing} 
            />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>Bairro:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.bairro || ""}
                onChange={(e) => handleAddressChange("bairro", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>CEP:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.cep || ""}
                onChange={(e) => handleAddressChange("cep", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
        {/* </Row>
        <Row> */}
          <Column>
            <FieldLabel>Cidade:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.cidade || ""}
                onChange={(e) => handleAddressChange("cidade", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>Estado:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.estado || ""}
                onChange={(e) => handleAddressChange("estado", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>País:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.pais || ""}
                onChange={(e) => handleAddressChange("pais", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
        </Row>

        <Row>
          <Column>
            <FieldLabel>Observações:</FieldLabel>
            <FieldValue>
              <textarea
                value={reservationData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                disabled={!isEditing}
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  resize: "vertical", // Allow resizing only vertically
                }}
                placeholder="Adicione observações sobre a reserva"
              />
            </FieldValue>
          </Column>
        </Row>
            
        <div>
          {additionalGuests.map((guest, index) => (
            <div key={index} style={{ margin: '15px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Hóspede Adicional:</strong>
                <RemoveGuestButton onClick={() => removeAdditionalGuest(index)} disabled={!isEditing} >
                  <img width={20} src="/trash.png" />
                </RemoveGuestButton>
              </div>
              
              <Row>
                <Column>
                  <EditableInput
                    type="text"
                    placeholder="Nome"
                    value={guest.name}
                    onChange={(e) => updateGuestDetails(index, "name", e.target.value)}
                    disabled={!isEditing} 
                  />
                </Column>
                <Column>
                  <FieldValue>
                    <StyledSelect
                      value={guest.document_type}
                      onChange={(e) => updateGuestDetails(index, "document_type", e.target.value)}
                      disabled={!isEditing} 
                    >
                      <option value="">Tipo Documento</option>
                      <option value="cpf">CPF</option>
                      <option value="passport">Passaporte</option>
                    </StyledSelect>
                  </FieldValue>
                </Column>
                <Column>
                  <EditableInput
                    type="text"
                    placeholder="Num Documento"
                    value={guest.document}
                    onChange={(e) =>
                      updateGuestDetails(index, "document", e.target.value)
                    }
                    disabled={!isEditing} 
                  />
                </Column>
                <Column>
                  {guest.is_child && (
                    <>
                      <StyledSelect
                        value={guest.age}
                        onChange={(e) =>
                          updateGuestDetails(index, "age", parseInt(e.target.value, 10))
                        }
                        disabled={!isEditing} 
                      >
                        <option value="">Idade</option>
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </StyledSelect>
                    </>
                  )}
                </Column>
              </Row>
              <div>
                <CheckboxContainer>
                  <HiddenCheckbox
                    checked={guest.is_child}
                    onChange={(e) =>
                      updateGuestDetails(index, "is_child", e.target.checked)
                    }
                    disabled={!isEditing} 
                  />
                  <StyledCheckbox
                    checked={guest.is_child}
                    onClick={() =>
                      updateGuestDetails(index, "is_child", !guest.is_child)
                    }
                    disabled={!isEditing} 
                  />
                  <Label>É menor de idade?</Label>
                </CheckboxContainer>
              </div>
            </div>
          ))}
          <AddGuestButton onClick={addAdditionalGuest} disabled={!isEditing}
            style={{
                backgroundColor: !isEditing ? 'grey' : '#28a745', // Grey if not today
                cursor: !isEditing ? 'not-allowed' : 'pointer',   // Change cursor style
            }}
          >
            <FaPlus style={{ marginRight: '7px' }} />
            Hóspedes
          </AddGuestButton>
        </div>

        <PhotoCapture
          existingPhotos={reservationData.additional_photos}
          onPhotosChange={updatePhotos}
        />
        <div style={{ display: "flex", justifyContent: "start", gap: "10px" }}>
          {!isEditing ? (
            <GreenButton onClick={toggleEditing} disabled={reservationData.checkin_at}
              style={{
                  backgroundColor: reservationData.checkin_at? 'grey' : '#0056B3', // Grey if not today
                  cursor: reservationData.checkin_at? 'not-allowed' : 'pointer',   // Change cursor style
              }}
            >
              {"Editar"}
              <FaEdit style={{ marginLeft: '7px' }} />
            </GreenButton>
          ) : (
            <GreenButton onClick={handleUpdateReservation} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </GreenButton>
          )}
          
          {reservationData.checkin_at ? (
            <>
              {reservationData.checkout_at ? (
                <RedButton style={{ backgroundColor: 'grey' }} disabled={true}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                  <FaArrowAltCircleRight style={{ marginLeft: '7px' }} />
                </RedButton>
              ) : (
                <RedButton onClick={handleCheckout} disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                  <FaArrowAltCircleRight style={{ marginLeft: '7px' }} />
                </RedButton>
              )}
            </>
          ) : (
            <GreenButton
              onClick={() => {
                  if (!isCheckinToday && canCheckin) {
                      const confirmCheckin = window.confirm(
                          "O check-in não é para hoje. Tem certeza que deseja realizar o check-in fora da data?"
                      );
                      if (!confirmCheckin) return;
                  }
                  handleSaveCheckin();
              }}
              disabled={isSubmitting || (!isCheckinToday && !canCheckin)}
              style={{
                  backgroundColor: 
                      isCheckinToday ? '#28a745' // Green for today
                      : canCheckin ? '#dc3545' // Red for past check-ins
                      : 'grey',   // Grey if not allowed
                  cursor: isSubmitting || (!isCheckinToday && !canCheckin) ? 'not-allowed' : 'pointer',
              }}
          >
              {isSubmitting  ? "Enviando..."
                : isCheckinToday ? "Checkin"
                : canCheckin ? "Checkin"
                : "Checkin"}
              <FaCheck style={{ marginLeft: '7px' }} />
          </GreenButton>
          )}
          <LogsButton onClick={fetchLogs}>Auditoria</LogsButton> 
          
          {profile?.user_type === "owner" || profile?.user_type === "admin" ? (
            !selectedReservation.active ? (
              <GreenButton 
                onClick={handleReactivateReservation} 
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? "grey" : "#28a745", // Green for active
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Processando..." : "Reativar Reserva"}
              </GreenButton>
            ) : (
              <RedButton 
                onClick={handleCancelReservation} 
                disabled={isSubmitting || !selectedReservation.active} 
                style={{
                  backgroundColor: !selectedReservation.active ? "grey" : "#dc3545", // Grey while submitting
                  cursor: !selectedReservation.active ? "not-allowed" : "pointer",  // Disabled cursor during submission
                }}
              >
                {!selectedReservation.active ? "Cancelado" : "Cancelar Reserva"}
              </RedButton>
            )
          ) : null}
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReservationModal;
