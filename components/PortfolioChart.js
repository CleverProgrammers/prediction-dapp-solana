import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

import React from "react";

const PortfolioChart = ({ data }) => {
  const setGraphColor = () => {
    if (data.percentage < 0) {
      return "#ef4b09";
    } else {
      return "#00ff1a";
    }
  };
  const lineGraph = {
    labels: [
      "May 01, 2023",
      "May 02, 2023",
      "May 03, 2023",
      "May 04, 2023",
      "May 05, 2023",
      "May 08, 2023",
      "May 09, 2023",
      "May 10, 2023",
      "May 11, 2023",
      "May 12, 2023",
    ],
    datasets: [
      {
        fill: false,
        lineTension: 0.01,
        backgroundColor: setGraphColor(),
        borderColor: setGraphColor(),
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: setGraphColor(),
        pointBackgroundColor: setGraphColor(),
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: setGraphColor(),
        pointHoverBorderColor: setGraphColor(),
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: data.data,
      },
    ],
  };
  return <Line data={lineGraph} options={options} width={400} height={150} />;
};

export default PortfolioChart;
