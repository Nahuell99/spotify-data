import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime, formatNumber, formatPercentage } from '../../functions';
import Tabs from '../tabContent/tabContent';
import HoursDistribution from '../HoursDistribution/HoursDistribution';
import PlatformDistribution from '../PlatformDistribution/PlatformDistribution';
import { FaClock, FaMusic, FaUser, FaFolder, FaCalendarDay, FaForward, FaCheckCircle, FaStopwatch } from 'react-icons/fa';
import './KpiReport.css'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
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

    // Promedio de tiempo acumulado escuchando por día
    const uniqueDays = new Set<string>();
    filteredData.forEach((entry: any) => {
      if (entry.ts) {
        const date = new Date(entry.ts);
        const dateString = date.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
        uniqueDays.add(dateString);
      }
    });
    const averageTimePerDay = uniqueDays.size > 0 ? totalTime / uniqueDays.size : 0;

    // Porcentaje de sesiones con "skip"
    const totalSessions = filteredData.length;
    const sessionsWithSkip = filteredData.filter((entry: any) => entry.skipped === true).length;
    const percentageWithSkip = totalSessions > 0 ? (sessionsWithSkip / totalSessions) * 100 : 0;

    // Porcentaje de sesiones SIN "skip" (Escuchadas completas)
    const sessionsWithoutSkip = filteredData.filter((entry: any) => entry.skipped === false).length;
    const percentageWithoutSkip = totalSessions > 0 ? (sessionsWithoutSkip / totalSessions) * 100 : 0;

    // Promedio de duración por track reproducido
    const averageDurationPerTrack = totalSessions > 0 ? totalTime / totalSessions : 0;

    return {
      totalTime,
      uniqueTracks: uniqueTracks.size,
      uniqueArtists: uniqueArtists.size,
      uniqueAlbums: uniqueAlbums.size,
      averageTimePerDay,
      percentageWithSkip,
      percentageWithoutSkip,
      averageDurationPerTrack,
    };
  };

  const { totalTime, uniqueTracks, uniqueArtists, uniqueAlbums, averageTimePerDay, percentageWithSkip, percentageWithoutSkip, averageDurationPerTrack } = calculateKPIs();

  return (
    <div className='main-container'>
      {/* Botón de flecha flotante para volver */}
      <Link to="/" className='back-button'>
        &#8592;
      </Link>

      <div className='content-wrapper'>
        {/* Título principal */}
        <h1 className='main-title'>Tus estadísticas de uso de Spotify</h1>

        {/* Sección 1: Filtros de fechas */}
        <section className='date-filter-section'>
          <div className='date-inputs'>
            <input
              className='date-input date-input-from'
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              className='date-input date-input-to'
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className='date-shortcuts'>
            {availableYears.map((year) => (
              <button 
                className='shortcut-button shortcut-button-year' 
                key={year} 
                onClick={() => handleYearButtonClick(year)}
              >
                {year}
              </button>
            ))}
            <button 
              className='shortcut-button shortcut-button-total' 
              onClick={handleTotalButtonClick}
            >
              TOTAL
            </button>
          </div>
        </section>

        {/* Sección 2: Cards de KPIs */}
        <section className='kpi-cards-section'>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaClock />
              </div>
              <h3 className='kpi-card-title'>Total de tiempo escuchado</h3>
            </div>
            <p className='kpi-card-value'>{formatTime(totalTime)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaMusic />
              </div>
              <h3 className='kpi-card-title'>Total de canciones distintas</h3>
            </div>
            <p className='kpi-card-value'>{formatNumber(uniqueTracks)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaUser />
              </div>
              <h3 className='kpi-card-title'>Total de artistas distintos</h3>
            </div>
            <p className='kpi-card-value'>{formatNumber(uniqueArtists)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaFolder />
              </div>
              <h3 className='kpi-card-title'>Total de álbumes distintos</h3>
            </div>
            <p className='kpi-card-value'>{formatNumber(uniqueAlbums)}</p>
          </div>
        </section>

        {/* Sección 2.1: Cards de KPIs adicionales */}
        <section className='kpi-cards-section'>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaCalendarDay />
              </div>
              <h3 className='kpi-card-title'>Promedio de tiempo acumulado escuchando por día</h3>
            </div>
            <p className='kpi-card-value'>{formatTime(averageTimePerDay)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaForward />
              </div>
              <h3 className='kpi-card-title'>Porcentaje de sesiones con "skip"</h3>
            </div>
            <p className='kpi-card-value'>{formatPercentage(percentageWithSkip)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaCheckCircle />
              </div>
              <h3 className='kpi-card-title'>Porcentaje de sesiones SIN "skip" (Escuchadas completas)</h3>
            </div>
            <p className='kpi-card-value'>{formatPercentage(percentageWithoutSkip)}</p>
          </div>
          <div className='kpi-card'>
            <div className='kpi-card-header'>
              <div className='kpi-card-icon'>
                <FaStopwatch />
              </div>
              <h3 className='kpi-card-title'>Promedio de duración por track reproducido</h3>
            </div>
            <p className='kpi-card-value'>{formatTime(averageDurationPerTrack)}</p>
          </div>
        </section>

        {/* Sección 3: Tabs de Tops (Canciones, Álbumes, Artistas) */}
        <section className='tabs-section'>
          <Tabs files={files} fromDate={dateFrom} toDate={dateTo} />
        </section>

        {/* Sección 4: Distribución por horas del día */}
        <section className='hours-distribution-section'>
          <HoursDistribution files={files} fromDate={dateFrom} toDate={dateTo} />
        </section>

        {/* Sección 5: Distribución por plataformas */}
        <section className='platform-distribution-section'>
          <PlatformDistribution files={files} fromDate={dateFrom} toDate={dateTo} />
        </section>
      </div>
    </div>
  );
};

export default KpiReport;
