function getRandomLightColor() {
    const r = Math.floor(Math.random() * 156) + 100;
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgba(${r}, ${g}, ${b}, 1)`;
}

const randomColors = Array.from({ length: 55 }, getRandomLightColor);

document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.chartData === "undefined") {
        console.error("Chart data is not available.");
        return;
    }

    const { goodReviews, badReviews, tourData, fullnameData } = window.chartData;

    // Good vs Bad Reviews Pie Chart
    if (document.getElementById('reviewChart')) {
        new Chart(document.getElementById('reviewChart'), {
            type: 'doughnut',
            data: {
                labels: ['Good Reviews', 'Bad Reviews'],
                datasets: [{
                    data: [goodReviews, badReviews],
                    backgroundColor: ['#6495ED', '#CCCCFF'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false
            }
        });
    }

    if (Array.isArray(tourData)) {
        const aggregatedTourData = tourData.reduce((acc, curr) => {
            if (!acc[curr.tour]) {
                acc[curr.tour] = { sum: 0, count: 0 };
            }
            acc[curr.tour].sum += curr.rating;
            acc[curr.tour].count += 1;
            return acc;
        }, {});

        const tourLabels = Object.keys(aggregatedTourData);
        const avgTourRatings = tourLabels.map(tour => aggregatedTourData[tour].sum / aggregatedTourData[tour].count);

        if (document.getElementById('myChart')) {
            new Chart(document.getElementById('myChart'), {
                type: 'bar',
                data: {
                    labels: tourLabels,
                    datasets: [{
                        label: 'Average Tour Ratings',
                        data: avgTourRatings,
                        borderColor: 'rgba(100, 149, 237, 1)',
                        backgroundColor: 'rgba(100, 149, 237, 0.4)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, min: 0, max: 5 }
                    }
                }
            });
        }
    }

    if (Array.isArray(fullnameData)) {
        const aggregatedHotelData = fullnameData.reduce((acc, curr) => {
            if (!acc[curr.fullname]) {
                acc[curr.fullname] = { sum: 0, count: 0 };
            }
            acc[curr.fullname].sum += curr.rating;
            acc[curr.fullname].count += 1;
            return acc;
        }, {});

        const hotelLabels = Object.keys(aggregatedHotelData);
        const avgHotelRatings = hotelLabels.map(fullname => aggregatedHotelData[fullname].sum / aggregatedHotelData[fullname].count);

        if (document.getElementById('Hotel')) {
            new Chart(document.getElementById('Hotel'), {
                type: 'line',
                data: {
                    labels: hotelLabels,
                    datasets: [{
                        label: 'Average Users Ratings',
                        data: avgHotelRatings,
                        borderColor: 'rgba(100, 149, 237, 1)',
                        backgroundColor:randomColors,
                        borderWidth: 2,
                        fill: false,
                        pointHoverRadius: 12, 
                        pointBackgroundColor: 'rgba(100, 149, 237, 0.3)',
                        pointBorderColor: 'rgba(100, 149, 237, 1)', 
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, min: 0, max: 5 }
                    }
                }
            });
        }
    }
});
