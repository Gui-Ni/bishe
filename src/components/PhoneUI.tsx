// 手机端组件 - PhoneUI.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PhoneUIProps {
  mobileState: string;
  setMobileState: (state: any) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
}

export default function PhoneUI({ mobileState, setMobileState, isRecording, setIsRecording }: PhoneUIProps) {
  // 这里的逻辑可以从 App.tsx 提取
  return (
    <div className="phone-frame">
      {/* 手机端界面 */}
    </div>
  );
}
