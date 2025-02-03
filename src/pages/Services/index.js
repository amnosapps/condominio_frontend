import React, { useState } from 'react';
import ServiceCard from '../../components/Services/ServiceCard';

const servicesData = [
  {
    id: 1,
    name: "Cleaning Service",
    baseCost: 100,
    bookedBy: [],
    date: "2024-11-20",
  },
  {
    id: 2,
    name: "Gardening Service",
    baseCost: 200,
    bookedBy: [],
    date: "2024-11-21",
  },
];

const ServicesPage = () => {
  const [services, setServices] = useState(servicesData);

  const calculateCostPerOwner = (service) => {
    const totalOwners = service.bookedBy.length || 1;
    return service.baseCost / totalOwners;
  };

  const bookService = (serviceId, ownerId) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, bookedBy: [...service.bookedBy, ownerId] }
          : service
      )
    );
  };

  return (
    <div>
      <h1>Available Services</h1>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          costPerOwner={calculateCostPerOwner(service)}
          onBook={(ownerId) => bookService(service.id, ownerId)}
        />
      ))}
    </div>
  );
};

export default ServicesPage;
