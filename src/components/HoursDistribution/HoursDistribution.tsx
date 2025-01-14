import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Label,
    ResponsiveContainer
} from "recharts";

interface HoursDistributionProps {
    files: { content: any[] }[];
    fromDate: string;
    toDate: string;
}

const HoursDistribution: React.FC<HoursDistributionProps> = ({
    files,
    fromDate,
    toDate,
}) => {
    // Convertir las fechas seleccionadas a objetos Date
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;

    // Combinar los datos de todos los archivos
    const combinedData = files.flatMap((file) => file.content);

    // Filtrar los datos por las fechas seleccionadas
    const filteredData = combinedData.filter((entry) => {
        const entryDate = new Date(entry.ts); // Asumiendo que el campo de fecha es 'ts'
        const isAfterFrom = startDate ? entryDate >= startDate : true;
        const isBeforeTo = endDate ? entryDate <= endDate : true;
        return isAfterFrom && isBeforeTo;
    });

    // Agrupar los datos por bloques horarios
    const hourGroups = Array.from({ length: 24 }, () => 0); // Inicializar un arreglo de 24 elementos en 0

    filteredData.forEach((entry) => {
        const entryDate = new Date(entry.ts);
        const hour = entryDate.getHours();
        hourGroups[hour] += entry.ms_played || 0; // Sumar los ms_played al grupo horario correspondiente
    });

    // Convertir los datos a formato para el gráfico
    const chartData = hourGroups.map((totalMs, hour) => ({
        hour: hour.toString().padStart(2, "0"), // Formatear la hora como "00", "01", etc.
        totalHours: parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2)), // Convertir ms a horas y redondear
    }));

    // Calcular el máximo de 'totalHours' y añadir un 10%
    const maxHours = Math.max(...chartData.map((d) => d.totalHours));
    const adjustedMax = Math.ceil(maxHours * 1.1); // Añadir un 10% y redondear hacia arriba

    return (
        <div className="container">
            <h3>Distribución por Hora</h3>
            <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, bottom: 30 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#A1A1AA" />
                        <XAxis dataKey="hour" stroke="#FFF">
                            <Label
                                value="Horario del día"
                                offset={-10}
                                position="insideBottom"
                                style={{ fill: "#FFF" }}
                            />
                        </XAxis>
                        <YAxis
                            stroke="#FFF"
                            domain={[0, adjustedMax]}
                            tickFormatter={(value) => value.toFixed(0)}
                        />
                        <Tooltip contentStyle={{ backgroundColor: "#333", color: "#FFF" }} />
                        <Legend wrapperStyle={{ color: "#FFF" }} layout="horizontal" align="center" verticalAlign="top" />
                        <Bar dataKey="totalHours" fill="#82ca9d" name="Consumo acumulado en horas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HoursDistribution;
