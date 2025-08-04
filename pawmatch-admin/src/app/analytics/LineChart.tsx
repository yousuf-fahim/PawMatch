'use client';

import React, { useRef, useEffect } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  showTooltips?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 500,
  height = 300,
  color = '#4f46e5',
  label = 'Value',
  showTooltips = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    
    // Y-axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Draw grid lines
    const gridLines = 5;
    ctx.beginPath();
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    for (let i = 1; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw points and line
    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (chartHeight * point.value / maxValue);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw area under line
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (chartHeight * point.value / maxValue);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = `${color}20`; // Add transparency
    ctx.fill();

    // Draw points
    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (chartHeight * point.value / maxValue);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw x-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    
    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      ctx.fillText(point.date, x, height - padding.bottom + 10);
    });

    // Draw y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillText(value.toString(), padding.left - 10, y);
    }

    // Draw chart title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(label, width / 2, 5);

  }, [data, width, height, color, label]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default LineChart;
