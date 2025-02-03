import React from 'react';

const ServiceCard = ({ service, costPerOwner, onBook }) => {
  return (
    <div>
      <h2>{service.name}</h2>
      <p>Base Cost: ${service.baseCost}</p>
      <p>Cost per Owner: ${costPerOwner.toFixed(2)}</p>
      <p>Owners Sharing: {service.bookedBy.length}</p>
      <p>Date: {service.date}</p>
      <button onClick={() => onBook("owner1")}>Book Now</button>
    </div>
  );
};

export default ServiceCard;
