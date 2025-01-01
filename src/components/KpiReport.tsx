import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime } from '../functions'; // Asegúrate de que la ruta sea correcta
import Tabs from './tabContent';
import HoursDistribution from "./HoursDistribution";

// @ts-ignore
const KpiReport: React.FC<{ files: UploadedFile[] }> = ({ files }) => {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    // Extraer años únicos de los datos cargados
    const years = new Set<number>();
    files.forEach(file => {
      file.content.forEach((entry: any) => {
        const year = new Date(entry.ts).getFullYear();
        years.add(year);
      });
    });
    setAvailableYears(Array.from(years).sort());
  }, [files]);

  const handleYearButtonClick = (year: number) => {
    setDateFrom(`${year}-01-01`);
    setDateTo(`${year}-12-31`);
  };

  const handleTotalButtonClick = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Filtrado de los datos según las fechas
  const filterDataByDate = (data: any[]) => {
    return data.filter((entry) => {
      const ts = new Date(entry.ts);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const isAfterFrom = fromDate ? ts >= fromDate : true;
      const isBeforeTo = toDate ? ts <= toDate : true;

      return isAfterFrom && isBeforeTo;
    });
  };

  // Calcular KPIs
  const calculateKPIs = () => {
    const filteredData = files.flatMap(file => filterDataByDate(file.content));

    // Total de tiempo escuchado
    const totalTime = filteredData.reduce((total: number, entry: any) => total + (entry.ms_played || 0), 0);

    // Total de canciones distintas
    const uniqueTracks = new Set(filteredData.map((entry: any) => entry.spotify_track_uri));

    // Total de artistas distintos
    const uniqueArtists = new Set(filteredData.map((entry: any) => entry.master_metadata_album_artist_name));

    // Total de álbumes distintos
    const uniqueAlbums = new Set(filteredData.map((entry: any) => entry.master_metadata_album_album_name));

    return {
      totalTime,
      uniqueTracks: uniqueTracks.size,
      uniqueArtists: uniqueArtists.size,
      uniqueAlbums: uniqueAlbums.size,
    };
  };

  const { totalTime, uniqueTracks, uniqueArtists, uniqueAlbums } = calculateKPIs();

  return (

    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: 'center' }}>

      {/* Botón de flecha flotante */}
      <Link to="/" style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '50%',
        padding: '10px',
        fontSize: '20px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        zIndex: 1000
      }}>
        &#8592; {/* Flecha hacia la izquierda */}
      </Link>

      <h1>Informe de KPIs</h1>

      {/* Caja contenedora para inputs y botones */}
      <div style={{
        padding: '20px',
        border: '2px solid #e7ebda',
        borderRadius: '8px',
        display: 'inline-block',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        {/* Caja de inputs */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ marginRight: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Botones de atajo */}
        <div>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => handleYearButtonClick(year)}
              style={{
                margin: '5px',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {year}
            </button>
          ))}
          <button
            onClick={handleTotalButtonClick}
            style={{
              margin: '5px',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            TOTAL
          </button>
        </div>
      </div>

      {/* Caja contenedora de los KPIs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ border: '2px solid #e7ebda', padding: '15px', borderRadius: '8px', width: '200px' }}>
          <h3>Total de tiempo escuchado</h3>
          <p>{formatTime(totalTime)}</p>
        </div>
        <div style={{ border: '2px solid #e7ebda', padding: '15px', borderRadius: '8px', width: '200px' }}>
          <h3>Total de canciones distintas</h3>
          <p>{uniqueTracks}</p>
        </div>
        <div style={{ border: '2px solid #e7ebda', padding: '15px', borderRadius: '8px', width: '200px' }}>
          <h3>Total de artistas distintos</h3>
          <p>{uniqueArtists}</p>
        </div>
        <div style={{ border: '2px solid #e7ebda', padding: '15px', borderRadius: '8px', width: '200px' }}>
          <h3>Total de álbumes distintos</h3>
          <p>{uniqueAlbums}</p>
        </div>
      </div>


      <Tabs files={files} fromDate={dateFrom} toDate={dateTo} />

      <HoursDistribution files={files} fromDate={dateFrom} toDate={dateTo} />

    </div>
  );
};

export default KpiReport;
