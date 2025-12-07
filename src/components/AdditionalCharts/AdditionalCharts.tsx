import React, { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend
} from "recharts";
import { formatPercentage } from "../../functions";
import './AdditionalCharts.css';

// Mapeo de códigos de países a nombres completos
const COUNTRY_NAMES: Record<string, string> = {
    'AR': 'Argentina', 'US': 'Estados Unidos', 'GB': 'Reino Unido', 'CA': 'Canadá',
    'AU': 'Australia', 'DE': 'Alemania', 'FR': 'Francia', 'ES': 'España',
    'IT': 'Italia', 'BR': 'Brasil', 'MX': 'México', 'CL': 'Chile',
    'CO': 'Colombia', 'PE': 'Perú', 'UY': 'Uruguay', 'PY': 'Paraguay',
    'BO': 'Bolivia', 'EC': 'Ecuador', 'VE': 'Venezuela', 'CR': 'Costa Rica',
    'PA': 'Panamá', 'GT': 'Guatemala', 'HN': 'Honduras', 'NI': 'Nicaragua',
    'SV': 'El Salvador', 'DO': 'República Dominicana', 'CU': 'Cuba', 'PR': 'Puerto Rico',
    'SE': 'Suecia', 'NO': 'Noruega', 'DK': 'Dinamarca', 'FI': 'Finlandia',
    'NL': 'Países Bajos', 'BE': 'Bélgica', 'CH': 'Suiza', 'AT': 'Austria',
    'PL': 'Polonia', 'CZ': 'República Checa', 'PT': 'Portugal', 'GR': 'Grecia',
    'IE': 'Irlanda', 'IS': 'Islandia', 'LU': 'Luxemburgo', 'MT': 'Malta',
    'JP': 'Japón', 'KR': 'Corea del Sur', 'CN': 'China', 'IN': 'India',
    'TH': 'Tailandia', 'SG': 'Singapur', 'MY': 'Malasia', 'PH': 'Filipinas',
    'ID': 'Indonesia', 'VN': 'Vietnam', 'NZ': 'Nueva Zelanda', 'ZA': 'Sudáfrica',
    'EG': 'Egipto', 'AE': 'Emiratos Árabes Unidos', 'SA': 'Arabia Saudí', 'IL': 'Israel',
    'TR': 'Turquía', 'RU': 'Rusia', 'UA': 'Ucrania', 'RO': 'Rumania',
    'HU': 'Hungría', 'BG': 'Bulgaria', 'HR': 'Croacia', 'RS': 'Serbia',
    'SK': 'Eslovaquia', 'SI': 'Eslovenia', 'EE': 'Estonia', 'LV': 'Letonia',
    'LT': 'Lituania', 'BY': 'Bielorrusia', 'MD': 'Moldavia', 'GE': 'Georgia',
    'AM': 'Armenia', 'AZ': 'Azerbaiyán', 'KZ': 'Kazajistán', 'UZ': 'Uzbekistán',
    'Desconocido': 'Desconocido', 'ZZ': 'Desconocido'
};

interface AdditionalChartsProps {
    files: { content: Array<{ 
        ts: string; 
        conn_country?: string; 
        offline?: boolean; 
        skipped?: boolean;
        ms_played?: number;
    }> }[];
    fromDate: string;
    toDate: string;
}

