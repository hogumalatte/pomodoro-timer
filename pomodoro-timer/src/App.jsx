import { useState, useEffect, useRef } from 'react'
import CircularTimer from './components/CircularTimer'
import './App.css'

function App() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalMinutes, setTotalMinutes] = useState(25)
  const [isBreak, setIsBreak] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [focusMode, setFocusMode] = useState(false) // 집중 모드 상태
  
  const audioRef = useRef(null)
  const intervalRef = useRef(null)

  // 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 타이머 로직
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (minutes === 0 && seconds === 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setFocusMode(false);
          handleTimerComplete();
          return;
        }

        if (seconds === 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, minutes, seconds]);

  // 타이머 완료 처리
  const handleTimerComplete = () => {
    // 알림음 재생
    playNotificationSound();
    
    // 브라우저 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = isBreak ? '휴식 시간이 끝났습니다!' : '뽀모도로 세션이 완료되었습니다!';
      new Notification('뽀모도로 타이머', {
        body: message,
        icon: '/vite.svg'
      });
    }

    if (!isBreak) {
      setCompletedSessions(prev => prev + 1);
      // 작업 세션 완료 후 휴식 시간 시작
      setIsBreak(true);
      setTotalMinutes(5);
      setMinutes(5);
      setSeconds(0);
    } else {
      // 휴식 시간 완료 후 작업 세션으로 돌아가기
      setIsBreak(false);
      setTotalMinutes(25);
      setMinutes(25);
      setSeconds(0);
    }
  };

  // 알림음 재생
  const playNotificationSound = () => {
    // Web Audio API를 사용하여 간단한 알림음 생성
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  const startTimer = () => {
    setIsRunning(true)
    setFocusMode(true) // 집중 모드 활성화
  }

  const pauseTimer = () => {
    setIsRunning(false)
    setFocusMode(false) // 집중 모드 해제
  }

  const resetTimer = () => {
    setIsRunning(false)
    setFocusMode(false) // 집중 모드 해제
    setIsBreak(false)
    setMinutes(totalMinutes)
    setSeconds(0)
  }

  const updateTotalMinutes = (newTime) => {
    setTotalMinutes(newTime)
    if (!isRunning) {
      setMinutes(newTime)
      setSeconds(0)
    }
  }

  // 타이머 클릭 핸들러 (집중 모드에서 일시정지)
  const handleTimerClick = () => {
    if (focusMode && isRunning) {
      pauseTimer()
    }
  }

  // 집중 모드일 때는 타이머만 표시
  if (focusMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full">
          {/* 상태 표시 - 작게 */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full ${isBreak ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isBreak ? '휴식 시간' : '작업 시간'}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                완료: {completedSessions}회
              </span>
            </div>
          </div>
          
          {/* 원형 타이머 - 클릭 가능 */}
          <div className="flex justify-center mb-6">
            <div 
              className="bg-gray-50 rounded-3xl p-8 shadow-inner cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleTimerClick}
            >
              <CircularTimer 
                minutes={minutes}
                seconds={seconds}
                totalMinutes={totalMinutes}
                isRunning={isRunning}
                isBreak={isBreak}
              />
            </div>
          </div>

          {/* 집중 모드 안내 */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              타이머를 터치하면 일시정지됩니다
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 일반 모드 (설정 및 컨트롤 표시)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            뽀모도로 타이머
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <span className={`px-3 py-1 rounded-full ${isBreak ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isBreak ? '휴식 시간' : '작업 시간'}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              완료: {completedSessions}회
            </span>
          </div>
        </div>
        
        {/* 원형 타이머 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-50 rounded-3xl p-6 shadow-inner">
            <CircularTimer 
              minutes={minutes}
              seconds={seconds}
              totalMinutes={totalMinutes}
              isRunning={isRunning}
              isBreak={isBreak}
            />
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? '일시정지' : '시작'}
          </button>
          <button 
            className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            onClick={resetTimer}
          >
            리셋
          </button>
        </div>

        {/* 시간 설정 - 작업 시간일 때만 표시 */}
        {!isBreak && (
          <div className="text-center space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              작업 시간 설정 (분)
            </label>
            <div className="flex justify-center space-x-2">
              <button
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => updateTotalMinutes(Math.max(1, totalMinutes - 5))}
                disabled={isRunning}
              >
                -5
              </button>
              <input
                type="number"
                min="1"
                max="60"
                value={totalMinutes}
                onChange={(e) => updateTotalMinutes(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                disabled={isRunning}
              />
              <button
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => updateTotalMinutes(Math.min(60, totalMinutes + 5))}
                disabled={isRunning}
              >
                +5
              </button>
            </div>
            
            {/* 프리셋 버튼들 */}
            <div className="flex justify-center space-x-2 mt-4">
              {[15, 25, 45].map((preset) => (
                <button
                  key={preset}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    totalMinutes === preset
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => updateTotalMinutes(preset)}
                  disabled={isRunning}
                >
                  {preset}분
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 휴식 시간 정보 */}
        {isBreak && (
          <div className="text-center">
            <p className="text-green-600 font-medium">
              잠시 휴식을 취하세요! 🌱
            </p>
            <p className="text-sm text-gray-500 mt-1">
              휴식 후 다음 뽀모도로 세션이 시작됩니다.
            </p>
          </div>
        )}

        {/* 집중 모드 안내 */}
        {!isRunning && (
          <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">
              💡 시작하면 집중 모드로 전환됩니다
            </p>
            <p className="text-blue-500 text-xs mt-1">
              타이머만 표시되어 집중할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

