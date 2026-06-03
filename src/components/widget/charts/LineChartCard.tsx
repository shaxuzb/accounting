import { Card } from "antd";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartCardProps {
  title?: string;
  labels: string[];
  data: number[];
}

export default function LineChartCard({ title = "Chart", labels, data }: LineChartCardProps) {
  return (
    <Card title={title}>
      <Line
        data={{
          labels,
          datasets: [{ label: title, data, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.2)" }],
        }}
        options={{ responsive: true, plugins: { legend: { position: "top" as const } } }}
      />
    </Card>
  );
}
