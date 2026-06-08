import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  FileText,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { getAccessToken } from "../../utils/authSession";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;

const formatDateTime = (value) => {
  if (!value) return "시간 정보 없음";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시간 정보 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDuration = (startedAt, endedAt) => {
  if (!startedAt || !endedAt) return "진행 시간 미확정";

  const started = new Date(startedAt).getTime();
  const ended = new Date(endedAt).getTime();
  if (Number.isNaN(started) || Number.isNaN(ended) || ended < started) {
    return "진행 시간 미확정";
  }

  const minutes = Math.max(1, Math.round((ended - started) / 60000));
  return `${minutes}분`;
};

const getStatusClass = (status) => {
  if (status === "진행중") return "bg-emerald-50 text-emerald-700";
  if (status === "중단") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const parseRepeatedWords = (value) => {
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Object.entries(parsed || {}).filter(([, count]) => Number(count) > 1);
  } catch {
    return [];
  }
};

const buildAuthConfig = () => {
  const token = getAccessToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
};

export default function GuardianChatHistory() {
  const navigate = useNavigate();
  const { elderId, callId } = useParams();
  const [chats, setChats] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isDetailMode = Boolean(callId);

  useEffect(() => {
    let ignore = false;

    const fetchChatData = async () => {
      if (!elderId) {
        setErrorMessage("먼저 어르신을 선택해주세요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const endpoint = isDetailMode
          ? `${API_BASE_URL}/api/v1/guardians/elders/${elderId}/chats/${callId}`
          : `${API_BASE_URL}/api/v1/guardians/elders/${elderId}/chats`;

        const response = await axios.get(endpoint, buildAuthConfig());

        if (ignore) return;

        if (!isSuccessResponse(response.data)) {
          throw new Error(response.data?.message || "대화 기록을 불러오지 못했습니다.");
        }

        if (isDetailMode) {
          setDetail(response.data.result || null);
          setChats([]);
        } else {
          setChats(response.data.result || []);
          setDetail(null);
        }
      } catch (error) {
        if (!ignore) {
          console.error(error);
          setErrorMessage(error.response?.data?.message || "대화 기록을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchChatData();

    return () => {
      ignore = true;
    };
  }, [callId, elderId, isDetailMode]);

  const titleName = detail?.elder_name || chats[0]?.elder_name || "어르신";

  const listStats = useMemo(() => {
    const totalTurns = chats.reduce((sum, chat) => sum + Number(chat.turn_count || 0), 0);
    const finishedCount = chats.filter((chat) => chat.call_status === "종료").length;

    return {
      totalChats: chats.length,
      totalTurns,
      finishedCount,
    };
  }, [chats]);

  const goBack = () => {
    if (isDetailMode) {
      navigate(`/guardian/elders/${elderId}/chats`);
      return;
    }

    navigate(`/dashboard/${elderId}`);
  };

  return (
    <main className="flex min-h-full flex-col bg-[#f6f8fb] py-6 font-sans text-gray-900">
      <header className="mb-5 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#4d6fb6]">보호자 대화 조회</p>
          <h1 className="mt-1 truncate text-[25px] font-black leading-tight">
            {isDetailMode ? "대화 상세" : `${titleName} 대화 기록`}
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {isDetailMode ? "질문과 답변, 분석 지표를 확인합니다" : "어르신의 AI 대화 세션을 모아봅니다"}
          </p>
        </div>
      </header>

      {loading && (
        <section className="rounded-[24px] bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
          대화 기록을 불러오고 있습니다.
        </section>
      )}

      {!loading && errorMessage && (
        <section className="rounded-[24px] border border-red-100 bg-red-50 p-5 text-sm font-bold leading-relaxed text-red-700">
          {errorMessage}
        </section>
      )}

      {!loading && !errorMessage && !isDetailMode && (
        <ChatList
          chats={chats}
          elderId={elderId}
          listStats={listStats}
          navigate={navigate}
        />
      )}

      {!loading && !errorMessage && isDetailMode && detail && (
        <ChatDetail detail={detail} />
      )}
    </main>
  );
}

function ChatList({ chats, elderId, listStats, navigate }) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <section className="grid grid-cols-3 gap-2">
        <StatCard label="전체" value={`${listStats.totalChats}회`} />
        <StatCard label="완료" value={`${listStats.finishedCount}회`} />
        <StatCard label="대화 턴" value={`${listStats.totalTurns}개`} />
      </section>

      {chats.length === 0 ? (
        <section className="rounded-[24px] bg-white p-8 text-center shadow-sm">
          <MessageCircle className="mx-auto text-gray-300" size={42} strokeWidth={2.2} />
          <p className="mt-4 text-base font-black text-gray-800">아직 저장된 대화가 없습니다.</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">
            어르신이 대화를 완료하면 이곳에서 내용을 확인할 수 있습니다.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          {chats.map((chat) => (
            <button
              key={chat.call_id}
              type="button"
              onClick={() => navigate(`/guardian/elders/${elderId}/chats/${chat.call_id}`)}
              className="rounded-[24px] bg-white p-5 text-left shadow-sm transition active:scale-[0.99]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#4d6fb6]">
                    {formatDateTime(chat.started_at)}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-black text-gray-900">
                    {chat.scenario_title || "자유 대화"}
                  </h2>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${getStatusClass(chat.call_status)}`}>
                  {chat.call_status || "상태 없음"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#f7f9fc] px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <MessageCircle size={18} strokeWidth={2.4} />
                  대화 턴 {Number(chat.turn_count || 0)}개
                </span>
                <span className="flex items-center gap-1 text-sm font-black text-[#2f66c9]">
                  상세 보기
                  <ChevronRight size={18} strokeWidth={2.6} />
                </span>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}

function ChatDetail({ detail }) {
  const turns = detail.turns || [];

  return (
    <div className="flex flex-col gap-4 pb-8">
      <section className="rounded-[24px] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5efff] text-[#2f66c9]">
            <ShieldCheck size={25} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-gray-900">
              {detail.scenario_title || "자유 대화"}
            </h2>
            <p className="mt-1 text-sm font-bold text-gray-500">
              {detail.elder_name || "어르신"} · {detail.call_status || "상태 없음"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetaBox icon={<Clock size={19} />} label="시작" value={formatDateTime(detail.started_at)} />
          <MetaBox icon={<FileText size={19} />} label="진행" value={formatDuration(detail.started_at, detail.ended_at)} />
        </div>
      </section>

      {turns.length === 0 ? (
        <section className="rounded-[24px] bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
          저장된 대화 턴이 없습니다.
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {turns.map((turn) => (
            <TurnCard key={turn.turn_id} turn={turn} />
          ))}
        </section>
      )}
    </div>
  );
}

function TurnCard({ turn }) {
  const repeatedWords = parseRepeatedWords(turn.repeated_words_json);
  const confidence = turn.stt_confidence == null ? null : Math.round(Number(turn.stt_confidence) * 100);
  const delaySeconds = turn.response_delay_ms == null
    ? null
    : (Number(turn.response_delay_ms) / 1000).toFixed(1);

  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-gray-900">
          대화 {turn.turn_order || "-"}
        </h3>
        <span className="text-xs font-bold text-gray-400">
          {formatDateTime(turn.created_at)}
        </span>
      </div>

      <ConversationBlock label="AI 질문" text={turn.ai_question || "질문 정보 없음"} tone="ai" />
      <ConversationBlock label="어르신 답변" text={turn.user_answer_text || "답변 정보 없음"} tone="elder" />
      <ConversationBlock label="AI 응답" text={turn.ai_response_text || "응답 정보 없음"} tone="reply" />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="인식 정확도" value={confidence == null ? "-" : `${confidence}%`} />
        <Metric label="응답 지연" value={delaySeconds == null ? "-" : `${delaySeconds}초`} />
        <Metric label="반복 단어" value={`${turn.repeated_word_count || 0}개`} />
        <Metric label="불명확 표현" value={`${turn.vague_word_count || 0}개`} />
      </div>

      {repeatedWords.length > 0 && (
        <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-700">
          반복 감지: {repeatedWords.map(([word, count]) => `${word} ${count}회`).join(", ")}
        </p>
      )}
    </article>
  );
}

function ConversationBlock({ label, text, tone }) {
  const toneClass = {
    ai: "bg-[#eef5ff] text-[#17335f]",
    elder: "bg-[#f7f9fc] text-gray-900",
    reply: "bg-white text-gray-900 border border-gray-100",
  }[tone];

  return (
    <div className={`mt-3 rounded-2xl px-4 py-3 ${toneClass}`}>
      <span className="text-xs font-black text-gray-500">{label}</span>
      <p className="mt-1 whitespace-pre-wrap text-[15px] font-bold leading-6">{text}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-bold text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function MetaBox({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] p-4">
      <span className="flex items-center gap-2 text-xs font-black text-gray-500">
        {icon}
        {label}
      </span>
      <p className="mt-2 text-sm font-black leading-5 text-gray-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] px-3 py-3">
      <p className="text-xs font-bold text-gray-500">{label}</p>
      <p className="mt-1 text-base font-black text-gray-900">{value}</p>
    </div>
  );
}
