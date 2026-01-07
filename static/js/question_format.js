var performanceCtx = document
    .getElementById("questionTypeChart")
    .getContext("2d");

const question_format_data = {
    labels: [
        "Yes-No Questions",
        "Multiple Choice Questions",
        "Summarization Questions",
        "Localization Questions",
        "Closed-Form Questions",
    ],
    datasets: [
        {
            label: "Number of Questions",
            data: [259, 1084, 51, 237, 369],
            backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#ef4444",
            ],
            borderColor: "#111827",
            borderWidth: 1.5,
            borderRadius: {
                topRight: 8,
                bottomRight: 8,
                topLeft: 0,
                bottomLeft: 0,
            },
            borderSkipped: false,
        },
    ],
};

const config = {
    type: "bar",
    data: question_format_data,
    options: {
        indexAxis: "y", // horizontal chart
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#111827",
                titleColor: "#f9fafb",
                bodyColor: "#f9fafb",
                cornerRadius: 6,
                padding: 10,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: "#e5e7eb",
                },
                ticks: {
                    color: "#111827",
                    font: {
                        size: 14,
                    },
                },
                border: {
                    color: "#000000",
                    width: 2,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#111827",
                    font: {
                        size: 14,
                    },
                },
                border: {
                    color: "#000000",
                    width: 2,
                },
            },
        },
    },
};
new Chart(performanceCtx, config);
