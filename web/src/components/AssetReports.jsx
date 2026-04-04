import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AssetReports = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "assets"), (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(doc => {
        const { Category, Value } = doc.data();
        counts[Category] = (counts[Category] || 0) + Number(Value);
      });

      const formattedData = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
      }));
      setChartData(formattedData);
    });
    return () => unsubscribe();
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <h3>Spending by Category</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetReports;