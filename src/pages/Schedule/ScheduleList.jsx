import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const getActiveElderId = (routeElderId) => routeElderId || getStoredElderId();

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;
const getTodayString = () => new Date().toISOString().slice(0, 10);

const toScheduledTime = (ampm, hour, minute) => {
  let convertedHour = parseInt(hour, 10) || 12;
  if (ampm === "오후" && convertedHour !== 12) convertedHour += 12;
  if (ampm === "오전" && convertedHour === 12) convertedHour = 0;
  return `${String(convertedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
};

const toDisplayTime = (timeString, repeatType) => {
  if (!timeString) return "시간 미정";
  const [hourText, minuteText] = timeString.split(":");
  let hourNumber = parseInt(hourText, 10);
  const ampmText = hourNumber >= 12 ? "오후" : "오전";
  if (hourNumber > 12) hourNumber -= 12;
  if (hourNumber === 0) hourNumber = 12;
  return `${repeatType || "반복 없음"} ${ampmText} ${hourNumber}시 ${minuteText}분`;
};

const toDisplayDate = (dateString) => {
  if (!dateString) return "날짜 미정";
  const [year, month, day] = String(dateString).slice(0, 10).split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

export default function ScheduleList() {
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetScheduleId, setTargetScheduleId] = useState(null);
  const [editDate, setEditDate] = useState(getTodayString);
  const [editAmpm, setEditAmpm] = useState("오전");
  const [editHour, setEditHour] = useState("10");
  const [editMinute, setEditMinute] = useState("00");
  const [editRepeat, setEditRepeat] = useState("매일");
  const [editScenarioId, setEditScenarioId] = useState("");

  const fetchSchedules = useCallback(async ({ showLoading = true } = {}) => {
    const token = getAuthToken();
    const activeElderId = getActiveElderId(elderId);
    if (!activeElderId) { setErrorMessage("먼저 관리할 어르신을 선택해주세요."); setLoading(false); return; }
    if (!token) { setErrorMessage("로그인 정보가 없습니다. 다시 로그인해 주세요."); setLoading(false); return; }
    try {
      if (showLoading) setLoading(true);
      setErrorMessage("");
      const response = await axios.get(`${API_BASE_URL}/api/v1/schedules/list`, {
        params: { elder_id: activeElderId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isSuccessResponse(response.data)) {
        setSchedules(response.data.result || []);
      } else {
        setSchedules([]);
        setErrorMessage(response.data?.message || "일정 목록을 불러오지 못했습니다.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "일정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [elderId]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const token = getAuthToken();
      const activeElderId = getActiveElderId(elderId);
      if (!activeElderId) { if (!ignore) { setErrorMessage("먼저 관리할 어르신을 선택해주세요."); setLoading(false); } return; }
      if (!token) { if (!ignore) { setErrorMessage("로그인 정보가 없습니다. 다시 로그인해 주세요."); setLoading(false); } return; }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/schedules/list`, {
          params: { elder_id: activeElderId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ignore) return;
        if (isSuccessResponse(response.data)) {
          setSchedules(response.data.result || []);
        } else {
          setSchedules([]);
          setErrorMessage(response.data?.message || "일정 목록을 불러오지 못했습니다.");
        }
      } catch (error) {
        if (!ignore) setErrorMessage(error.response?.data?.message || "일정 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [elderId]);

  useEffect(() => {
    let ignore = false;
    const fetchScenarios = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/scenarios/list`);
        if (ignore) return;
        if (isSuccessResponse(response.data)) {
          setScenarios(
            (response.data.result || []).filter(
              (s) => s.is_active !== false && s.is_active !== 0,
            ),
          );
        }
      } catch { /* 시나리오 없어도 목록은 표시 */ }
    };
    fetchScenarios();
    return () => { ignore = true; };
  }, []);

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    const token = getAuthToken();
    if (!token) { alert("로그인 정보가 없습니다. 다시 로그인해 주세요."); navigate("/login"); return; }
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/schedules/delete`, {
        data: { schedule_id: scheduleId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isSuccessResponse(response.data)) { alert("일정이 삭제되었습니다."); fetchSchedules(); }
    } catch (error) {
      alert(error.response?.data?.message || "삭제 중 서버 오류가 발생했습니다.");
    }
  };

  const openEditModal = (schedule) => {
    setTargetScheduleId(schedule.schedule_id);
    setEditScenarioId(schedule.scenario_id ? String(schedule.scenario_id) : "");
    setEditDate(schedule.scheduled_date ? String(schedule.scheduled_date).slice(0, 10) : getTodayString());
    setEditRepeat(schedule.repeat_type || "매일");
    if (schedule.scheduled_time) {
      const [hourText, minuteText] = schedule.scheduled_time.split(":");
      let hourNumber = parseInt(hourText, 10);
      const ampmValue = hourNumber >= 12 ? "오후" : "오전";
      if (hourNumber > 12) hourNumber -= 12;
      if (hourNumber === 0) hourNumber = 12;
      setEditAmpm(ampmValue);
      setEditHour(String(hourNumber).padStart(2, "0"));
      setEditMinute(String(minuteText).padStart(2, "0"));
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    const token = getAuthToken();
    if (!token) { alert("로그인 정보가 없습니다. 다시 로그인해 주세요."); navigate("/login"); return; }
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/schedules/update`,
        {
          schedule_id: targetScheduleId,
          scenario_id: editScenarioId ? Number(editScenarioId) : undefined,
          scheduled_date: editDate,
          scheduled_time: toScheduledTime(editAmpm, editHour, editMinute),
          repeat_type: editRepeat,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (isSuccessResponse(response.data)) { alert("일정이 수정되었습니다."); setIsEditModalOpen(false); fetchSchedules(); }
    } catch (error) {
      alert(error.response?.data?.message || "수정 중 서버 오류가 발생했습니다.");
    }
  };

  const toggleAmpm = () => setEditAmpm((prev) => (prev === "오전" ? "오후" : "오전"));
  const adjustHour = (dir) => {
    const c = parseInt(editHour, 10) || 12;
    setEditHour(String(dir === "up" ? (c === 12 ? 1 : c + 1) : (c === 1 ? 12 : c - 1)).padStart(2, "0"));
  };
  const adjustMinute = (dir) => {
    const c = parseInt(editMinute, 10) || 0;
    setEditMinute(String(dir === "up" ? (c === 59 ? 0 : c + 1) : (c === 0 ? 59 : c - 1)).padStart(2, "0"));
  };

  return (
    <div className="flex min-h-full flex-col py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: "#FF6E61" }}>대화 일정</p>
          <h1 className="mt-0.5 text-[22px] font-semibold">예약 일정 목록</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-2xl bg-[#f6f6f6] px-4 py-2 text-[13px] font-semibold text-[#1a1a1a]"
        >
          뒤로
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading && (
          <div className="rounded-2xl bg-[#f6f6f6] p-6 text-center text-[14px] text-[#A2A2A2]">
            일정을 불러오는 중입니다.
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl bg-[#FFF3EE] p-4 text-[14px] font-semibold" style={{ color: "#FF6E61" }}>
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && schedules.length === 0 && (
          <div className="rounded-2xl bg-[#f6f6f6] p-8 text-center text-[14px] text-[#A2A2A2]">
            예약된 일정이 없습니다.
          </div>
        )}

        {!loading && !errorMessage && schedules.map((item, index) => (
          <div key={item.schedule_id} className="rounded-2xl bg-[#f6f6f6] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#A2A2A2]">일정 {index + 1}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="rounded-xl px-3 py-1 text-[12px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.schedule_id)}
                  className="rounded-xl bg-white px-3 py-1 text-[12px] font-semibold text-red-400"
                >
                  삭제
                </button>
              </div>
            </div>
            {(item.scenario_title || item.scenario_category) && (
              <p className="mb-1 text-[13px] font-semibold" style={{ color: "#FF6E61" }}>
                {item.scenario_title || "대화 주제 미정"}
                {item.scenario_category ? ` · ${item.scenario_category}` : ""}
              </p>
            )}
            <p className="text-[16px] font-semibold">{toDisplayDate(item.scheduled_date)}</p>
            <p className="mt-1 text-[14px] text-[#A2A2A2]">{toDisplayTime(item.scheduled_time, item.repeat_type)}</p>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">일정 수정하기</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="h-8 w-8 rounded-full bg-[#f6f6f6] text-[14px] font-bold text-[#A2A2A2]"
              >
                ✕
              </button>
            </div>

            {scenarios.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[13px] font-semibold text-[#A2A2A2]">대화 주제</p>
                <select
                  value={editScenarioId}
                  onChange={(e) => setEditScenarioId(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-[#f6f6f6] px-4 text-[14px] font-semibold focus:outline-none"
                >
                  <option value="">기존 주제 유지</option>
                  {scenarios.map((s) => (
                    <option key={s.scenario_id} value={s.scenario_id}>
                      {s.title}{s.category ? ` - ${s.category}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <p className="mb-2 text-[13px] font-semibold text-[#A2A2A2]">날짜</p>
              <input
                type="date"
                value={editDate}
                min={getTodayString()}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-12 w-full rounded-2xl bg-[#f6f6f6] px-4 text-center text-[14px] font-semibold focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[13px] font-semibold text-[#A2A2A2]">시간</p>
              <div className="flex h-25 select-none items-center justify-between rounded-2xl bg-[#f6f6f6] px-4">
                <div className="flex flex-1 flex-col items-center">
                  <button type="button" onClick={toggleAmpm} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▲</button>
                  <button type="button" onClick={toggleAmpm} className="my-0.5 text-[16px] font-bold" style={{ color: "#FF6E61" }}>{editAmpm}</button>
                  <button type="button" onClick={toggleAmpm} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▼</button>
                </div>
                <span className="text-lg font-bold text-[#A2A2A2]">:</span>
                <div className="flex flex-1 flex-col items-center">
                  <button type="button" onClick={() => adjustHour("up")} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▲</button>
                  <span className="my-0.5 text-[18px] font-bold text-[#1a1a1a]">{editHour}</span>
                  <button type="button" onClick={() => adjustHour("down")} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▼</button>
                </div>
                <span className="text-lg font-bold text-[#A2A2A2]">:</span>
                <div className="flex flex-1 flex-col items-center">
                  <button type="button" onClick={() => adjustMinute("up")} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▲</button>
                  <span className="my-0.5 text-[18px] font-bold text-[#1a1a1a]">{editMinute}</span>
                  <button type="button" onClick={() => adjustMinute("down")} className="p-1 text-[10px] font-bold text-[#A2A2A2]">▼</button>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-[13px] font-semibold text-[#A2A2A2]">반복</p>
              <div className="flex items-center justify-around rounded-2xl bg-[#f6f6f6] p-3">
                {REPEAT_OPTIONS.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold">
                    <input
                      type="radio"
                      name="editRepeat"
                      checked={editRepeat === type}
                      onChange={() => setEditRepeat(type)}
                      className="h-3.5 w-3.5"
                      style={{ accentColor: "#FF6E61" }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <Button title="수정하기" main onClick={handleUpdateSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}
