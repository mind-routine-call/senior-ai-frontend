// src/pages/Schedule/ScheduleList.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import backIcon from "../../assets/img/back.svg";
import Button from "../../components/Button"; // 공통 버튼 재활용

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ScheduleList() {
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛠️ 수정용 모달 상태 관리들
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetScheduleId, setTargetScheduleId] = useState(null);
  const [editDate, setEditDate] = useState("2026-06-01");
  const [editAmpm, setEditAmpm] = useState("오전");
  const [editHour, setEditHour] = useState("10");
  const [editMinute, setEditMinute] = useState("00");
  const [editRepeat, setEditRepeat] = useState("매주"); 

  // ✨ [해결책] 조회 함수를 바깥으로 완전히 독립시켰고, 두 가지 토큰 명칭에 완벽 대응하게 통합했습니다.
  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const targetId = elderId || 1; 

      console.log("일정 목록 요청 전송 중... 토큰 상태:", token ? "존재함" : "없음");

      const response = await axios.get(
        `${API_BASE_URL}/api/v1/schedules/elder/${targetId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSchedules(response.data.result);
      }
    } catch (error) {
      console.error("일정 목록 로드 실패", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. 컴포넌트 로드 시 최초 1회 통합 조회 함수 작동
  useEffect(() => {
    fetchSchedules();
  }, [elderId]);

  // 2. 🗑️ 삭제하기 API 연동 처리
  const handleDelete = async (scheduleId) => {
    if (!window.confirm("해당 일정을 삭제하시겠습니까?")) return;
    try {
      // ✨ 토큰 백업 다중 검증 장착
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/schedules/delete`,
        { schedule_id: scheduleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert("일정이 정상적으로 삭제되었습니다.");
        fetchSchedules(); // ✨ 이제 바깥의 무적 함수가 작동하며 리스트가 새로고침됩니다!
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "삭제 중 서버 오류가 발생했습니다.");
    }
  };

  // 3. ✍️ 수정 팝업창 열기 핸들러 (기존 데이터 세팅)
  const openEditModal = (schedule) => {
    setTargetScheduleId(schedule.schedule_id);
    setEditRepeat(schedule.repeat_type === "없음" ? "매주" : schedule.repeat_type);
    
    if (schedule.scheduled_time) {
      const [hh, mm] = schedule.scheduled_time.split(":");
      let hourNum = parseInt(hh, 10);
      const ampmVal = hourNum >= 12 ? "오후" : "오전";
      if (hourNum > 12) hourNum -= 12;
      if (hourNum === 0) hourNum = 12;

      setEditAmpm(ampmVal);
      setEditHour(String(hourNum).padStart(2, "0"));
      setEditMinute(String(mm).padStart(2, "0"));
    }
    setIsEditModalOpen(true);
  };

  // 4. 💾 수정하기 최종 제출 API 연동 처리
  const handleUpdateSubmit = async () => {
    try {
      // ✨ 토큰 백업 다중 검증 장착
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      
      // 24시간계 시간 보정 연산
      let convertedHour = parseInt(editHour, 10) || 12;
      if (editAmpm === "오후" && convertedHour !== 12) convertedHour += 12;
      else if (editAmpm === "오전" && convertedHour === 12) convertedHour = 0;

      const scheduled_time = `${String(convertedHour).padStart(2, "0")}:${String(editMinute).padStart(2, "0")}:00`;

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/schedules/update`,
        {
          schedule_id: targetScheduleId,
          scheduled_time,
          repeat_type: editRepeat
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("일정 수정이 완료되었습니다.");
        setIsEditModalOpen(false);
        fetchSchedules(); // ✨ 이제 가두리 양식장을 탈출했으므로 화면이 깔끔하게 리로드됩니다!
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "수정 처리 중 오류가 발생했습니다.");
    }
  };

  // ⏳ 삼각형 컨트롤용 인라인 도우미 함수들
  const toggleAmpm = () => setEditAmpm((p) => (p === "오전" ? "오후" : "오전"));
  const adjustHour = (dir) => {
    let curr = parseInt(editHour, 10) || 12;
    curr = dir === "up" ? (curr === 12 ? 1 : curr + 1) : (curr === 1 ? 12 : curr - 1);
    setEditHour(String(curr).padStart(2, "0"));
  };
  const adjustMin = (dir) => {
    let curr = parseInt(editMinute, 10) || 0;
    curr = dir === "up" ? (curr === 59 ? 0 : curr + 1) : (curr === 0 ? 59 : curr - 1);
    setEditMinute(String(curr).padStart(2, "0"));
  };

  const formatTimeDisplay = (timeStr, repeatType) => {
    if (!timeStr) return "";
    const [hh, mm] = timeStr.split(":");
    let hourNum = parseInt(hh, 10);
    const ampmText = hourNum >= 12 ? "오후" : "오전";
    if (hourNum > 12) hourNum -= 12;
    if (hourNum === 0) hourNum = 12;

    if (repeatType === "없음") {
      return `6월 8일 ${ampmText} ${hourNum}시 ${mm}분`;
    }
    return `${repeatType} 수요일 ${ampmText} ${hourNum}시 ${mm}분`;
  };

  return (
    <div className="w-full h-full py-6 flex flex-col font-sans relative">
      
      {/* 헤더 상단바 */}
      <div className="flex items-center justify-start mb-6">
        <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity p-1">
          <img src={backIcon} alt="뒤로가기" className="w-6 h-6" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900 ml-3">예약 일정 목록</h1>
      </div>

      {/* 리스트 본문 */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
        {loading ? (
          <p className="text-center text-gray-400 py-10 text-sm">일정을 가져오는 중입니다...</p>
        ) : schedules.length > 0 ? (
          schedules.map((item, index) => (
            <div key={item.schedule_id} className="bg-[#e0e0e0] p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-3 relative">
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-800">일정 {index + 1}</h3>
                <button 
                  onClick={() => openEditModal(item)}
                  className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-white px-2.5 py-1 rounded-lg border border-gray-300 flex items-center gap-1 shadow-xs"
                >
                  ✏️ 수정하기
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 font-bold text-[15px]">
                <span className="text-xl">🕒</span>
                <span>{formatTimeDisplay(item.scheduled_time, item.repeat_type)}</span>
              </div>

              <button 
                onClick={() => handleDelete(item.schedule_id)}
                className="absolute bottom-4 right-4 text-gray-600 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-xs border border-gray-200"
              >
                🗑️
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-20 font-bold">예약된 일정이 없습니다.</p>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🛠️ 일정 수정 팝업 모달창 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-[32px] p-5 w-full max-w-sm border-[3px] border-black shadow-2xl flex flex-col relative animate-fade-in max-h-[780px] overflow-y-auto">
            
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="absolute right-5 top-5 text-xl font-bold text-gray-400 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-black text-center text-black mb-4">일정 수정하기</h2>

            {/* 달력 에셋 구역 */}
            <div className="border border-gray-200 rounded-2xl p-2 mb-4 flex flex-col items-center bg-gray-50">
              <input 
                type="date" 
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full text-center font-bold text-sm bg-white p-2 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>

            {/* 휠 스크롤 시간 정렬 세트 */}
            <div 
              style={{ 
                display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                backgroundColor: "#f6f6f6", borderRadius: "16px", padding: "12px", height: "100px", userSelect: "none"
              }}
              className="mb-4 border border-gray-100"
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <button onClick={toggleAmpm} className="text-gray-500 font-bold text-[10px]">▲</button>
                <span className="text-[18px] font-black text-gray-800 my-0.5 cursor-pointer" onClick={toggleAmpm}>{editAmpm}</span>
                <button onClick={toggleAmpm} className="text-gray-500 font-bold text-[10px]">▼</button>
              </div>
              <span className="text-xl font-black text-gray-400 px-1">:</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <button onClick={() => adjustHour("up")} className="text-gray-500 font-bold text-[10px]">▲</button>
                <span className="text-[20px] font-black text-gray-800 my-0.5">{editHour}</span>
                <button onClick={() => adjustHour("down")} className="text-gray-500 font-bold text-[10px]">▼</button>
              </div>
              <span className="text-xl font-black text-gray-400 px-1">:</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <button onClick={() => adjustMin("up")} className="text-gray-500 font-bold text-[10px]">▲</button>
                <span className="text-[20px] font-black text-gray-800 my-0.5">{editMinute}</span>
                <button onClick={() => adjustMin("down")} className="text-gray-500 font-bold text-[10px]">▼</button>
              </div>
            </div>

            {/* 하단 반복 설정 바 */}
            <div className="bg-[#e6fbf7] rounded-xl p-3 flex items-center justify-between mb-6 border border-[#cdf5ed]">
              <span className="font-bold text-gray-800 text-xs">반복 설정하기</span>
              <div className="flex gap-4">
                {["매주", "매달"].map((type) => (
                  <label key={type} className="flex items-center gap-1 cursor-pointer text-xs font-bold text-gray-700">
                    <input 
                      type="radio" 
                      name="editRepeat" 
                      checked={editRepeat === type} 
                      onChange={() => setEditRepeat(type)}
                      className="accent-black w-3.5 h-3.5"
                    /> {type}
                  </label>
                ))}
              </div>
            </div>

            <Button title="수정하기" main={true} onClick={handleUpdateSubmit} />
          </div>
        </div>
      )}

    </div>
  );
}