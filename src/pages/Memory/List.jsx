import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDate = (dateValue) => {
  if (!dateValue) return "날짜 미입력";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "날짜 미입력";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
      localStorage.getItem("elder_id") ||
      "1"
    );
  }, [routeElderId]);

  useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/memories/list/${activeElderId}`,
          config,
        );

        if (!(response.data?.isSuccess || response.data?.success)) {
          throw new Error("등록메모리 목록 조회 실패");
        }

        setMemories(response.data.result || []);
      } catch (error) {
        console.error("등록메모리 목록 조회 실패", error);
        setErrorMessage("등록메모리를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [activeElderId]);

  return (
    <div className="flex min-h-full flex-col gap-4 bg-white py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-indigo-500">등록메모리</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
            어르신 추억 관리
          </h1>
          <p className="mt-2 text-sm font-medium leading-5 text-gray-500">
            보호자가 입력한 추억 정보를 AI 대화 개인화에 활용합니다.
          </p>
        </div>
        <button
          className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
          onClick={() => navigate(`/memory/${activeElderId}/write`)}
          type="button"
        >
          추가
        </button>
      </header>

      {isLoading && (
        <div className="flex h-32 items-center justify-center rounded-2xl bg-gray-50 text-sm font-semibold text-gray-400">
          등록메모리를 불러오고 있습니다.
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && memories.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
          <p className="text-base font-bold text-gray-700">
            등록된 추억이 없습니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            첫 추억을 추가해 대화 소재를 만들어주세요.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && memories.length > 0 && (
        <section className="flex flex-col gap-3">
          {memories.map((memory) => (
            <button
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left shadow-sm transition hover:bg-indigo-50"
              key={memory.memory_id}
              onClick={() =>
                navigate(`/memory/${activeElderId}/write`, {
                  state: { memory },
                })
              }
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold text-gray-900">
                    {memory.title || "제목 없음"}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {formatDate(memory.memory_date)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                  수정
                </span>
              </div>
              {memory.content && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                  {memory.content}
                </p>
              )}
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
