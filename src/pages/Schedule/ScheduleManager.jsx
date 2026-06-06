import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

import Button from "../../components/Button";
import backIcon from "../../assets/img/back.svg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEFAULT_SCENARIO_ID = 2;
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

  if (ampm === "오후" && convertedHour !== 12) {
    convertedHour += 12;
  }

  if (ampm === "오전" && convertedHour === 12) {
    convertedHour = 0;
  }

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleAmpm = () => {
    setAmpm((prev) => (prev === "오전" ? "오후" : "오전"));
  };

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
    if (value === "") {
      setHour("");
      return;
    }

    let numberValue = parseInt(value, 10);
    if (Number.isNaN(numberValue)) return;
    numberValue = Math.min(12, Math.max(1, numberValue));
    setHour(String(numberValue).padStart(2, "0"));
  };

  const handleMinuteChange = (value) => {
    if (value === "") {
      setMinute("");
      return;
    }

    let numberValue = parseInt(value, 10);
    if (Number.isNaN(numberValue)) return;
    numberValue = Math.min(59, Math.max(0, numberValue));
    setMinute(String(numberValue).padStart(2, "0"));
  };

  const handleBlur = () => {
    if (hour === "") setHour("12");
    if (minute === "") setMinute("00");
  };

  const handleReservation = async () => {
    const token = getAuthToken();

    if (!activeElderId) {
      alert("먼저 관리할 어르신을 선택해주세요.");
      navigate("/dashboard");
      return;
    }

    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const scheduled_time = toScheduledTime(ampm, hour, minute);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/schedules/create`,
        {
          elder_id: Number(activeElderId),
          scenario_id: DEFAULT_SCENARIO_ID,
          scheduled_date: selectedDate,
          scheduled_time,
          repeat_type: repeatType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (isSuccessResponse(response.data)) {
        setModalMessage(
          `${selectedDate} ${repeatType} ${ampm} ${hour}시 ${minute}분 대화 일정이 예약되었습니다.`,
        );
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "예약 중 서버 통신 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col px-6 py-6 font-sans">
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          className="rounded-full p-1 transition-opacity hover:opacity-70"
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" className="h-6 w-6" />
        </button>
        <h1 className="ml-3 text-[20px] font-black text-gray-900">대화 일정 예약하기</h1>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <label htmlFor="schedule-date" className="text-[18px] font-bold text-gray-800">
          날짜 설정
        </label>
        <input
          id="schedule-date"
          type="date"
          value={selectedDate}
          min={getTodayString()}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="h-15 w-full rounded-xl bg-[#f6f6f6] px-4 text-center font-bold text-gray-800 focus:border focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-[18px] font-bold text-gray-800">시간 설정</p>
        <div className="flex h-[120px] select-none items-center justify-between rounded-xl bg-[#f6f6f6] p-4">
          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={toggleAmpm} className="p-1 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-10 16h20z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleAmpm}
              className="my-1 text-[20px] font-black text-gray-800"
            >
              {ampm}
            </button>
            <button type="button" onClick={toggleAmpm} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
          </div>

          <span className="pb-1 text-2xl font-black text-gray-400">:</span>

          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={increaseHour} className="p-1 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-10 16h20z" />
              </svg>
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={hour}
              onChange={(event) => handleHourChange(event.target.value)}
              onBlur={handleBlur}
              className="my-0.5 w-full bg-transparent text-center text-[22px] font-black tracking-wide text-gray-800 focus:outline-none"
            />
            <button type="button" onClick={decreaseHour} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
          </div>

          <span className="pb-1 text-2xl font-black text-gray-400">:</span>

          <div className="flex flex-1 flex-col items-center">
            <button type="button" onClick={increaseMinute} className="p-1 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-10 16h20z" />
              </svg>
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minute}
              onChange={(event) => handleMinuteChange(event.target.value)}
              onBlur={handleBlur}
              className="my-0.5 w-full bg-transparent text-center text-[22px] font-black tracking-wide text-gray-800 focus:outline-none"
            />
            <button type="button" onClick={decreaseMinute} className="p-1 flex items-center justify-center">
  <svg className="w-3 h-3 text-gray-400 hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 20l10-16h-20z" />
  </svg>
</button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-2 text-[18px] font-bold text-gray-800">반복 설정</p>
        <div className="flex items-center justify-around rounded-xl bg-[#f6f6f6] p-4">
          {REPEAT_OPTIONS.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-base font-bold text-gray-700">
              <input
                type="radio"
                name="repeat"
                checked={repeatType === type}
                onChange={() => setRepeatType(type)}
                className="h-4 w-4 accent-black"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <Button title={submitting ? "예약 중..." : "예약하기"} main onClick={handleReservation} />
      </div>

      <button
        type="button"
        onClick={() => {
          if (!activeElderId) {
            alert("먼저 관리할 어르신을 선택해주세요.");
            navigate("/dashboard");
            return;
          }
          navigate(`/schedule/list/${activeElderId}`);
        }}
        className="absolute bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-xs font-black text-white shadow-lg transition-colors hover:bg-gray-800"
      >
        조회
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-black text-gray-900">예약 완료</h3>
            <div className="mb-6 w-full rounded-xl border border-gray-200 bg-gray-100 p-5 text-center text-sm font-bold leading-relaxed text-gray-700">
              {modalMessage}
            </div>
            <Button title="확인" main onClick={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
