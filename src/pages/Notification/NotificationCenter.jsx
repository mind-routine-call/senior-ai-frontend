import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  getStoredElderId();

const formatDateTime = (value) => {
  if (!value) return "시간 정보 없음";
  const date = new Date(value);
  if (isNaN(date)) return String(value);
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
};

const getAlertStyle = (alert) => {
  if (alert.risk_level === "위험") return { bg: "#FFF3EE", border: "#FFD3C2", badge: "위험", badgeGrad: true };
  if (alert.risk_level === "주의") return { bg: "#FFFBF0", border: "#FFE9A0", badge: "주의", badgeGrad: false, badgeColor: "#F59E0B" };
  return { bg: "#f6f6f6", border: "#ebebeb", badge: alert.alert_type || "알림", badgeGrad: false, badgeColor: "#A2A2A2" };
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [searchParams] = useSearchParams();
  const activeElderId = getActiveElderId(elderId, searchParams);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(() => alerts.filter((a) => !a.is_checked).length, [alerts]);

  const markAlertAsChecked = async (alert) => {
    if (alert.is_checked) return;

    const token = getAuthToken();
    await axios.patch(
      `${API_BASE_URL}/api/v1/dashboard/alerts/${alert.alert_id}/check`,
      { is_checked: true },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );

    setAlerts((currentAlerts) =>
      currentAlerts.map((item) =>
        item.alert_id === alert.alert_id ? { ...item, is_checked: true } : item,
      ),
    );
  };

  const handleAlertClick = async (alert) => {
    try {
      await markAlertAsChecked(alert);
    } catch (error) {
      console.error("알림 확인 처리 실패", error);
    } finally {
      navigate(`/dashboard/${alert.elder_id}`);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchAlerts = async () => {
      try {
        if (!activeElderId) {
          setAlerts([]);
          setErrorMessage("먼저 관리할 어르신을 선택해주세요.");
          setLoading(false);
          return;
        }

        const token = getAuthToken();
        const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/${activeElderId}/alerts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (ignore) return;
        if (isSuccessResponse(res.data)) {
          setAlerts(res.data.result || []);
          setErrorMessage("");
        } else {
          setAlerts([]);
          setErrorMessage(res.data?.message || "알림을 불러오지 못했습니다.");
        }
      } catch (error) {
        if (!ignore) { setAlerts([]); setErrorMessage(error.response?.data?.message || "알림을 불러오지 못했습니다."); }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAlerts();
    return () => { ignore = true; };
  }, [activeElderId]);

  return (
    <div className="flex min-h-full flex-col bg-white py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: "#FF6E61" }}>인지 상태 모니터링</p>
          <h1 className="mt-0.5 text-[22px] font-semibold">이상징후 알림</h1>
        </div>
        {unreadCount > 0 && (
          <div
            className="rounded-2xl px-3 py-1.5 text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
          >
            미확인 {unreadCount}건
          </div>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl bg-[#f6f6f6] p-6 text-center text-[14px] text-[#A2A2A2]">
          알림을 불러오는 중입니다.
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl bg-[#FFF3EE] p-4 text-[14px] font-semibold" style={{ color: "#FF6E61" }}>
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && alerts.length === 0 && (
        <div className="rounded-2xl bg-[#f6f6f6] p-8 text-center text-[14px] text-[#A2A2A2]">
          아직 감지된 이상징후 알림이 없습니다.
        </div>
      )}

      {!loading && !errorMessage && alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const s = getAlertStyle(alert);
            return (
              <button
                type="button"
                key={alert.alert_id}
                onClick={() => handleAlertClick(alert)}
                className="w-full rounded-2xl border p-4 text-left transition active:scale-[0.99]"
                style={{ background: s.bg, borderColor: s.border, opacity: alert.is_checked ? 0.6 : 1 }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold">어르신 #{alert.elder_id}</span>
                  <span
                    className="rounded-lg px-2.5 py-1 text-[12px] font-bold text-white"
                    style={s.badgeGrad
                      ? { background: "linear-gradient(135deg, #FF6E61, #FCA963)" }
                      : { background: s.badgeColor }}
                  >
                    {s.badge}
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed">{alert.alert_message}</p>
                <div className="mt-2 flex items-center justify-between text-[12px] text-[#A2A2A2]">
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
