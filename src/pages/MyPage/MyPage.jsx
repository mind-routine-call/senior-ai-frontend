import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarClock,
  ChevronRight,
  Clipboard,
  Home,
  LogOut,
  NotebookTabs,
  UserRound,
  Volume2,
} from "lucide-react";

import { clearAuthSession, getAccessToken, getStoredRole } from "../../utils/authSession";
import { getElderHome } from "../../api/elderChat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const unwrapResult = (response) => response?.data?.result ?? response?.data ?? null;

const getStoredElderId = () =>
  localStorage.getItem("selectedElderId") ||
  localStorage.getItem("elder_id") ||
  localStorage.getItem("elderId") ||
  "1";

const buildAuthConfig = () => {
  const token = getAccessToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
};

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

export default function MyPage() {
  const navigate = useNavigate();
  const storedRole = getStoredRole();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [elderList, setElderList] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [speechSpeed, setSpeechSpeed] = useState(50);
  const [volume, setVolume] = useState(70);
  const [fontSize, setFontSize] = useState("아주 크게");

  const role = userData?.role || storedRole || "guardian";
  const isGuardian = role === "guardian";

  const activeElderId = useMemo(() => {
    const firstElderId = elderList[0]?.elder_id;
    return String(firstElderId || getStoredElderId());
  }, [elderList]);

  useEffect(() => {
    let ignore = false;

    const fetchMyPageData = async () => {
      const token = getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const config = buildAuthConfig();
        const roleFromStorage = getStoredRole() || "guardian";

        const profileRequest = axios
          .get(`${API_BASE_URL}/api/v1/auth/me`, config)
          .then(unwrapResult)
          .catch(() => null);

        if (roleFromStorage === "elder") {
          const [profileResult, homeResult] = await Promise.allSettled([
            profileRequest,
            getElderHome(Number(getStoredElderId())),
          ]);

          if (ignore) return;

          const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
          const home = homeResult.status === "fulfilled" ? homeResult.value : null;
          const elder = profile?.user || profile || home?.elder || {};

          setUserData({
            role: "elder",
            elder_id: getFirstValue(elder.elder_id, home?.elder?.elder_id, getStoredElderId()),
            name: getFirstValue(elder.name, home?.elder?.name, localStorage.getItem("userName"), "어르신"),
            phone: elder.phone || "",
            gender: elder.gender || "",
            birth_date: elder.birth_date || "",
            cognitive_note: elder.cognitive_note || home?.elder?.cognitive_note || "",
            guardian_name: getFirstValue(
              profile?.guardian?.name,
              home?.guardian?.name,
              elder.guardian_name,
              "연결된 보호자"
            ),
          });
          return;
        }

        const [profileResult, inviteResult, eldersResult] = await Promise.allSettled([
          profileRequest,
          axios.get(`${API_BASE_URL}/api/v1/invite/code-view`, config),
          axios.get(`${API_BASE_URL}/api/v1/elders/list`, config),
        ]);

        if (ignore) return;

        const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
        const invite = inviteResult.status === "fulfilled" ? unwrapResult(inviteResult.value) : null;
        const elders = eldersResult.status === "fulfilled" ? unwrapResult(eldersResult.value) : null;
        const elderItems = Array.isArray(elders) ? elders : elders ? [elders] : [];
        const guardian = profile?.user || profile || {};

        setUserData({
          role: "guardian",
          guardian_id: getFirstValue(guardian.guardian_id, invite?.guardian_id, localStorage.getItem("guardianId")),
          name: getFirstValue(guardian.name, localStorage.getItem("userName"), localStorage.getItem("guardianName"), "보호자"),
          phone: guardian.phone || "",
          gender: guardian.gender || "",
          birth_date: guardian.birth_date || "",
        });
        setInviteCode(getFirstValue(guardian.invite_code, invite?.invite_code, localStorage.getItem("my_invite_code"), ""));
        setElderList(elderItems);
      } catch (error) {
        console.error("마이페이지 데이터 로드 실패", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMyPageData();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  const handleCopyCode = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      alert("초대코드가 복사되었습니다.");
    } catch {
      alert("브라우저에서 복사를 지원하지 않습니다.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      const config = buildAuthConfig();
      if (config) {
        await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, config);
      }
    } catch (error) {
      console.error("로그아웃 요청 실패", error);
    } finally {
      clearAuthSession();
      localStorage.removeItem("selectedElderId");
      localStorage.removeItem("elder_id");
      localStorage.removeItem("elderId");
      navigate("/login");
    }
  };

  const goHome = () => {
    navigate(isGuardian ? `/dashboard/${activeElderId}` : "/elder-home");
  };

  const goSchedule = () => {
    navigate(activeElderId ? `/schedule/${activeElderId}` : "/schedule");
  };

  const goMemory = () => {
    navigate(activeElderId ? `/memory/${activeElderId}` : "/memory");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f6f8fb] text-lg font-bold text-gray-500">
        로딩 중입니다
      </div>
    );
  }

  const myName = userData?.name || "사용자";

  return (
    <div className="h-full w-full overflow-y-auto bg-[#f6f8fb] px-5 py-6 font-sans text-gray-900">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#4d6fb6]">{isGuardian ? "보호자 마이페이지" : "어르신 마이페이지"}</p>
          <h1 className="mt-1 text-[25px] font-black leading-tight">
            {isGuardian ? `${myName} 보호자님` : `${myName} 어르신님`}
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {isGuardian ? "연결 가족과 대화 준비를 관리합니다" : "대화 환경과 내 정보를 확인합니다"}
          </p>
        </div>

        <button
          type="button"
          onClick={goHome}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2f66c9] shadow-sm"
          aria-label="홈으로 이동"
        >
          <Home size={22} strokeWidth={2.5} />
        </button>
      </header>

      <main className="flex flex-col gap-4 pb-8">
        {isGuardian ? (
          <>
            <section className="rounded-[22px] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black">연결된 어르신</h2>
                <span className="rounded-full bg-[#ecf3ff] px-3 py-1 text-sm font-bold text-[#2f66c9]">
                  {elderList.length}명
                </span>
              </div>

              {elderList.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {elderList.map((elder) => (
                    <article
                      key={elder.elder_id}
                      className="rounded-2xl border border-gray-100 bg-[#f8fbff] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5efff] text-[#2f66c9]">
                          <UserRound size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-lg font-black">{elder.name || "이름 미입력"}</p>
                          <p className="text-sm font-semibold text-gray-500">
                            {elder.cognitive_note || "인지 상태 메모 없음"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-[#f8fbff] p-4 text-center text-sm font-bold text-gray-500">
                  연결된 어르신 정보가 없습니다.
                </p>
              )}
            </section>

            <section className="rounded-[22px] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-black">초대코드</h2>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#2f66c9] px-4 py-4 text-white">
                <span className="break-all text-xl font-black tracking-wide">{inviteCode || "발급된 코드 없음"}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!inviteCode}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/18 disabled:opacity-40"
                  aria-label="초대코드 복사"
                >
                  <Clipboard size={22} strokeWidth={2.5} />
                </button>
              </div>
            </section>

            <section className="rounded-[22px] bg-white p-2 shadow-sm">
              <MenuButton icon={<CalendarClock size={25} />} label="대화 시간 예약" onClick={goSchedule} />
              <MenuButton icon={<NotebookTabs size={25} />} label="등록메모리 관리" onClick={goMemory} />
            </section>
          </>
        ) : (
          <>
            <section className="rounded-[22px] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-black">연결된 보호자</h2>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5efff] text-[#2f66c9]">
                  <UserRound size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg font-black">{userData?.guardian_name || "연결된 보호자 없음"}</p>
                  <p className="text-sm font-semibold text-gray-500">보호자와 연결된 계정입니다</p>
                </div>
              </div>
            </section>

            <section className="rounded-[22px] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Volume2 size={22} className="text-[#2f66c9]" strokeWidth={2.5} />
                <h2 className="text-lg font-black">음성 설정</h2>
              </div>

              <SettingSlider label="읽어주기 속도" value={speechSpeed} onChange={setSpeechSpeed} />
              <SettingSlider label="음량 조절" value={volume} onChange={setVolume} />
            </section>

            <section className="rounded-[22px] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">글자 크기</h2>
              <div className="grid grid-cols-2 gap-2">
                {["크게", "아주 크게"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`rounded-2xl px-4 py-4 text-lg font-black transition ${
                      fontSize === size
                        ? "bg-[#2f66c9] text-white shadow-sm"
                        : "bg-[#f0f2f5] text-gray-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="rounded-[22px] bg-white p-2 shadow-sm">
          <MenuButton
            icon={<UserRound size={25} />}
            label="개인정보 변경"
            onClick={() => alert("개인정보 변경 화면은 준비 중입니다.")}
          />
          <MenuButton icon={<LogOut size={25} />} label="로그아웃" onClick={handleLogout} danger />
        </section>
      </main>
    </div>
  );
}

function MenuButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition active:scale-[0.99] ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-900 hover:bg-[#f4f7fc]"
      }`}
    >
      <span className="flex items-center gap-3 text-lg font-black">
        <span className={danger ? "text-red-500" : "text-[#2f66c9]"}>{icon}</span>
        {label}
      </span>
      <ChevronRight size={22} strokeWidth={2.5} className="text-gray-400" />
    </button>
  );
}

function SettingSlider({ label, value, onChange }) {
  return (
    <label className="mb-4 block last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-black text-gray-800">{label}</span>
        <span className="text-sm font-bold text-[#2f66c9]">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#2f66c9]"
      />
    </label>
  );
}
