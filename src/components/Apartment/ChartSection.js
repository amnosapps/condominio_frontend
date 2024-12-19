import React from 'react';
import styled from 'styled-components';
import { Doughnut } from 'react-chartjs-2';

const ChartContainer = styled.div`
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap; /* Allow charts to wrap to the next row if space is limited */
    margin: 2rem auto;
    gap: 1.5rem; /* Add some space between rows */
    width: 80%;
`;

const ChartWrapper = styled.div`
    width: 150px;
    height: 150px;
    text-align: center;
`;

function ChartSection({ apartments, onChartClick }) {
    const totalApartments = apartments.length;

    const statusCounts = apartments.reduce(
        (acc, apartment) => {
            if (apartment.status === 0) acc.available += 1;
            if (apartment.status === 1) acc.occupied += 1;
            if (apartment.status === 2) acc.maintenance += 1;
            return acc;
        },
        { available: 0, occupied: 0, maintenance: 0 }
    );

    const typeCounts = apartments.reduce(
        (acc, apartment) => {
            if (apartment.type_name === 'Temporada') acc.temporada += 1;
            if (apartment.type_name === 'Moradia') acc.moradia += 1;
            return acc;
        },
        { temporada: 0, moradia: 0 }
    );

    const createDonutData = (count, label, color) => ({
        labels: [label, 'outros'],
        datasets: [
            {
                data: [count, totalApartments - count],
                backgroundColor: [color, '#e9ecef'],
                hoverBackgroundColor: [color, '#e9ecef'],
            },
        ],
    });

    return (
        <ChartContainer>
            {/* Status Charts */}
            <ChartWrapper>
                <h3>Ocupados</h3>
                <Doughnut
                    data={createDonutData(statusCounts.occupied, 'Ocupados', '#ff6384')}
                    options={{
                        plugins: {
                            legend: { display: true, position: 'top' },
                        },
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick(1);
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Disponíveis</h3>
                <Doughnut
                    data={createDonutData(statusCounts.available, 'Disponíveis', '#36a2eb')}
                    options={{
                        plugins: {
                            legend: { display: true, position: 'top' },
                        },
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick(0);
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Manutenção</h3>
                <Doughnut
                    data={createDonutData(statusCounts.maintenance, 'Manutenção', '#ffce56')}
                    options={{
                        plugins: {
                            legend: { display: true, position: 'top' },
                        },
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick(2);
                        },
                    }}
                />
            </ChartWrapper>

            {/* Type Charts */}
            <ChartWrapper>
                <h3>Temporada</h3>
                <Doughnut
                    data={createDonutData(typeCounts.temporada, 'Temporada', '#4caf50')}
                    options={{
                        plugins: {
                            legend: { display: true, position: 'top' },
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Moradia</h3>
                <Doughnut
                    data={createDonutData(typeCounts.moradia, 'Moradia', '#ff9800')}
                    options={{
                        plugins: {
                            legend: { display: true, position: 'top' },
                        },
                    }}
                />
            </ChartWrapper>
        </ChartContainer>
    );
}

export default ChartSection;
