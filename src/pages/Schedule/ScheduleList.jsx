import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Button from "../../components/Button";
import backIcon from "../../assets/img/back.svg";

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

  if (ampm === "오후" && convertedHour !== 12) {
    convertedHour += 12;
  }

  if (ampm === "오전" && convertedHour === 12) {
    convertedHour = 0;
  }

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

    if (!activeElderId) {
      setErrorMessage("먼저 관리할 어르신을 선택해주세요.");
      setLoading(false);
      return;
    }

    if (!token) {
      setErrorMessage("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
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
      console.error(error);
      setErrorMessage(error.response?.data?.message || "일정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [elderId]);

  useEffect(() => {
    let ignore = false;

    const loadInitialSchedules = async () => {
      const token = getAuthToken();
      const activeElderId = getActiveElderId(elderId);

      if (!activeElderId) {
        if (!ignore) {
          setErrorMessage("먼저 관리할 어르신을 선택해주세요.");
          setLoading(false);
        }
        return;
      }

      if (!token) {
        if (!ignore) {
          setErrorMessage("로그인 정보가 없습니다. 다시 로그인해 주세요.");
          setLoading(false);
        }
        return;
      }

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
        if (!ignore) {
          console.error(error);
          setErrorMessage(error.response?.data?.message || "일정 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialSchedules();

    return () => {
      ignore = true;
    };
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
              (scenario) => scenario.is_active !== false && scenario.is_active !== 0,
            ),
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error("시나리오 목록 조회 실패", error);
        }
      }
    };

    fetchScenarios();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;

    const token = getAuthToken();
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/schedules/delete`, {
        data: { schedule_id: scheduleId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isSuccessResponse(response.data)) {
        alert("일정이 삭제되었습니다.");
        fetchSchedules();
      }
    } catch (error) {
      console.error(error);
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
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      navigate("/login");
      return;
    }

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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (isSuccessResponse(response.data)) {
        alert("일정이 수정되었습니다.");
        setIsEditModalOpen(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "수정 중 서버 오류가 발생했습니다.");
    }
  };

  const toggleAmpm = () => setEditAmpm((prev) => (prev === "오전" ? "오후" : "오전"));

  const adjustHour = (direction) => {
    const current = parseInt(editHour, 10) || 12;
    const next = direction === "up" ? (current === 12 ? 1 : current + 1) : current === 1 ? 12 : current - 1;
    setEditHour(String(next).padStart(2, "0"));
  };

  const adjustMinute = (direction) => {
    const current = parseInt(editMinute, 10) || 0;
    const next = direction === "up" ? (current === 59 ? 0 : current + 1) : current === 0 ? 59 : current - 1;
    setEditMinute(String(next).padStart(2, "0"));
  };

  return (
    <div className="relative flex h-full w-full flex-col px-6 py-6 font-sans">
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full p-1 transition-opacity hover:opacity-70"
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" className="h-6 w-6" />
        </button>
        <h1 className="ml-3 text-[20px] font-black text-gray-900">예약 일정 목록</h1>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {loading && (
          <p className="py-10 text-center text-sm font-bold text-gray-400">일정을 불러오는 중입니다.</p>
        )}

        {!loading && errorMessage && (
          <p className="rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && schedules.length === 0 && (
          <p className="py-20 text-center font-bold text-gray-400">예약된 일정이 없습니다.</p>
        )}

        {!loading &&
          !errorMessage &&
          schedules.map((item, index) => (
            <div
              key={item.schedule_id}
              className="relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-[#f6f6f6] p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-800">일정 {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700"
                >
                  수정
                </button>
              </div>

              <p className="text-[15px] font-bold text-gray-700">
                {item.scenario_title || "대화 주제 미정"}
                {item.scenario_category ? ` · ${item.scenario_category}` : ""}
              </p>

              <p className="text-[15px] font-bold text-gray-700">
                {toDisplayDate(item.scheduled_date)}
              </p>

              <p className="text-[15px] font-bold text-gray-700">
                {toDisplayTime(item.scheduled_time, item.repeat_type)}
              </p>

              <button
                type="button"
                onClick={() => handleDelete(item.schedule_id)}
                className="absolute bottom-4 right-4 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-red-500"
              >
                삭제
              </button>
            </div>
          ))}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[780px] w-full max-w-sm flex-col overflow-y-auto rounded-[32px] border-[3px] border-black bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-black">일정 수정하기</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full px-2 text-xl font-bold text-gray-500"
                aria-label="닫기"
              >
                x
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-2">
              <label className="mb-3 block">
                <span className="mb-2 block text-sm font-black text-gray-700">대화 주제</span>
                <select
                  value={editScenarioId}
                  onChange={(event) => setEditScenarioId(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold text-gray-800 focus:outline-none"
                >
                  <option value="">기존 주제 유지</option>
                  {scenarios.map((scenario) => (
                    <option key={scenario.scenario_id} value={scenario.scenario_id}>
                      {scenario.title} {scenario.category ? `- ${scenario.category}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <input
                type="date"
                value={editDate}
                min={getTodayString()}
                onChange={(event) => setEditDate(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-center text-sm font-bold focus:outline-none"
              />
            </div>

            <div className="mb-4 flex h-[100px] select-none items-center justify-between rounded-2xl border border-gray-100 bg-[#f6f6f6] p-3">
              <div className="flex flex-1 flex-col items-center">
                <button type="button" onClick={toggleAmpm} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4l-10 16h20z" />
  </svg>
</button>
                <button
                  type="button"
                  onClick={toggleAmpm}
                  className="my-0.5 text-[18px] font-black text-gray-800"
                >
                  {editAmpm}
                </button>
                <button type="button" onClick={toggleAmpm} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
              </div>
              <span className="px-1 text-xl font-black text-gray-400">:</span>
              <div className="flex flex-1 flex-col items-center">
                <button type="button" onClick={() => adjustHour("up")} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4l-10 16h20z" />
  </svg>
</button>
                <span className="my-0.5 text-[20px] font-black text-gray-800">{editHour}</span>
                <button type="button" onClick={()=>adjustHour("down")} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
              </div>
              <span className="px-1 text-xl font-black text-gray-400">:</span>
              <div className="flex flex-1 flex-col items-center">
                <button type="button" onClick={()=> adjustMinute("up")} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4l-10 16h20z" />
  </svg>
</button>
                <span className="my-0.5 text-[20px] font-black text-gray-800">{editMinute}</span>
                <button type="button" onClick={()=>adjustMinute("down")} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between rounded-xl border border-[#cdf5ed] bg-[#e6fbf7] p-3">
              <span className="text-xs font-bold text-gray-800">반복 설정</span>
              <div className="flex gap-4">
                {REPEAT_OPTIONS.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-1 text-xs font-bold text-gray-700">
                    <input
                      type="radio"
                      name="editRepeat"
                      checked={editRepeat === type}
                      onChange={() => setEditRepeat(type)}
                      className="h-3.5 w-3.5 accent-black"
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
