import React, { useState, useEffect } from "react";
import { formatTime } from "../../functions";
import './tabContent.css';

interface TabContentProps {
  data: any[];
  groupingKey: string;
  fromDate: string;
  toDate: string;
}

const TabContent: React.FC<TabContentProps> = ({ data, groupingKey, fromDate, toDate }) => {
  const [sortBy, setSortBy] = useState<'count' | 'totalMs'>('totalMs');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar datos por fecha
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.ts);
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;

    const isAfterFrom = startDate ? entryDate >= startDate : true;
    const isBeforeTo = endDate ? entryDate <= endDate : true;

    return isAfterFrom && isBeforeTo;
  });

  // Determinar si mostrar columna de artista
  const showArtistColumn = groupingKey !== "master_metadata_album_artist_name";

  // Agrupar y calcular datos
  const groupedData = filteredData.reduce((acc: Record<string, { count: number; totalMs: number; artist?: string }>, entry: any) => {
    const key = entry[groupingKey] || "Desconocido";
    if (!acc[key]) {
      acc[key] = { 
        count: 0, 
        totalMs: 0,
        artist: showArtistColumn ? (entry.master_metadata_album_artist_name || "Desconocido") : undefined
      };
    }
    acc[key].count += 1;
    acc[key].totalMs += entry.ms_played || 0;
    return acc;
  }, {});

  // Convertir a array y ordenar
  const allTableData = Object.entries(groupedData).map(([name, values]) => ({
    name,
    count: values.count,
    totalMs: values.totalMs,
    artist: values.artist,
  }));

  // Ordenar según el criterio seleccionado
  const sortedData = [...allTableData].sort((a, b) => {
    const aValue = sortBy === 'count' ? a.count : a.totalMs;
    const bValue = sortBy === 'count' ? b.count : b.totalMs;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Datos paginados para la tabla
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia el ordenamiento
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  // Manejar clic en columna para ordenar
  const handleSortClick = (column: 'count' | 'totalMs') => {
    if (sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar el orden
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Si es una columna diferente, ordenar por ella en descendente
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="tab-content-wrapper">
      {/* Tabla de detalles */}
      <div className="tab-table-container">
        <table className="tab-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Canción</th>
              {showArtistColumn && <th>Artista</th>}
              <th className="sortable-header" onClick={() => handleSortClick('count')}>
                <span>
                  Cantidad Única
                  <span className="tooltip-wrapper" onClick={(e) => e.stopPropagation()}>
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Cantidad de reproducciones únicas completas o skipeadas</span>
                  </span>
                </span>
                {sortBy === 'count' && (
                  <span className="sort-arrow">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th className="sortable-header" onClick={() => handleSortClick('totalMs')}>
                <span>
                  Tiempo de reproducción
                  <span className="tooltip-wrapper" onClick={(e) => e.stopPropagation()}>
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Acumulado de tiempo neto por cada canción reproducida, completa o skipeada</span>
                  </span>
                </span>
                {sortBy === 'totalMs' && (
                  <span className="sort-arrow">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row.name}>
                <td>{startIndex + index + 1}</td>
                <td className="text-cell-with-tooltip" title={row.name}>
                  {row.name}
                </td>
                {showArtistColumn && (
                  <td className="text-cell-with-tooltip" title={row.artist}>
                    {row.artist}
                  </td>
                )}
                <td>{row.count}</td>
                <td>{formatTime(row.totalMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="tab-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="tab-pagination-button"
            >
              Anterior
            </button>
            <span className="tab-pagination-info">
              Página {currentPage} de {totalPages} ({sortedData.length} resultados)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="tab-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
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
      {/* Barra de pestañas */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tabs-button ${activeTab === tab.id ? 'tabs-button-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <TabContent data={combinedData} groupingKey={activeTab} fromDate={fromDate} toDate={toDate} />
    </div>
  );
};

export default Tabs;
