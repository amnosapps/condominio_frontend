import React from 'react';
import styled from 'styled-components';
import { Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const ChartContainer = styled.div`
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap; /* Allow charts to wrap to the next row if space is limited */
    margin: 2rem auto;
    gap: 1.5rem; /* Add some space between rows */
    width: 80%;
`;

const ChartWrapper = styled.div`
    width: 120px;
    height: 120px;
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
        labels: [label, 'Outros'],
        datasets: [
            {
                data: [count, totalApartments - count],
                backgroundColor: [color, '#e9ecef'],
                hoverBackgroundColor: [color, '#e9ecef'],
            },
        ],
    });

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
            const { ctx, width, height } = chart;
            const count = chart.data.datasets[0].data[0];
            ctx.save();
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count, width / 2, height / 2);
            ctx.restore();
        },
    };

    return (
        <ChartContainer>
            {/* Status Charts */}
            <ChartWrapper>
                <h3>Ocupados</h3>
                <Doughnut
                    data={createDonutData(statusCounts.occupied, 'Ocupados', '#ff6384')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false }, // Hide legend for better focus on count
                        },
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick({ filterType: 'status', value: 1 });
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Disponíveis</h3>
                <Doughnut
                    data={createDonutData(statusCounts.available, 'Disponíveis', '#36a2eb')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick({ filterType: 'status', value: 0 });
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Manutenção</h3>
                <Doughnut
                    data={createDonutData(statusCounts.maintenance, 'Manutenção', '#ffce56')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick({ filterType: 'status', value: 2 });
                        },
                    }}
                />
            </ChartWrapper>

            {/* Type Charts */}
            <ChartWrapper>
                <h3>Temporada</h3>
                <Doughnut
                    data={createDonutData(typeCounts.temporada, 'Temporada', '#4caf50')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick({ filterType: 'type_name', value: 'Temporada' });
                        },
                    }}
                />
            </ChartWrapper>
            <ChartWrapper>
                <h3>Moradia</h3>
                <Doughnut
                    data={createDonutData(typeCounts.moradia, 'Moradia', '#ff9800')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if (elements.length > 0) onChartClick({ filterType: 'type_name', value: 'Moradia' });
                        },
                    }}
                />
            </ChartWrapper>
        </ChartContainer>
    );
}

export default ChartSection;
