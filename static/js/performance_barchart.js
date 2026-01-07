var performanceCtx = document
    .getElementById("performanceChart")
    .getContext("2d");
performanceCtx.height = 480;

// Dimensions (x-axis)
const labelsMap = {
    "B&TE": "Behavior & Trait Extraction",
    "C&TA": "Conservation & Threat Analysis",
    DI: "Document Interpretation",
    HR: "Hallucination Resistance",
    MTU: "Marine Technology Understanding",
    SR: "Spatial Reasoning",
    SC: "Species Comprehension",
    "Avg.": "Average across Dimensions",
    Total: "Total Score",
};

const labels = ["B&TE", "C&TA", "DI", "HR", "MTU", "SR", "SC", "Avg.", "Total"];
// Data

const colors = {
    fill: [
        "rgba(76,114,176,0.75)", // blue
        "rgba(221,132,82,0.75)", // orange-brown
        "rgba(85,168,104,0.75)", // green
        "rgba(129,114,179,0.75)", // purple
    ],
    border: [
        "rgba(48,79,141,1)", // deeper blue
        "rgba(179,92,47,1)", // deeper orange-brown
        "rgba(55,128,74,1)", // deeper green
        "rgba(96,79,146,1)", // deeper purple
    ],
};

const performance_data = {
    labels: labels,
    datasets: [
        {
            label: "Open-source VLMs",
            data: [
                53.81, 52.77, 37.19, 59.42, 71.19, 21.23, 30.27, 46.14, 39.17,
            ],
            backgroundColor: colors.fill[0],
            borderColor: colors.border[0],
            borderWidth: 1.5,
        },
        {
            label: "Close-source VLMs",
            data: [66.07, 50.34, 46.2, 72.4, 77.64, 27.9, 46.1, 55.18, 48.08],
            backgroundColor: colors.fill[1],
            borderColor: colors.border[1],
            borderWidth: 1.5,
        },
        {
            label: "Human (General Background)",
            data: [68.65, 54.33, 60.17, 82.0, 76.96, 51.5, 31.42, 60.72, 51.75],
            backgroundColor: colors.fill[2],
            borderColor: colors.border[2],
            borderWidth: 1.5,
        },
        {
            label: "Human (Marine Background)",
            data: [75.0, 70.33, 69.67, 83.0, 72.0, 64.0, 57.5, 70.31, 66.35],
            backgroundColor: colors.fill[3],
            borderColor: colors.border[3],
            borderWidth: 1.5,
        },
    ],
};

const legendMargin = {
    id: "legendMargin",
    afterInit(chart, args, plugins) {
        const orginalFit = chart.legend.fit;
        const margin = plugins.margin || 0;
        chart.legend.fit = function fit() {
            if (orginalFit) {
                orginalFit.call(this);
            }
            return (this.height += margin);
        };
    },
};

// Chart configuration
const performanceChart = new Chart(performanceCtx, {
    type: "bar",
    data: performance_data,
    options: {
        responsive: true,

        scales: {
            x: {
                title: {
                    display: true,
                    text: "Task Dimension",
                    color: "#0f3d73",
                    font: { size: 14, weight: "600" },
                },
                ticks: {
                    color: "#1e3a8a",
                    font: { size: 13, weight: "500" },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                suggestedMax: 100,
                title: {
                    display: true,
                    text: "Average Accuracy (%)",
                    color: "#0f3d73",
                    font: { size: 14, weight: "600" },
                },
                ticks: {
                    color: "#1e3a8a",
                    callback: (value) => value + "%",
                },
                grid: { color: "rgba(226,232,240,1)" },
            },
        },
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: { size: 13 },
                    color: "#0f3d73",
                },
            },
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const label = items[0].label;
                        const fullLabel = labelsMap[label];
                        if (fullLabel) {
                            return `${fullLabel} (${label})`;
                        } else {
                            return label;
                        }
                    },
                    label: (ctx) =>
                        `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`,
                },
            },
            legendMargin: {
                margin: 15,
            },
        },

        interaction: {
            mode: "index",
            intersect: false,
        },
        barThickness: "flex",
    },
    plugins: [legendMargin],
});
