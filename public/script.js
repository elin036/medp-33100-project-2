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
      } else {
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
      const years = [...new Set(originalData.map((row) => row.Year))].sort(
        (a, b) => a - b
      );
  
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
                  color: "black",
                  font: { family: "Rampart One", size: 25 },
                },
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 45,
                  color: "black",
                  font: { size: 15 },
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Happiness Index",
                  color: "black",
                  font: { family: "Rampart One", size: 25 },
                },
                ticks: { autoSkip: false, color: "black", font: { size: 15 } },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  color: "black",
                  font: { family: "Rampart One", size: 20 },
                },
              },
            },
          },
        }
      );
  
      populateTable(originalData);
    };
  
    const populateTable = (data) => {
      const tableBody = document
        .getElementById("countryTable")
        .querySelector("tbody");
      tableBody.innerHTML = "";
  
      const countryDataMap = data.reduce((acc, row) => {
        if (!acc[row.Country]) acc[row.Country] = [];
        acc[row.Country].push(row);
        return acc;
      }, {});
  
      Object.keys(countryDataMap).forEach((country) => {
        const countryEntries = countryDataMap[country];
        const mostRecentEntry = countryEntries.reduce((a, b) =>
          a.Year > b.Year ? a : b
        );
  
        const countryRow = document.createElement("tr");
        countryRow.classList.add("expandable-row");
        countryRow.innerHTML = `
          <td>${country}</td>
          <td>${mostRecentEntry.Year}</td>
          <td>${mostRecentEntry.Index}</td>
          <td>${mostRecentEntry.Rank}</td>
        `;
        tableBody.appendChild(countryRow);
  
        const detailsRow = document.createElement("tr");
        detailsRow.classList.add("details");
        detailsRow.style.display = "none";
  
        const detailsCell = document.createElement("td");
        detailsCell.colSpan = 4;
        detailsRow.appendChild(detailsCell);
  
        const nestedTable = document.createElement("table");
        nestedTable.classList.add("nested-table");
        nestedTable.innerHTML = `
          <thead><tr><th>Year</th><th>Happiness Index</th><th>Rank</th></tr></thead>
          <tbody>${countryEntries
            .map(
              (row) =>
                `<tr><td>${row.Year}</td><td>${row.Index}</td><td>${row.Rank}</td></tr>`
            )
            .join("")}</tbody>
        `;
        detailsCell.appendChild(nestedTable);
        tableBody.appendChild(detailsRow);
  
        countryRow.addEventListener("click", () => {
          detailsRow.style.display =
            detailsRow.style.display === "none" ? "table-row" : "none";
        });
      });
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
  
    document
      .getElementById("toggleChartTypeButton")
      .addEventListener("click", () => {
        currentChartType = currentChartType === "line" ? "bar" : "line";
        renderChart(currentView === "happiest", chartDataCache);
      });
  
    fetchDataAndRenderChart(true);
  });
  
  function getColor(index) {
    const colors = [
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#034F84",
      "#F7786B",
      "#DE7A22",
      "#79C753",
      "#4C4F56",
    ];
    return colors[index % colors.length];
  }
  