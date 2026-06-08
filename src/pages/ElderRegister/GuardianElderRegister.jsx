import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Home,
  Loader2,
  UserRoundPlus,
} from "lucide-react";
import { getAccessToken } from "../../utils/authSession";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const GENDER_OPTIONS = [
  { label: "남성", value: "남" },
  { label: "여성", value: "여" },
];

const INITIAL_FORM = {
  name: "",
  gender: "남",
  birth_date: "",
  phone: "",
  address: "",
  cognitive_note: "",
};

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;

const buildAuthConfig = () => {
  const token = getAccessToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
};

const isValidDateInput = (value) => {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export default function GuardianElderRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdElder, setCreatedElder] = useState(null);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
  };

  const handleCopyInviteCode = async () => {
    if (!createdElder?.invite_code) return;

    try {
      await navigator.clipboard.writeText(createdElder.invite_code);
      alert("초대코드가 복사되었습니다.");
    } catch {
      alert("브라우저에서 복사를 지원하지 않습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setErrorMessage("어르신 이름을 입력해주세요.");
      return;
    }

    if (!isValidDateInput(form.birth_date)) {
      setErrorMessage("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const payload = {
        name: form.name.trim(),
        gender: form.gender || null,
        birth_date: form.birth_date || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        cognitive_note: form.cognitive_note.trim() || null,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/elders/register`,
        payload,
        buildAuthConfig(),
      );

      if (!isSuccessResponse(response.data)) {
        throw new Error(response.data?.message || "어르신 등록에 실패했습니다.");
      }

      const result = response.data.result || {};
      const nextElder = {
        ...result,
        name: payload.name,
        gender: payload.gender,
        birth_date: payload.birth_date,
      };

      if (result.elder_id) {
        localStorage.setItem("selectedElderId", String(result.elder_id));
        localStorage.setItem("elder_id", String(result.elder_id));
      }

      setCreatedElder(nextElder);
    } catch (error) {
      console.error("어르신 등록 실패", error);
      setErrorMessage(error.response?.data?.message || error.message || "어르신 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goDashboard = () => {
    if (createdElder?.elder_id) {
      navigate(`/dashboard/${createdElder.elder_id}`);
      return;
    }

    navigate("/dashboard");
  };

  if (createdElder) {
    return (
      <main className="flex min-h-full flex-col bg-white py-6 font-sans text-gray-900">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#FF6E61]">새 어르신 등록</p>
            <h1 className="mt-0.5 text-[22px] font-semibold leading-tight">등록이 완료되었습니다</h1>
            <p className="mt-1 text-[13px] text-[#A2A2A2]">
              어르신 회원가입 때 아래 초대코드를 알려주세요
            </p>
          </div>
          <button
            type="button"
            onClick={goDashboard}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6f6f6] text-[#FF6E61]"
            aria-label="대시보드로 이동"
          >
            <Home size={22} strokeWidth={2.5} />
          </button>
        </header>

        <section className="rounded-2xl bg-[#f6f6f6] p-5">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#e8f7ee] text-[#22a05a]">
            <CheckCircle2 size={34} strokeWidth={2.5} />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-500">등록된 어르신</p>
            <h2 className="mt-2 text-[28px] font-semibold text-gray-900">
              {createdElder.name}
            </h2>
          </div>

          <div
            className="mt-6 rounded-2xl px-4 py-5 text-white"
            style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
          >
            <p className="text-sm font-bold text-white/75">초대코드</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="break-all text-2xl font-semibold ">
                {createdElder.invite_code || "초대코드 없음"}
              </span>
              <button
                type="button"
                onClick={handleCopyInviteCode}
                disabled={!createdElder.invite_code}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/18 disabled:opacity-40"
                aria-label="초대코드 복사"
              >
                <Clipboard size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <p className="mt-5 rounded-2xl bg-[#f6f6f6] px-4 py-4 text-sm font-bold leading-6 text-gray-600">
            보호자가 기본 정보를 먼저 등록한 상태입니다. 어르신은 회원가입 화면에서 이 초대코드를 입력해 본인 계정을 연결하면 됩니다.
          </p>
        </section>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={goDashboard}
            className="rounded-2xl py-4 text-[15px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
          >
            대시보드로 이동
          </button>
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="rounded-2xl bg-[#f6f6f6] py-4 text-[15px] font-semibold text-gray-900"
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col bg-white py-6 font-sans text-gray-900">
      <header className="mb-5 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6f6f6] text-[#A2A2A2]"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#FF6E61]">보호자 관리</p>
          <h1 className="mt-0.5 text-[22px] font-semibold leading-tight">새 어르신 등록</h1>
          <p className="mt-1 text-[13px] text-[#A2A2A2]">
            서비스에 초대할 어르신의 기본 정보를 입력합니다
          </p>
        </div>
      </header>

      <section className="rounded-2xl bg-[#f6f6f6] p-4">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EE] text-[#FF6E61]">
            <UserRoundPlus size={25} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            <p className="text-sm font-semibold text-gray-500">이름은 필수 입력입니다</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            label="어르신 이름"
            value={form.name}
            onChange={(value) => updateForm("name", value)}
            placeholder="예: 김어르신"
            required
          />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-800">성별</span>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateForm("gender", option.value)}
                  className={`rounded-xl py-3 text-base font-semibold transition ${
                    form.gender === option.value
                      ? "bg-white text-[#FF6E61] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <FormField
            label="생년월일"
            type="date"
            value={form.birth_date}
            onChange={(value) => updateForm("birth_date", value)}
          />

          <FormField
            label="전화번호"
            value={form.phone}
            onChange={(value) => updateForm("phone", value)}
            placeholder="01012345678"
          />

          <FormField
            label="주소"
            value={form.address}
            onChange={(value) => updateForm("address", value)}
            placeholder="예: 서울시 마포구"
          />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-800">인지 상태 메모</span>
            <textarea
              value={form.cognitive_note}
              onChange={(event) => updateForm("cognitive_note", event.target.value)}
              placeholder="대화 시 참고할 내용을 적어주세요"
              className="h-32 resize-none rounded-2xl bg-white px-4 py-3 text-[15px] font-medium leading-6 text-gray-900 outline-none focus:ring-2 focus:ring-[#FFB3AA]"
            />
          </label>
        </div>
      </section>

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-5 flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold text-white disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
      >
        {isSubmitting && <Loader2 size={22} className="animate-spin" strokeWidth={2.6} />}
        {isSubmitting ? "등록 중" : "어르신 등록하기"}
      </button>
    </main>
  );
}
function FormField({ label, value, onChange, placeholder = "", type = "text", required = false }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-[#FF6E61]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl bg-white px-4 py-4 text-[15px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#FFB3AA]"
      />
    </label>
  );
}
