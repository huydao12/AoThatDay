import React, { PureComponent, memo } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatPie } from "../../../../helper/formatChart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042","#757575","#FF0000"];

function PeiChard({ data, name }) {
  const dataFormat = formatPie(data);
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <div style={{ width: "100%", height: "100%", textAlign: "center" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={600} height={600}>
          <Pie
            data={dataFormat}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <h3>{name}</h3>
    </div>
  );
}

export default memo(PeiChard);
