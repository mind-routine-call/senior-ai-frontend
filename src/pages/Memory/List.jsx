import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDate = (dateValue) => {
  if (!dateValue) return "날짜 미입력";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "날짜 미입력";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
};

export default function MemoryList() {
  const navigate = useNavigate();
  const { elderId: routeElderId } = useParams();
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const activeElderId = useMemo(() => {
    const query = new URLSearchParams(window.location.search);
    return (
      routeElderId ||
      query.get("elder_id") ||
      localStorage.getItem("selectedElderId") ||
      localStorage.getItem("elder_id")
    );
  }, [routeElderId]);

  useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        if (!activeElderId) {
          setErrorMessage("먼저 관리할 어르신을 선택해주세요.");
          return;
        }
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const response = await axios.get(`${API_BASE_URL}/api/v1/memories/list/${activeElderId}`, config);
        if (!(response.data?.isSuccess || response.data?.success)) throw new Error();
        setMemories(response.data.result || []);
      } catch {
        setErrorMessage("추억 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemories();
  }, [activeElderId]);

  return (
    <div className="flex min-h-full flex-col py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: "#FF6E61" }}>등록메모리</p>
          <h1 className="mt-0.5 text-[22px] font-semibold">어르신 추억 관리</h1>
          <p className="mt-1 text-[13px] text-[#A2A2A2]">AI 대화 개인화에 활용됩니다.</p>
        </div>
        <button
          type="button"
          className="rounded-2xl px-4 py-2 text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
          onClick={() => {
            if (!activeElderId) { alert("먼저 관리할 어르신을 선택해주세요."); return; }
            navigate(`/memory/${activeElderId}/write`);
          }}
        >
          추가
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl bg-[#f6f6f6] p-6 text-center text-[14px] text-[#A2A2A2]">
          추억을 불러오는 중입니다.
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl bg-[#FFF3EE] p-4 text-[14px] font-semibold" style={{ color: "#FF6E61" }}>
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && memories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#f6f6f6] py-12 text-center">
          <p className="text-[15px] font-semibold">등록된 추억이 없습니다.</p>
          <p className="mt-1 text-[13px] text-[#A2A2A2]">첫 추억을 추가해 대화 소재를 만들어주세요.</p>
        </div>
      )}

      {!isLoading && !errorMessage && memories.length > 0 && (
        <div className="flex flex-col gap-3">
          {memories.map((memory) => (
            <button
              type="button"
              key={memory.memory_id}
              className="w-full rounded-2xl bg-[#f6f6f6] p-4 text-left transition active:scale-[0.99]"
              onClick={() => navigate(`/memory/${activeElderId}/write`, { state: { memory } })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold">{memory.title || "제목 없음"}</h2>
                  <p className="mt-0.5 text-[12px] text-[#A2A2A2]">{formatDate(memory.memory_date)}</p>
                </div>
                <span
                  className="shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
                >
                  수정
                </span>
              </div>
              {memory.content && (
                <p className="mt-2.5 line-clamp-2 text-[13px] leading-6 text-[#A2A2A2]">
                  {memory.content}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
