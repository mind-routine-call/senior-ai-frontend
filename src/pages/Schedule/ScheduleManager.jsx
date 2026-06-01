// src/pages/Schedule/ScheduleManager.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../../components/Button";
import Input from "../../components/Input";
import backIcon from "../../assets/img/back.svg";
import mind_routine from "../../assets/img/mind_routine.svg";

export default function ScheduleManager() {
  const navigate = useNavigate();

  // 1. 입력 폼 상태 관리 (State)
  const [selectedDate, setSelectedDate] = useState("2026-06-01");
  const [ampm, setAmpm] = useState("오전");
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [repeatType, setRepeatType] = useState("매일");

  // 예약 완료 팝업
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 가상의 기본 데이터 (연결하면서 수정하기!!!)
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
      let convertedHour = parseInt(hour, 10) || 12;
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
    
      <div className="w-full h-full py-6 flex flex-col font-sans relative">
        
        {/* 헤더 타이틀 바 */}
        <div className="flex items-center justify-start mb-6">
          <button 
            onClick={() => navigate('/mypage')} 
            className="hover:opacity-70 transition-opacity p-1"
          >
          <img src={backIcon} alt="뒤로가기" className="w-6 h-6" />
          </button>
          <h1 className="text-[20px] font-black text-gray-900 ml-3">채팅 일정 예약하기</h1>
        </div>

        {/* [날짜] 달력 컴포넌트 구역 */}
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-[18px]">날짜 설정</p>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#f6f6f6] h-15 rounded-lg px-4 font-bold text-center text-gray-800 focus:outline-none focus:border border-blue-400"
          />
        </div>

        {/* 🛠️ [시간] 삼각형 클릭 + 키보드 직접 입력 하이브리드 구역 */}
        <div className="mb-6">
        <p className="text-[18px] mb-2 font-bold text-gray-800">시간 설정</p>
        
        {/* 두 번째 사진처럼 회색 박스 안에 모든 요소를 가로(row)로 나란히 가둡니다 */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between",
            backgroundColor: "#f6f6f6",
            borderRadius: "12px",
            padding: "16px",
            height: "120px",
            userSelect: "none"
          }}
        >
          
          {/* [오전/오후 조작단] 내부 요소를 세로(column)로 정렬 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <button onClick={toggleAmpm} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▲</button>
            <span className="text-[20px] font-black text-gray-800 my-1 cursor-pointer" onClick={toggleAmpm}>
              {ampm}
            </span>
            <button onClick={toggleAmpm} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▼</button>
          </div>

          {/* 콜론 기호는 중앙 세로 정렬 */}
          <span className="text-2xl font-black text-gray-400" style={{ alignSelf: "center", paddingBottom: "4px" }}>:</span>

          {/* [시(Hour)] 내부 요소를 세로(column)로 정렬 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <button onClick={increaseHour} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▲</button>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-[22px] font-black text-gray-800 text-center my-0.5 focus:outline-none tracking-wide"
              style={{ border: "none", outline: "none", textAlign: "center" }}
            />
            <button onClick={decreaseHour} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▼</button>
          </div>

          {/* 콜론 기호 */}
          <span className="text-2xl font-black text-gray-400" style={{ alignSelf: "center", paddingBottom: "4px" }}>:</span>

          {/* [분(Minute)] 내부 요소를 세로(column)로 정렬 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <button onClick={increaseMinute} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▲</button>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-[22px] font-black text-gray-800 text-center my-0.5 focus:outline-none tracking-wide"
              style={{ border: "none", outline: "none", textAlign: "center" }}
            />
            <button onClick={decreaseMinute} className="text-gray-400 hover:text-black font-bold p-1 text-xs">▼</button>
          </div>
        </div>
        

        {/* [반복] 라디오 버튼 토글 구역 */}
        <div className="mb-8">
        <p className="text-[18px] mb-2">반복 설정하기</p>
        <div className="bg-[#f6f6f6] rounded-xl p-4 flex justify-around items-center">
          {["매일", "매주", "없음"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-md font-medium text-gray-700">
              <input 
                type="radio" 
                name="repeat" 
                checked={repeatType === type} 
                onChange={() => setRepeatType(type)}
                className="w-4 h-4 accent-black"
              /> {type === "없음" ? "안함" : type}
            </label>
          ))}
        </div>
      </div>

        {/* 최종 제출 버튼 */}
        <div className="mt-auto">
        <Button title="예약하기" main={true} onClick={handleReservation} />
      </div>
    </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ✨ [모달 팝업] 조건부 렌더링 영역 (isModalOpen이 true일 때만 레이어로 나타남) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-black text-gray-900 mb-4">🔔 예약 완료</h3>
            <div className="bg-gray-100 rounded-xl p-5 w-full text-center text-sm font-bold text-gray-700 border border-gray-200 leading-relaxed mb-6">
              {modalMessage}
            </div>
            <Button title="확인" main={true} onClick={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}