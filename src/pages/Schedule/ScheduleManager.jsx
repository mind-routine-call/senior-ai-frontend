// src/pages/Schedule/ScheduleManager.jsx
import { useState } from "react";
import axios from "axios";

export default function ScheduleManager() {
  // 1. 입력 폼 상태 관리 (State)
  const [selectedDate, setSelectedDate] = useState("2026-06-01");
  const [ampm, setAmpm] = useState("오전");
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [repeatType, setRepeatType] = useState("매일");

  // 2. 🎉 예약 완료 팝업창(모달) 제어용 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 가상의 기본 데이터 (어르신 및 시나리오 연동용)
  const DEFAULT_ELDER_ID = 1;
  const DEFAULT_SCENARIO_ID = 2;

// 오전 ↔ 오후 토글
  const toggleAmpm = () => {
    setAmpm((prev) => (prev === "오전" ? "오후" : "오전"));
  };

  // 시간 증가 (12시 -> 1시)
  const increaseHour = () => {
    let current = parseInt(hour, 10) || 12;
    current = current === 12 ? 1 : current + 1;
    setHour(String(current).padStart(2, "0"));
  };

  // 시간 감소 (1시 -> 12시)
  const decreaseHour = () => {
    let current = parseInt(hour, 10) || 12;
    current = current === 1 ? 12 : current - 1;
    setHour(String(current).padStart(2, "0"));
  };

  // 분 증가 (59분 -> 00분)
  const increaseMinute = () => {
    let current = parseInt(minute, 10) || 0;
    current = current === 59 ? 0 : current + 1;
    setMinute(String(current).padStart(2, "0"));
  };

  // 분 감소 (00분 -> 59분)
  const decreaseMinute = () => {
    let current = parseInt(minute, 10) || 0;
    current = current === 0 ? 59 : current - 1;
    setMinute(String(current).padStart(2, "0"));
  };

  // ✨ 키보드 직접 입력 시 범위를 벗어나지 않게 제어하는 안전장치 함수
  const handleHourChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) {
      setHour(""); // 사용자가 다 지웠을 때는 빈칸 허용
      return;
    }
    if (num > 12) num = 12;   // 12시를 넘어가면 12로 고정
    if (num < 1) num = 1;     // 1시보다 작아지면 1로 고정
    setHour(String(num).padStart(2, "0"));
  };

  const handleMinuteChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) {
      setMinute(""); // 빈칸 허용
      return;
    }
    if (num > 59) num = 59;   // 59분을 넘어가면 59로 고정
    if (num < 0) num = 0;     // 0분보다 작아지면 0으로 고정
    setMinute(String(num).padStart(2, "0"));
  };

  // 입력창에서 포커스가 빠져나갈 때 빈칸이면 기본값 채워주기
  const handleBlur = () => {
    if (hour === "") setHour("12");
    if (minute === "") setMinute("00");
  };


  // 3. 예약하기 버튼 클릭 이벤트 핸들러
  const handleReservation = async () => {
    try {
      // 오전/오후 단어를 백엔드가 좋아하는 24시간계 텍스트(HH)로 보정 연산
      let convertedHour = parseInt(hour, 10);
      if (ampm === "오후" && convertedHour !== 12) {
        convertedHour += 12;
      } else if (ampm === "오전" && convertedHour === 12) {
        convertedHour = 0;
      }
      
      const formattedHour = String(convertedHour).padStart(2, "0");
      const formattedMinute = String(minute).padStart(2, "0");
      
      // 백엔드 시간 규격 완성 ("HH:MM:SS")
      const scheduled_time = `${formattedHour}:${formattedMinute}:00`;

      // 백엔드로 실시간 데이터 송신
      const response = await axios.post("http://localhost:3000/api/v1/schedules/create", {
        elder_id: DEFAULT_ELDER_ID,
        scenario_id: DEFAULT_SCENARIO_ID,
        scheduled_time,
        repeat_type: repeatType
      });

      // DB 저장에 성공했다면?
      if (response.data.success) {
  const [year, month, day] = selectedDate.split("-");
  setModalMessage(`${year}년 ${month}월 ${day}일 ${ampm} ${hour}시 ${minute}분 채팅 예약이 완료되었습니다.`);
  setIsModalOpen(true);
}
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "예약 중 서버 통신 에러가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 font-sans relative">
      
      {/* 스마트폰 내부 뷰 프레임 */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 flex flex-col min-h-[720px]">
        
        {/* 헤더 타이틀 바 */}
        <div className="flex items-center justify-start mb-6">
          <button className="text-xl font-bold text-gray-700 hover:text-black">←</button>
          <h1 className="text-xl font-black text-gray-900 ml-4">채팅 일정 예약하기</h1>
        </div>

        {/* [날짜] 달력 컴포넌트 구역 */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-5 flex flex-col items-center">
          <label className="text-xs font-semibold text-gray-500 mb-2 self-start">날짜 설정</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-center text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* 🛠️ [시간] 삼각형 클릭 + 키보드 직접 입력 하이브리드 구역 */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-5 flex justify-around items-center select-none">
          
          {/* 오전/오후 조작단 */}
          <div className="flex flex-col items-center w-16">
            <button onClick={toggleAmpm} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▲</button>
            <span className="text-xl font-black text-gray-800 my-2 cursor-pointer" onClick={toggleAmpm}>
              {ampm}
            </span>
            <button onClick={toggleAmpm} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▼</button>
          </div>

          <span className="text-2xl font-black text-gray-300">:</span>

          {/* 시(Hour) 하이브리드 입력단 */}
          <div className="flex flex-col items-center w-16">
            <button onClick={increaseHour} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▲</button>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-2xl font-black text-gray-800 text-center my-1 focus:outline-none focus:text-purple-600 tracking-wide"
            />
            <button onClick={decreaseHour} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▼</button>
          </div>

          <span className="text-2xl font-black text-gray-300">:</span>

          {/* 분(Minute) 하이브리드 입력단 */}
          <div className="flex flex-col items-center w-16">
            <button onClick={increaseMinute} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▲</button>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-2xl font-black text-gray-800 text-center my-1 focus:outline-none focus:text-purple-600 tracking-wide"
            />
            <button onClick={decreaseMinute} className="text-gray-400 hover:text-purple-600 font-bold p-1 text-sm">▼</button>
          </div>

        </div>

        {/* [반복] 라디오 버튼 토글 구역 */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between mb-8">
          <span className="font-bold text-gray-800 text-sm">반복 설정하기</span>
          <div className="flex gap-4">
            {["매일", "매주", "없음"].map((type) => (
              <label key={type} className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700">
                <input 
                  type="radio" 
                  name="repeat" 
                  checked={repeatType === type} 
                  onChange={() => setRepeatType(type)}
                  className="accent-purple-500"
                /> {type === "없음" ? "안함" : type}
              </label>
            ))}
          </div>
        </div>

        {/* 최종 제출 버튼 */}
        <button 
          onClick={handleReservation}
          className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors py-4 rounded-2xl font-black text-lg shadow-sm"
        >
          예약하기
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ✨ [모달 팝업] 조건부 렌더링 영역 (isModalOpen이 true일 때만 레이어로 나타남) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center">
            
            {/* 알림 제목 */}
            <h3 className="text-lg font-black text-gray-900 mb-4">🔔 예약 완료</h3>
            
            {/* 와이어프레임 본문 영역 디자인 싱크로 */}
            <div className="bg-gray-100 rounded-xl p-5 w-full text-center text-sm font-bold text-gray-700 border border-gray-200 leading-relaxed mb-6">
              {modalMessage}
            </div>
            
            {/* 팝업 닫기 버튼 */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
            >
              확인
            </button>
            
          </div>
        </div>
      )}
      {/* ────────────────────────────────────────────────────────── */}

    </div>
  );
}