const AdditionalCharts: React.FC<AdditionalChartsProps> = ({
    files,
    fromDate,
    toDate,
}) => {
    // Estados para controlar el hover en las leyendas
    const [activeCountryIndex, setActiveCountryIndex] = useState<number | null>(null);
    const [activeOfflineIndex, setActiveOfflineIndex] = useState<number | null>(null);
    const [activeSkippedIndex, setActiveSkippedIndex] = useState<number | null>(null);
    // Filtrar datos por fecha
    const filteredData = useMemo(() => {
        const startDate = fromDate ? new Date(fromDate) : null;
        const endDate = toDate ? new Date(toDate) : null;

        const combinedData = files.flatMap((file) => file.content);

        return combinedData.filter((entry) => {
            const entryDate = new Date(entry.ts);
            const isAfterFrom = startDate ? entryDate >= startDate : true;
            const isBeforeTo = endDate ? entryDate <= endDate : true;
            return isAfterFrom && isBeforeTo;
        });
    }, [files, fromDate, toDate]);

    // Función para convertir código de país a nombre completo
    const getCountryName = (code: string): string => {
        // Si el código está en el mapeo, devolver el nombre
        if (COUNTRY_NAMES[code]) {
            return COUNTRY_NAMES[code];
        }
        // Si no está, devolver "Desconocido"
        return 'Desconocido';
    };

    // Gráfico 1: Países
    const countryData = useMemo(() => {
        const countryCounts: Record<string, number> = {};
        
        filteredData.forEach((entry) => {
            const countryCode = entry.conn_country || "Desconocido";
            const countryName = getCountryName(countryCode);
            countryCounts[countryName] = (countryCounts[countryName] || 0) + 1;
        });

        const sortedData = Object.entries(countryCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 países

        // Calcular el total para los porcentajes
        const total = sortedData.reduce((sum, item) => sum + item.value, 0);
        
        return sortedData.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0
        }));
    }, [filteredData]);

    // Gráfico 2: Offline vs Online
    const offlineData = useMemo(() => {
        let offlineCount = 0;
        let onlineCount = 0;

        filteredData.forEach((entry) => {
            if (entry.offline === true) {
                offlineCount++;
            } else if (entry.offline === false) {
                onlineCount++;
            } else {
                // Si no está definido, contar como online
                onlineCount++;
            }
        });

        const total = offlineCount + onlineCount;
        const offlinePercentage = total > 0 ? (offlineCount / total) * 100 : 0;
        const onlinePercentage = total > 0 ? (onlineCount / total) * 100 : 0;

        return [
            { name: "Offline", value: offlineCount, percentage: offlinePercentage },
            { name: "Online", value: onlineCount, percentage: onlinePercentage }
        ];
    }, [filteredData]);

    // Gráfico 3: Skipped vs No Skipped
    const skippedData = useMemo(() => {
        let skippedCount = 0;
        let notSkippedCount = 0;

        filteredData.forEach((entry) => {
            if (entry.skipped === true) {
                skippedCount++;
            } else if (entry.skipped === false) {
                notSkippedCount++;
            }
        });

        const total = skippedCount + notSkippedCount;
        const skippedPercentage = total > 0 ? (skippedCount / total) * 100 : 0;
        const notSkippedPercentage = total > 0 ? (notSkippedCount / total) * 100 : 0;

        return [
            { name: "Con skip", value: skippedCount, percentage: skippedPercentage },
            { name: "Sin skip", value: notSkippedCount, percentage: notSkippedPercentage }
        ];
    }, [filteredData]);

    // Colores para los gráficos
    const COLORS = ['#1db954', '#1ed760', '#82ca9d', '#ffc658', '#ff7300', '#8884d8', '#00c49f', '#ffbb28', '#0088fe', '#ff6b6b'];
    
    // Colores pastel para Offline/Online y Skip/No Skip
    const PASTEL_GREEN = '#a8e6cf'; // Verde pastel
    const PASTEL_RED = '#ffaaa5'; // Rojo pastel

    // Componente de tooltip manual controlado por React
    const ManualTooltip = ({ data, show, percentage }: { data: { name: string; value: number } | null; show: boolean; percentage?: number }) => {
        if (!show || !data) return null;
        
        return (
            <div className="manual-tooltip">
                <p style={{ margin: 0, fontWeight: 600 }}>{data.name}</p>
                <p style={{ margin: '4px 0 0 0' }}>
                    Cantidad: {data.value.toLocaleString()}
                    {percentage !== undefined && (
                        <span> ({formatPercentage(percentage)})</span>
                    )}
                </p>
            </div>
        );
    };

    // Función para renderizar la leyenda personalizada con hover
    const renderCustomLegend = (data: Array<{ name: string; color: string }>, activeIndex: number | null, setActiveIndex: (index: number | null) => void) => {
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                {data.map((entry, index) => (
                    <li
                        key={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        style={{
                            cursor: 'pointer',
                            opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                            transition: 'opacity 0.2s',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: activeIndex === index ? '#333' : 'transparent'
                        }}
                    >
                        <span style={{ 
                            display: 'inline-block', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '2px',
                            marginRight: '6px',
                            backgroundColor: entry.color || COLORS[index % COLORS.length],
                            verticalAlign: 'middle'
                        }}></span>
                        <span style={{ color: '#FFF', fontSize: '12px' }}>{entry.name}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="additional-charts-wrapper">
            <div className="additional-charts-container">
                {/* Primera fila: Países (izquierda) y Offline/Online (derecha) */}
                <div className="charts-row charts-row-top">
                {/* Gráfico de Países */}
                <div className="chart-wrapper chart-wrapper-left">
                    <h3 className="chart-title">Países desde donde escuchaste música</h3>
                    <div className="pie-chart-container">
                        <ManualTooltip 
                            data={activeCountryIndex !== null ? countryData[activeCountryIndex] : null}
                            show={activeCountryIndex !== null}
                            percentage={activeCountryIndex !== null ? countryData[activeCountryIndex].percentage : undefined}
                        />
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={countryData.map((item, index) => ({
                                        ...item,
                                        color: COLORS[index % COLORS.length]
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    activeIndex={activeCountryIndex ?? undefined}
                                    onMouseEnter={(_, index) => setActiveCountryIndex(index)}
                                    onMouseLeave={() => setActiveCountryIndex(null)}
                                >
                                    {countryData.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                            opacity={activeCountryIndex === null || activeCountryIndex === index ? 1 : 0.3}
                                        />
                                    ))}
                                </Pie>
                                <Legend 
                                    content={() => renderCustomLegend(
                                        countryData.map((item, index) => ({
                                            name: item.name,
                                            color: COLORS[index % COLORS.length]
                                        })),
                                        activeCountryIndex,
                                        setActiveCountryIndex
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Offline/Online */}
                <div className="chart-wrapper chart-wrapper-right">
                    <h3 className="chart-title">Reproducciones Offline vs Online</h3>
                    <div className="pie-chart-container">
                        <ManualTooltip 
                            data={activeOfflineIndex !== null ? offlineData[activeOfflineIndex] : null}
                            show={activeOfflineIndex !== null}
                            percentage={activeOfflineIndex !== null ? offlineData[activeOfflineIndex].percentage : undefined}
                        />
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={offlineData.map((item, index) => ({
                                        ...item,
                                        color: index === 0 ? PASTEL_RED : PASTEL_GREEN
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    activeIndex={activeOfflineIndex ?? undefined}
                                    onMouseEnter={(_, index) => setActiveOfflineIndex(index)}
                                    onMouseLeave={() => setActiveOfflineIndex(null)}
                                >
                                    {offlineData.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === 0 ? PASTEL_RED : PASTEL_GREEN}
                                            opacity={activeOfflineIndex === null || activeOfflineIndex === index ? 1 : 0.3}
                                        />
                                    ))}
                                </Pie>
                                <Legend 
                                    content={() => renderCustomLegend(
                                        offlineData.map((item, index) => ({
                                            name: item.name,
                                            color: index === 0 ? PASTEL_RED : PASTEL_GREEN
                                        })),
                                        activeOfflineIndex,
                                        setActiveOfflineIndex
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Segunda fila: Skipped vs No Skipped (centrado) */}
            <div className="charts-row charts-row-bottom">
                <div className="chart-wrapper chart-wrapper-center">
                    <h3 className="chart-title">Porcentaje de sesiones con skip vs sin skip</h3>
                    <div className="pie-chart-container">
                        <ManualTooltip 
                            data={activeSkippedIndex !== null ? skippedData[activeSkippedIndex] : null}
                            show={activeSkippedIndex !== null}
                            percentage={activeSkippedIndex !== null ? skippedData[activeSkippedIndex].percentage : undefined}
                        />
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={skippedData.map((item, index) => ({
                                        ...item,
                                        color: index === 0 ? PASTEL_RED : PASTEL_GREEN
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    activeIndex={activeSkippedIndex ?? undefined}
                                    onMouseEnter={(_, index) => setActiveSkippedIndex(index)}
                                    onMouseLeave={() => setActiveSkippedIndex(null)}
                                >
                                    {skippedData.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === 0 ? PASTEL_RED : PASTEL_GREEN}
                                            opacity={activeSkippedIndex === null || activeSkippedIndex === index ? 1 : 0.3}
                                        />
                                    ))}
                                </Pie>
                                <Legend 
                                    content={() => renderCustomLegend(
                                        skippedData.map((item, index) => ({
                                            name: item.name,
                                            color: index === 0 ? PASTEL_RED : PASTEL_GREEN
                                        })),
                                        activeSkippedIndex,
                                        setActiveSkippedIndex
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default AdditionalCharts;

