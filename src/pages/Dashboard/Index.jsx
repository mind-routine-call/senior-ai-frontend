import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const clampScore = (value) => {
  const score = Number(value || 0);
  return Math.max(0, Math.min(100, score));
};

const formatDate = (dateValue) => {
  if (!dateValue) return "기록 없음";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "기록 없음";

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "시간 정보 없음";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "시간 정보 없음";

  return date.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGenderLabel = (gender) => {
  if (gender === "M") return "남성";
  if (gender === "F") return "여성";
  return "성별 미입력";
};

const getRiskLabel = (riskLevel) => {
  if (!riskLevel) return "평가 전";
  if (riskLevel === "LOW") return "안정";
  if (riskLevel === "MEDIUM") return "관찰";
  if (riskLevel === "HIGH") return "주의";
  return riskLevel;
};

export default function Dashboard() {
  const { elderId: routeElderId } = useParams();
  const [summaryData, setSummaryData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [chatsData, setChatsData] = useState([]);
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
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;

        const [summaryRes, chartsRes, chatsRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/v1/dashboard/${activeElderId}/summary`,
            config,
          ),
          axios.get(
            `${API_BASE_URL}/api/v1/dashboard/${activeElderId}/charts`,
            config,
          ),
          axios.get(
            `${API_BASE_URL}/api/v1/dashboard/${activeElderId}/chats`,
            config,
          ),
        ]);

        const isSummaryOk =
          summaryRes.data?.isSuccess || summaryRes.data?.success;
        const isChartsOk = chartsRes.data?.isSuccess || chartsRes.data?.success;
        const isChatsOk = chatsRes.data?.isSuccess || chatsRes.data?.success;

        if (!isSummaryOk || !isChartsOk || !isChatsOk) {
          throw new Error("대시보드 정보를 불러오지 못했습니다.");
        }

        setSummaryData(summaryRes.data.result);
        setChartsData(chartsRes.data.result);
        setChatsData(chatsRes.data.result || []);
      } catch (error) {
        console.error("대시보드 데이터 조회 실패", error);
        setErrorMessage("대시보드 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeElderId]);

  const elder = summaryData?.elder || {};
  const latestAssessment = summaryData?.latest_assessment || {};
  const latestReport = summaryData?.latest_report || {};
  const weeklyCallCount = summaryData?.weekly_call_count || 0;
  const uncheckedAlertCount = summaryData?.unchecked_alert_count || 0;

  const chartRows =
    chartsData?.trends?.map((item) => ({
      name: formatDate(item.assessed_at),
      score: Number(item.total_score || 0),
    })) || [];

  const scoreItems = [
    {
      label: "기억력",
      value: clampScore(latestAssessment.memory_score),
    },
    {
      label: "주의 집중",
      value: clampScore(latestAssessment.attention_score),
    },
    {
      label: "언어 능력",
      value: clampScore(latestAssessment.language_score),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
        <p className="text-sm font-semibold text-gray-500">
          대시보드 정보를 불러오고 있습니다.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
        <p className="text-lg font-bold text-gray-900">{errorMessage}</p>
        <p className="text-sm text-gray-500">
          서버 연결 상태와 어르신 번호를 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 bg-gray-50 py-6 pb-12">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold text-indigo-500">보호자 대시보드</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
            mindroutine
          </h1>
        </div>

        <div className="flex items-center gap-2">

          <Link
          className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
          to={`/notification/${activeElderId}`}
        >
          알림 {uncheckedAlertCount}건
        </Link>

        <Link
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm border border-gray-100 transition hover:bg-indigo-50 hover:scale-105 active:scale-95"
            to="/mypage"
            title="마이페이지 이동"
          >
            👤
          </Link>
        </div>

        
      </header>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <svg
              aria-hidden="true"
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold text-gray-900">
              {elder.name || "어르신 이름 없음"}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {getGenderLabel(elder.gender)} | {elder.age || "-"}세
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {elder.cognitive_note || "등록된 특이사항이 없습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">최근 종합 점수</p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {latestAssessment.total_score ?? 0}
            <span className="ml-1 text-base font-bold text-gray-400">점</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-indigo-500">
            {getRiskLabel(latestAssessment.risk_level)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">주간 대화 횟수</p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {weeklyCallCount}
            <span className="ml-1 text-base font-bold text-gray-400">회</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            최근 7일 기준
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900">
          인지 영역별 점수
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {scoreItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm font-bold text-gray-600">
                {item.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-gray-500">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900">
          주간 점수 추이
        </h2>
        <div className="mt-4 h-48 w-full">
          {chartRows.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartRows}
                margin={{ top: 8, right: 10, left: -24, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="#f3f4f6"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
                  }}
                />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="score"
                  dot={{ fill: "#4f46e5", r: 4, stroke: "#ffffff" }}
                  stroke="#4f46e5"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-gray-50 text-sm font-semibold text-gray-400">
              표시할 차트 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900">
          최근 대화 주제
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {chatsData.length > 0 ? (
            chatsData.map((chat) => (
              <span
                key={`topic-${chat.call_id}`}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-gray-600"
              >
                {chat.scenario_title || "자유 대화"}
              </span>
            ))
          ) : (
            <span className="text-sm font-semibold text-gray-400">
              최근 대화 주제가 없습니다.
            </span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900">
          최근 대화 내역
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {chatsData.length > 0 ? (
            chatsData.map((chat) => (
              <article
                key={`chat-${chat.call_id}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      {chat.scenario_title || "자유 대화"}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      {formatDateTime(chat.started_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">
                    {chat.call_status || "상태 없음"}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-500">
                  대화 턴 {chat.turn_count || 0}개
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-xl bg-gray-50 py-6 text-center text-sm font-semibold text-gray-400">
              최근 진행한 대화가 없습니다.
            </div>
          )}
        </div>
      </section>

      {latestReport.summary_text && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <h2 className="text-base font-extrabold text-indigo-900">
            최근 리포트 요약
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-indigo-900">
            {latestReport.llm_summary || latestReport.summary_text}
          </p>
        </section>
      )}
    </div>
  );
}
