import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface TabContentProps {
  data: any[];
  groupingKey: string;
  fromDate: string;
  toDate: string;
}

const TabContent: React.FC<TabContentProps> = ({ data, groupingKey, fromDate, toDate }) => {
  // Filtrar datos por fecha
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.ts); // Asumiendo que 'timestamp' es el campo de fecha
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
    totalHours: (values.totalMs / (1000 * 60 * 60)).toFixed(2), // Convertir ms a horas
  }))
    .sort((a, b) => Number(b.totalHours) - Number(a.totalHours)) // Ordenar por tiempo total descendente
    .slice(0, 10); // Limitar al TOP 10;

  return (
    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
      {/* Gráfico de barras */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#1f1f1f", borderRadius: "5px" }}>
        <h3 style={{ color: "#FFF", textAlign: "center" }}>Gráfico de barras</h3>
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
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#1f1f1f", borderRadius: "5px" }}>
        <h3 style={{ color: "#FFF", textAlign: "center" }}>Detalles</h3>
        <table style={{ width: "100%", color: "#FFF", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #444" }}>Nombre</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #444" }}>Cantidad Única</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #444" }}>Sumatoria de Tiempo (horas)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.name} style={{ textAlign: "center" }}>
                <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>{row.name}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>{row.count}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>{row.totalHours}</td>
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
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", color: "#FFF" }}>
      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#A1A1AA",
          border: "4px solid #A1A1AA",
          borderRadius: "16px",
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: activeTab === tab.id ? "#000" : "#A1A1AA",
              borderRadius: "16px",
              color: activeTab === tab.id ? "#FFF" : "#000",
              borderRight: tab.id !== tabs[tabs.length - 1].id ? "1px solid #A1A1AA" : "none",
            }}
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
