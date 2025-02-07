import React from 'react';
import styled from 'styled-components';
import { Doughnut } from 'react-chartjs-2';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
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
    width: 80px;
    height: 80px;
    text-align: center;
    cursor: pointer;
`;

const TittleDoughnut = styled.h3`
    font-size: 15px;
    color: #737373;
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

    const calculateCheckinCheckoutCounts = () => {
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);
    
        let checkinsToday = [];
        let checkoutsToday = [];
    
        apartments.forEach((apartment) => {
            if (apartment.last_reservations) {
                apartment.last_reservations.forEach((reservation) => {
                    const checkinDate = reservation.checkin ? parseISO(reservation.checkin) : null;
                    const checkoutDate = reservation.checkout ? parseISO(reservation.checkout) : null;
    
                    // Check if checkinDate falls within today
                    if (checkinDate && isWithinInterval(checkinDate, { start: todayStart, end: todayEnd }) && !reservation.checkin_at && reservation.active) {
                        checkinsToday.push(apartment);
                    }
    
                    // Check if checkoutDate falls within today
                    if (checkoutDate && isWithinInterval(checkoutDate, { start: todayStart, end: todayEnd }) && reservation.checkin_at && !reservation.checkout_at) {
                        checkoutsToday.push(apartment);
                    }
                });
            }
        });
    
        return { checkinsToday, checkoutsToday };
    };

    const { checkinsToday, checkoutsToday } = calculateCheckinCheckoutCounts();

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
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'checkinsToday', value: checkinsToday });
                }}
            >
                <TittleDoughnut>Entradas</TittleDoughnut>
                <Doughnut
                    data={createDonutData(checkinsToday.length, 'Check-ins Hoje', '#539e56')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                    }}
                />
            </ChartWrapper>
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'checkoutsToday', value: checkoutsToday });
                }}
            >
                <TittleDoughnut>Saídas</TittleDoughnut>
                <Doughnut
                    data={createDonutData(checkoutsToday.length, 'Check-outs Hoje', '#D32F2F')}
                    plugins={[centerTextPlugin]}
                    options={{
                        plugins: {
                            legend: { display: false },
                        },
                        maintainAspectRatio: false,
                    }}
                />
            </ChartWrapper>
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'status', value: 1 });
                }}
            >
                <TittleDoughnut>Ocupados</TittleDoughnut>
                <Doughnut
                    data={createDonutData(statusCounts.occupied, 'Ocupados', '#FF9800')}
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
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'status', value: 0 });
                }}
            >
                <TittleDoughnut>Disponíveis</TittleDoughnut>
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
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'status', value: 2 });
                }}
            >
                <TittleDoughnut>Manutenção</TittleDoughnut>
                <Doughnut
                    data={createDonutData(statusCounts.maintenance, 'Manutenção', '#7c7c7c')}
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
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'type_name', value: 'Temporada' });
                }}
            >
                <TittleDoughnut>Temporada</TittleDoughnut>
                <Doughnut
                    data={createDonutData(typeCounts.temporada, 'Temporada', '#FFEB3B')}
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
            <ChartWrapper
                onClick={() => {
                    onChartClick({ filterType: 'type_name', value: 'Moradia' });
                }}
            >
                <TittleDoughnut>Moradia</TittleDoughnut>
                <Doughnut
                    data={createDonutData(typeCounts.moradia, 'Moradia', '#8e44ad')}
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
