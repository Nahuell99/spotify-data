import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime } from '../../functions'; // Asegúrate de que la ruta sea correcta
import Tabs from '../tabContent/tabContent';
import HoursDistribution from '../HoursDistribution/HoursDistribution';
import './KpiReport.css'

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

    <div className='conteiner'>
      {/* Botón de flecha flotante */}
      <Link to="/" className='flecha-flotante'>
        &#8592; {/* Flecha hacia la izquierda */}
      </Link>

      <div className='contenedor-inputs'>
        <h1>Tus estadísticas de uso de Spotify</h1>
        <div className='contenedor-fechas-anos'>
          <div style={{ marginBottom: '20px' }}>
            <input
              className='date-from'
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              className='date-to'
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{  }}
            />
          </div>

          {/* Botones de atajo */}
          <div>
            {availableYears.map((year) => (
              <button className='atajo-ano' key={year} onClick={() => handleYearButtonClick(year)}>
                {year}
              </button>
            ))}
            <button className='atajo-total' onClick={handleTotalButtonClick}>
              TOTAL
            </button>
          </div>
        </div>

        {/* Caja contenedora de los KPIs */}
        <div className='kpi-conteiner'>
          <div className='kpi-box'>
            <h3>Total de tiempo escuchado</h3>
            <p>{formatTime(totalTime)}</p>
          </div>
          <div className='kpi-box'>
            <h3>Total de canciones distintas</h3>
            <p>{uniqueTracks}</p>
          </div>
          <div className='kpi-box'>
            <h3>Total de artistas distintos</h3>
            <p>{uniqueArtists}</p>
          </div>
          <div className='kpi-box'>
            <h3>Total de álbumes distintos</h3>
            <p>{uniqueAlbums}</p>
          </div>
        </div>
        <Tabs files={files} fromDate={dateFrom} toDate={dateTo} />
        <HoursDistribution files={files} fromDate={dateFrom} toDate={dateTo} />
      </div>
    </div>
  );
};

export default KpiReport;
