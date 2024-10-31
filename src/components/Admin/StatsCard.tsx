// src/components/StatsCard.tsx
import React from "react";

interface StatsCardProps {
  title: string;
  count: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count }) => {
  return (
    <div className="card w-full max-w-xs p-6 shadow-lg rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 text-center">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h2>
      <p className="text-4xl font-bold text-primary">{count}</p>
    </div>
  );
};

export default StatsCard;
