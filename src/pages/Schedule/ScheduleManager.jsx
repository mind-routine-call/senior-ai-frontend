import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

import Button from "../../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const REPEAT_OPTIONS = ["매일", "매주", "없음"];

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getStoredElderId = () =>
  localStorage.getItem("elder_id") ||
  localStorage.getItem("elderId") ||
  localStorage.getItem("selectedElderId");

const getActiveElderId = (routeElderId, searchParams) =>
  routeElderId ||
  searchParams.get("elder_id") ||
  searchParams.get("elderId") ||
  getStoredElderId();

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;
const getTodayString = () => new Date().toISOString().slice(0, 10);

const toScheduledTime = (ampm, hour, minute) => {
  let convertedHour = parseInt(hour, 10) || 12;
  if (ampm === "오후" && convertedHour !== 12) convertedHour += 12;
  if (ampm === "오전" && convertedHour === 12) convertedHour = 0;
  return `${String(convertedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
};

export default function ScheduleManager() {
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [searchParams] = useSearchParams();
  const activeElderId = getActiveElderId(elderId, searchParams);

  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [ampm, setAmpm] = useState("오전");
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [repeatType, setRepeatType] = useState("매일");
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [scenarioError, setScenarioError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchScenarios = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/scenarios/list`);
        if (ignore) return;
        if (isSuccessResponse(response.data)) {
          const activeScenarios = (response.data.result || []).filter(
            (s) => s.is_active !== false && s.is_active !== 0,
          );
          setScenarios(activeScenarios);
          setScenarioError("");
          if (activeScenarios.length > 0) setSelectedScenarioId(String(activeScenarios[0].scenario_id));
        } else {
          setScenarioError(response.data?.message || "대화 시나리오를 불러오지 못했습니다.");
        }
      } catch {
        if (!ignore) setScenarioError("대화 시나리오를 불러오지 못했습니다.");
      }
    };
    fetchScenarios();
    return () => { ignore = true; };
  }, []);

  const toggleAmpm = () => setAmpm((prev) => (prev === "오전" ? "오후" : "오전"));

  const increaseHour = () => {
    const current = parseInt(hour, 10) || 12;
    setHour(String(current === 12 ? 1 : current + 1).padStart(2, "0"));
  };
  const decreaseHour = () => {
    const current = parseInt(hour, 10) || 12;
    setHour(String(current === 1 ? 12 : current - 1).padStart(2, "0"));
  };
  const increaseMinute = () => {
    const current = parseInt(minute, 10) || 0;
    setMinute(String(current === 59 ? 0 : current + 1).padStart(2, "0"));
  };
  const decreaseMinute = () => {
    const current = parseInt(minute, 10) || 0;
    setMinute(String(current === 0 ? 59 : current - 1).padStart(2, "0"));
  };

  const handleHourChange = (value) => {
    if (value === "") { setHour(""); return; }
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    setHour(String(Math.min(12, Math.max(1, n))).padStart(2, "0"));
  };
  const handleMinuteChange = (value) => {
    if (value === "") { setMinute(""); return; }
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    setMinute(String(Math.min(59, Math.max(0, n))).padStart(2, "0"));
  };
  const handleBlur = () => {
    if (hour === "") setHour("12");
    if (minute === "") setMinute("00");
  };

  const handleReservation = async () => {
    const token = getAuthToken();
    if (!activeElderId) { alert("먼저 관리할 어르신을 선택해주세요."); navigate("/dashboard"); return; }
    if (!token) { alert("로그인 정보가 없습니다. 다시 로그인해 주세요."); navigate("/login"); return; }
    if (!selectedScenarioId) { alert("대화 시나리오를 선택해주세요."); return; }
    try {
      setSubmitting(true);
      const scheduled_time = toScheduledTime(ampm, hour, minute);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/schedules/create`,
        { elder_id: Number(activeElderId), scenario_id: Number(selectedScenarioId), scheduled_date: selectedDate, scheduled_time, repeat_type: repeatType },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (isSuccessResponse(response.data)) {
        setModalMessage(`${selectedDate} ${repeatType} ${ampm} ${hour}시 ${minute}분 대화 일정이 예약되었습니다.`);
        setIsModalOpen(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "예약 중 서버 통신 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: "#FF6E61" }}>대화 일정</p>
          <h1 className="mt-0.5 text-[22px] font-semibold">일정 예약하기</h1>
        </div>
        <button
          type="button"
          onClick={() => { if (!activeElderId) { alert("먼저 관리할 어르신을 선택해주세요."); navigate("/dashboard"); return; } navigate(`/schedule/list/${activeElderId}`); }}
          className="rounded-2xl px-4 py-2 text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
        >
          예약 목록
        </button>
      </div>

      {/* 날짜 설정 */}
      <div className="mb-5">
        <p className="mb-2 text-[15px] font-semibold">날짜 설정</p>
        <input
          id="schedule-date"
          type="date"
          value={selectedDate}
          min={getTodayString()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-14 w-full rounded-2xl bg-[#f6f6f6] px-4 text-center text-[15px] font-semibold text-[#1a1a1a] focus:outline-none"
        />
      </div>

      {/* 대화 주제 */}
      <div className="mb-5">
        <p className="mb-2 text-[15px] font-semibold">대화 주제</p>
        {scenarioError ? (
          <div className="rounded-2xl bg-[#FFF3EE] px-4 py-3 text-[13px] font-semibold" style={{ color: "#FF6E61" }}>
            {scenarioError}
          </div>
        ) : (
          <select
            id="schedule-scenario"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="h-14 w-full rounded-2xl bg-[#f6f6f6] px-4 text-[14px] font-semibold text-[#1a1a1a] focus:outline-none"
          >
            {scenarios.length === 0 ? (
              <option value="">등록된 시나리오 없음</option>
            ) : (
              scenarios.map((s) => (
                <option key={s.scenario_id} value={s.scenario_id}>
                  {s.title}{s.category ? ` - ${s.category}` : ""}
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {/* 시간 설정 */}
      <div className="mb-5">
        <p className="mb-2 text-[15px] font-semibold">시간 설정</p>
        <div className="flex h-30 select-none items-center justify-between rounded-2xl bg-[#f6f6f6] px-6">
          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={toggleAmpm} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▲</button>
            <button
              type="button"
              onClick={toggleAmpm}
              className="my-0.5 min-w-12 rounded-xl px-2 py-0.5 text-center text-[18px] font-bold"
              style={{ color: "#FF6E61" }}
            >
              {ampm}
            </button>
            <button type="button" onClick={toggleAmpm} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▼</button>
          </div>

          <span className="pb-1 text-2xl font-bold text-[#A2A2A2]">:</span>

          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={increaseHour} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▲</button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              onBlur={handleBlur}
              className="my-0.5 w-full bg-transparent text-center text-[22px] font-bold text-[#1a1a1a] focus:outline-none"
            />
            <button type="button" onClick={decreaseHour} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▼</button>
          </div>

          <span className="pb-1 text-2xl font-bold text-[#A2A2A2]">:</span>

          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={increaseMinute} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▲</button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              onBlur={handleBlur}
              className="my-0.5 w-full bg-transparent text-center text-[22px] font-bold text-[#1a1a1a] focus:outline-none"
            />
            <button type="button" onClick={decreaseMinute} className="p-1.5 text-[11px] font-bold text-[#A2A2A2]">▼</button>
          </div>
        </div>
      </div>

      {/* 반복 설정 */}
      <div className="mb-8">
        <p className="mb-2 text-[15px] font-semibold">반복 설정</p>
        <div className="flex items-center justify-around rounded-2xl bg-[#f6f6f6] p-4">
          {REPEAT_OPTIONS.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-[#1a1a1a]">
              <input
                type="radio"
                name="repeat"
                checked={repeatType === type}
                onChange={() => setRepeatType(type)}
                className="h-4 w-4"
                style={{ accentColor: "#FF6E61" }}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <Button title={submitting ? "예약 중..." : "예약하기"} main onClick={handleReservation} disabled={submitting} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-6 shadow-2xl">
            <div
              className="mb-4 h-12 w-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mb-1 text-[18px] font-semibold">예약 완료</h3>
            <p className="mb-6 text-center text-[13px] leading-6 text-[#A2A2A2]">{modalMessage}</p>
            <Button title="확인" main onClick={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
