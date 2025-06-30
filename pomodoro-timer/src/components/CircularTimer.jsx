import React from 'react'

const CircularTimer = ({ minutes, seconds, totalMinutes, isRunning, isBreak }) => {
  const totalSeconds = totalMinutes * 60
  const currentSeconds = minutes * 60 + seconds
  const progress = (totalSeconds - currentSeconds) / totalSeconds
  
  // SVG 원의 둘레 계산
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  
  // 색상 설정 (작업 시간: 빨간색, 휴식 시간: 초록색)
  const progressColor = isBreak ? '#10B981' : '#EF4444'
  const glowColor = isBreak ? '#34D399' : '#F87171'
  
  // 시간 표시를 위한 눈금 생성
  const generateTimeMarks = () => {
    const marks = []
    const maxTime = Math.max(totalMinutes, 60) // 최소 60분까지 표시
    const interval = maxTime <= 30 ? 5 : 10 // 30분 이하면 5분 간격, 이상이면 10분 간격
    
    for (let i = 0; i < maxTime; i += interval) {
      const angle = (i / 60) * 360 - 90 // -90도로 12시 방향부터 시작
      const radian = (angle * Math.PI) / 180
      const x1 = 150 + (radius - 10) * Math.cos(radian)
      const y1 = 150 + (radius - 10) * Math.sin(radian)
      const x2 = 150 + (radius - 20) * Math.cos(radian)
      const y2 = 150 + (radius - 20) * Math.sin(radian)
      
      // 숫자 위치
      const textX = 150 + (radius - 35) * Math.cos(radian)
      const textY = 150 + (radius - 35) * Math.sin(radian)
      
      marks.push(
        <g key={i}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth="2"
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            {i}
          </text>
        </g>
      )
    }
    
    // 작은 눈금들 추가
    for (let i = 0; i < 60; i++) {
      if (i % interval !== 0) {
        const angle = (i / 60) * 360 - 90
        const radian = (angle * Math.PI) / 180
        const x1 = 150 + (radius - 10) * Math.cos(radian)
        const y1 = 150 + (radius - 10) * Math.sin(radian)
        const x2 = 150 + (radius - 15) * Math.cos(radian)
        const y2 = 150 + (radius - 15) * Math.sin(radian)
        
        marks.push(
          <line
            key={`small-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#9CA3AF"
            strokeWidth="1"
          />
        )
      }
    }
    
    return marks
  }

  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <svg width="100%" height="100%" viewBox="0 0 300 300" className="transform -rotate-90">
        {/* 그림자 효과 정의 */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 배경 원 */}
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        
        {/* 진행 상황을 나타내는 원 */}
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          filter={isRunning ? "url(#glow)" : "none"}
        />
        
        {/* 시간 눈금과 숫자들 */}
        <g className="transform rotate-90" style={{ transformOrigin: '150px 150px' }}>
          {generateTimeMarks()}
        </g>
      </svg>
      
      {/* 중앙의 시간 표시 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-lg border-4 ${
          isBreak ? 'border-green-200' : 'border-red-200'
        } transition-colors duration-300`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${isBreak ? 'text-green-600' : 'text-red-600'}`}>
              {String(minutes).padStart(2, '0')}
            </div>
            <div className="text-lg font-bold text-gray-400">
              {String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
      
      {/* 실행 상태 표시 */}
      {isRunning && (
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            isBreak ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </div>
      )}
      
      {/* 모드 표시 아이콘 */}
      <div className="absolute bottom-2 left-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isBreak ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <span className="text-sm">
            {isBreak ? '🌱' : '🍅'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CircularTimer

