import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import './tabContent.css';

interface TabContentProps {
  data: any[];
  groupingKey: string;
  fromDate: string;
  toDate: string;
}

const TabContent: React.FC<TabContentProps> = ({ data, groupingKey, fromDate, toDate }) => {
  // Filtrar datos por fecha
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.ts);
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;

    const isAfterFrom = startDate ? entryDate >= startDate : true;
    const isBeforeTo = endDate ? entryDate <= endDate : true;

    return isAfterFrom && isBeforeTo;
  });

  // Agrupar y calcular datos
  const groupedData = filteredData.reduce((acc: Record<string, { count: number; totalMs: number }>, entry: any) => {
    const key = entry[groupingKey] || "Desconocido";
    if (!acc[key]) {
      acc[key] = { count: 0, totalMs: 0 };
    }
    acc[key].count += 1;
    acc[key].totalMs += entry.ms_played || 0;
    return acc;
  }, {});

  const chartData = Object.entries(groupedData).map(([name, values]) => ({
    name,
    count: values.count,
    totalHours: (values.totalMs / (1000 * 60 * 60)).toFixed(2),
  }))
    .sort((a, b) => Number(b.totalHours) - Number(a.totalHours))
    .slice(0, 10);

  return (
    <div className="tab-content-container">
      {/* Gráfico de barras */}
      <div className="chart-container">
        <h3 className="chart-title">Gráfico de barras</h3>
        <BarChart width={400} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A1A1AA" />
          <XAxis dataKey="name" stroke="#FFF" />
          <YAxis stroke="#FFF" />
          <Tooltip contentStyle={{ backgroundColor: "#333", color: "#FFF" }} />
          <Legend wrapperStyle={{ color: "#FFF" }} />
          <Bar dataKey="totalHours" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <h3 className="table-title">Detalles</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad Única</th>
              <th>Sumatoria de Tiempo (horas)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.count}</td>
                <td>{row.totalHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Tabs: React.FC<{ files: any[], fromDate: string, toDate: string }> = ({ files, fromDate, toDate }) => {
  const [activeTab, setActiveTab] = useState<string>("master_metadata_track_name");

  const tabs = [
    { id: "master_metadata_track_name", label: "Top canciones" },
    { id: "master_metadata_album_album_name", label: "Top álbumes" },
    { id: "master_metadata_album_artist_name", label: "Top artistas" },
  ];

  const combinedData = files.flatMap((file) => file.content);

  return (
    <div className="tabs-container">
      {/* Tab Bar */}
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Content for Active Tab */}
      <TabContent data={combinedData} groupingKey={activeTab} fromDate={fromDate} toDate={toDate} />
    </div>
  );
};

export default Tabs;
