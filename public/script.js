document.addEventListener("DOMContentLoaded", () => {
    let chart,
    currentView = "happiest",
    currentChartType = "line",
    chartDataCache = null;

    const fetchDataAndRenderChart = (showHappiest) => {
        if (!chartDataCache) {
        fetch("/data")
            .then((response) => response.json())
            .then((data) => {
            chartDataCache = processData(data);
            renderChart(showHappiest, chartDataCache);
            })
            .catch((error) => console.error("Error fetching data:", error));
        } 
        else {
        renderChart(showHappiest, chartDataCache);
        }
    };

    const processData = (data) => {
        const groupedData = {};
        data.forEach((row) => {
        row.Year = Number(row.Year);
        row.Index = Number(row.Index);
        row.Rank = Number(row.Rank);
        if (!groupedData[row.Year]) groupedData[row.Year] = [];
        groupedData[row.Year].push(row);
        });

        return { originalData: data, groupedData };
    };

    const renderChart = (showHappiest, chartData) => {
        const { originalData, groupedData } = chartData;
        const data2023 = originalData
        .filter((row) => row.Year === 2023 && row.Rank !== "NULL")
        .map((row) => ({ ...row, Rank: Number(row.Rank) }))
        .filter((row) => !isNaN(row.Rank))
        .sort((a, b) => a.Rank - b.Rank);

        const top10Countries2023 = showHappiest
        ? data2023.slice(0, 10)
        : data2023.slice(-10).reverse();

        const top10CountryNames = top10Countries2023.map((row) => row.Country);
        const years = [...new Set(originalData.map((row) => row.Year))].sort((a, b) => a - b);

        const datasets = top10CountryNames.map((country, index) => ({
        label: country,
        data: years.map((year) => {
            const entry = groupedData[year].find((row) => row.Country === country);
            return entry ? entry.Index : null;
        }),

        fill: false,
        borderColor: getColor(index),
        backgroundColor: getColor(index),
        borderWidth: 2,
        }));

        if (chart) chart.destroy();

        chart = new Chart(
        document.getElementById("happinessChart").getContext("2d"),
        {
            type: currentChartType,
            data: { labels: years, datasets },
            options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Year",
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 45,
                    },
                    },
                    y: {
                    title: {
                        display: true,
                        text: "Happiness Index",
                    },
                    ticks: { autoSkip: false, },
                    },
                },
                plugins: {
                    legend: {
                    display: true,
                    position: "top",
                    },
                },
                },
            }
            );
        //Make table
        //populateTable(originalData);
    };

  document.getElementById("happiestButton").addEventListener("click", () => {
    if (currentView !== "happiest") {
      fetchDataAndRenderChart(true);
      currentView = "happiest";
      document.getElementById("happiestButton").classList.add("active");
      document.getElementById("saddestButton").classList.remove("active");
    }
  });

  document.getElementById("saddestButton").addEventListener("click", () => {
    if (currentView !== "saddest") {
      fetchDataAndRenderChart(false);
      currentView = "saddest";
      document.getElementById("saddestButton").classList.add("active");
      document.getElementById("happiestButton").classList.remove("active");
    }
  });

  //Add toggle for bar line graph

  fetchDataAndRenderChart(true);
});

function getColor(index) {}
