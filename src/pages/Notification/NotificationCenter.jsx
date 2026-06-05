import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEMO_ELDER_ID = "1";

const getStoredElderId = () =>
  localStorage.getItem("elder_id") ||
  localStorage.getItem("elderId") ||
  localStorage.getItem("selectedElderId");

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;

const getActiveElderId = (routeElderId, searchParams) =>
  routeElderId ||
  searchParams.get("elder_id") ||
  searchParams.get("elderId") ||
  getStoredElderId() ||
  DEMO_ELDER_ID;

const formatDateTime = (value) => {
  if (!value) return "시간 정보 없음";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getAlertTone = (alert) => {
  if (alert.risk_level === "위험") {
    return {
      card: "border-red-200 bg-red-50",
      badge: "bg-red-600 text-white",
      label: "위험",
    };
  }

  if (alert.risk_level === "주의") {
    return {
      card: "border-amber-200 bg-amber-50",
      badge: "bg-amber-500 text-white",
      label: "주의",
    };
  }

  return {
    card: "border-gray-200 bg-white",
    badge: "bg-gray-500 text-white",
    label: alert.alert_type || "알림",
  };
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [searchParams] = useSearchParams();
  const activeElderId = getActiveElderId(elderId, searchParams);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !alert.is_checked).length,
    [alerts],
  );

  useEffect(() => {
    let ignore = false;

    const fetchAlerts = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/dashboard/${activeElderId}/alerts`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        if (ignore) return;

        if (isSuccessResponse(response.data)) {
          setAlerts(response.data.result || []);
          setErrorMessage("");
        } else {
          setAlerts([]);
          setErrorMessage(response.data?.message || "알림을 불러오지 못했습니다.");
        }
      } catch (error) {
        if (!ignore) {
          console.error(error);
          setAlerts([]);
          setErrorMessage(error.response?.data?.message || "알림을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    return () => {
      ignore = true;
    };
  }, [activeElderId]);

  return (
    <div className="flex min-h-full flex-col bg-gray-50 py-6 font-sans">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500">인지 상태 모니터링</p>
          <h1 className="mt-1 text-[22px] font-black text-gray-900">이상징후 알림</h1>
        </div>
        <div className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white">
          {unreadCount}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-6 text-center text-sm font-bold text-gray-500 shadow-sm">
          이상징후 알림을 불러오는 중입니다.
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold leading-relaxed text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && alerts.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold leading-relaxed text-gray-500 shadow-sm">
          아직 감지된 이상징후 알림이 없습니다.
        </div>
      )}

      {!loading && !errorMessage && alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const tone = getAlertTone(alert);

            return (
              <button
                type="button"
                key={alert.alert_id}
                onClick={() => navigate(`/dashboard?elder_id=${alert.elder_id}`)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${tone.card} ${
                  alert.is_checked ? "opacity-70" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-gray-900">
                    어르신 #{alert.elder_id}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${tone.badge}`}>
                    {tone.label}
                  </span>
                </div>

                <p className="text-sm font-bold leading-relaxed text-gray-700">
                  {alert.alert_message}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>{alert.is_checked ? "확인됨" : "미확인"}</span>
                  <span>{formatDateTime(alert.created_at)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
