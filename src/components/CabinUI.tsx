// 舱内端组件 - CabinUI.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CabinUIProps {
  cabinMode: string;
  setCabinMode: (mode: any) => void;
  isDoorOpening: boolean;
  setIsDoorOpening: (val: boolean) => void;
}

export default function CabinUI({ cabinMode, setCabinMode, isDoorOpening, setIsDoorOpening }: CabinUIProps) {
  // 这里的逻辑可以从 App.tsx 提取
  return (
    <div className="cabin-frame">
      {/* 舱内端界面 */}
    </div>
  );
}
