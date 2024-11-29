import React, { useState } from 'react';

const Dashboard = ({ services }) => {
  const [paymentStatuses, setPaymentStatuses] = useState(
    services.reduce((acc, service) => {
      acc[service.id] = "retained"; // Initialize all payments as retained
      return acc;
    }, {})
  );

  const completeService = (serviceId) => {
    setPaymentStatuses((prev) => ({
      ...prev,
      [serviceId]: "released",
    }));
  };

  return (
    <div>
      <h1>Service Provider Dashboard</h1>
      {services.map((service) => (
        <div key={service.id}>
          <h2>{service.name}</h2>
          <p>Payment Status: {paymentStatuses[service.id]}</p>
          {paymentStatuses[service.id] === "retained" && (
            <button onClick={() => completeService(service.id)}>Complete Service</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
