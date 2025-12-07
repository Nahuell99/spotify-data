import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime, formatNumber } from '../../functions';
import Tabs from '../tabContent/tabContent';
import HoursDistribution from '../HoursDistribution/HoursDistribution';
import PlatformDistribution from '../PlatformDistribution/PlatformDistribution';
import AdditionalCharts from '../AdditionalCharts/AdditionalCharts';
import { FaClock, FaMusic, FaUser, FaFolder, FaCalendarDay, FaThumbsDown } from 'react-icons/fa';
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

    // Canción más odiada: skipped=true y ms_played <= 10000 (10 segundos)
    const hatedSongs = filteredData.filter((entry: any) => 
      entry.skipped === true && (entry.ms_played || 0) <= 10000
    );

    // Agrupar por track_name + artist_name y contar ocurrencias
    const hatedSongsCount: Record<string, { track: string; artist: string; count: number }> = {};
    hatedSongs.forEach((entry: any) => {
      const trackName = entry.master_metadata_track_name || 'Desconocido';
      const artistName = entry.master_metadata_album_artist_name || 'Desconocido';
      const key = `${trackName}|||${artistName}`;
      
      if (!hatedSongsCount[key]) {
        hatedSongsCount[key] = {
          track: trackName,
          artist: artistName,
          count: 0
        };
      }
      hatedSongsCount[key].count += 1;
    });

    // Encontrar la canción con más ocurrencias
    let mostHatedSong = { track: 'N/A', artist: 'N/A', count: 0 };
    Object.values(hatedSongsCount).forEach((song) => {
      if (song.count > mostHatedSong.count) {
        mostHatedSong = song;
      }
    });

    return {
      totalTime,
      uniqueTracks: uniqueTracks.size,
      uniqueArtists: uniqueArtists.size,
      uniqueAlbums: uniqueAlbums.size,
      averageTimePerDay,
      mostHatedSong,
    };
  };

  const { totalTime, uniqueTracks, uniqueArtists, uniqueAlbums, averageTimePerDay, mostHatedSong } = calculateKPIs();

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
            <div className='date-input-wrapper'>
              <label htmlFor='date-from' className='date-input-label'>Fecha desde</label>
              <input
                id='date-from'
                className='date-input date-input-from'
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className='date-input-wrapper'>
              <label htmlFor='date-to' className='date-input-label'>Fecha hasta</label>
              <input
                id='date-to'
                className='date-input date-input-to'
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className='date-shortcuts-section'>
            <p className='date-shortcuts-label'>O selecciona un año completo:</p>
            <div className='date-shortcuts'>
              {availableYears.map((year) => (
                <button 
                  className='shortcut-button shortcut-button-year' 
                  key={year} 
                  onClick={() => handleYearButtonClick(year)}
                  title={`Ver estadísticas del año ${year}`}
                >
                  {year}
                </button>
              ))}
              <button 
                className='shortcut-button shortcut-button-total' 
                onClick={handleTotalButtonClick}
                title='Ver todas las estadísticas sin filtrar por fecha'
              >
                TOTAL
              </button>
            </div>
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
                <FaThumbsDown />
              </div>
              <h3 className='kpi-card-title'>
                Canción más odiada
                <span className="tooltip-wrapper">
                  <span className="tooltip-icon">?</span>
                  <span className="tooltip-text">Canción más veces skipeada antes de los 10 segundos de iniciada</span>
                </span>
              </h3>
            </div>
            <p className='kpi-card-value'>
              {mostHatedSong.count > 0 
                ? `${mostHatedSong.track} - ${mostHatedSong.artist}` 
                : 'N/A'}
            </p>
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

        {/* Sección 6: Gráficos adicionales (Países, Offline/Online, Skip) */}
        <section className='additional-charts-section'>
          <AdditionalCharts files={files} fromDate={dateFrom} toDate={dateTo} />
        </section>
      </div>
    </div>
  );
};

export default KpiReport;
