import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { getAccessToken } from "../../utils/authSession";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DIFFICULTY_OPTIONS = ["쉬움", "보통", "어려움"];
const INITIAL_FORM = {
  scenario_id: null,
  title: "",
  category: "일상",
  difficulty: "쉬움",
  questionText: "",
  is_active: true,
};

const isSuccessResponse = (data) => data?.isSuccess === true || data?.success === true;

const buildAuthConfig = () => {
  const token = getAccessToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
};

const toQuestionArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    return String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export default function ScenarioManager() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  const activeCount = useMemo(
    () => scenarios.filter((scenario) => scenario.is_active !== false && scenario.is_active !== 0).length,
    [scenarios],
  );

  const selectedScenarioId = form.scenario_id;

  const fetchScenarios = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setErrorMessage("");

      const response = await axios.get(`${API_BASE_URL}/api/v1/scenarios/list`);
      if (!isSuccessResponse(response.data)) {
        throw new Error(response.data?.message || "대화 주제를 불러오지 못했습니다.");
      }

      setScenarios(response.data.result || []);
    } catch (error) {
      console.error("시나리오 조회 실패", error);
      setErrorMessage(error.response?.data?.message || error.message || "대화 주제를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialScenarios = async () => {
      try {
        setErrorMessage("");

        const response = await axios.get(`${API_BASE_URL}/api/v1/scenarios/list`);
        if (ignore) return;

        if (!isSuccessResponse(response.data)) {
          throw new Error(response.data?.message || "대화 주제를 불러오지 못했습니다.");
        }

        setScenarios(response.data.result || []);
      } catch (error) {
        if (!ignore) {
          console.error("시나리오 조회 실패", error);
          setErrorMessage(error.response?.data?.message || error.message || "대화 주제를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialScenarios();

    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setNoticeMessage("");
    setErrorMessage("");
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
    setNoticeMessage("");
  };

  const selectScenario = (scenario) => {
    const questions = toQuestionArray(scenario.question_text);

    setForm({
      scenario_id: scenario.scenario_id,
      title: scenario.title || "",
      category: scenario.category || "일상",
      difficulty: scenario.difficulty || "쉬움",
      questionText: questions.join("\n"),
      is_active: scenario.is_active !== false && scenario.is_active !== 0,
    });
    setNoticeMessage("");
    setErrorMessage("");
  };

  const validateForm = () => {
    if (!form.title.trim()) return "제목을 입력해주세요.";
    if (!form.questionText.trim()) return "질문을 한 개 이상 입력해주세요.";
    return "";
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category.trim() || "일상",
    difficulty: form.difficulty,
    question_text: form.questionText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    is_active: form.is_active,
  });

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setNoticeMessage("");

      const payload = buildPayload();
      const endpoint = form.scenario_id
        ? `${API_BASE_URL}/api/v1/scenarios/update`
        : `${API_BASE_URL}/api/v1/scenarios/create`;
      const response = form.scenario_id
        ? await axios.patch(endpoint, { ...payload, scenario_id: form.scenario_id }, buildAuthConfig())
        : await axios.post(endpoint, payload, buildAuthConfig());

      if (!isSuccessResponse(response.data)) {
        throw new Error(response.data?.message || "대화 주제 저장에 실패했습니다.");
      }

      setNoticeMessage(form.scenario_id ? "대화 주제가 수정되었습니다." : "새 대화 주제가 등록되었습니다.");
      await fetchScenarios({ silent: true });

      if (!form.scenario_id && response.data.result?.scenario_id) {
        setForm((prev) => ({ ...prev, scenario_id: response.data.result.scenario_id }));
      }
    } catch (error) {
      console.error("시나리오 저장 실패", error);
      setErrorMessage(error.response?.data?.message || error.message || "대화 주제 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!form.scenario_id) {
      setErrorMessage("먼저 비활성화할 대화 주제를 선택해주세요.");
      return;
    }

    if (!window.confirm("이 대화 주제를 비활성화하시겠습니까? 기존 일정 기록은 유지됩니다.")) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setNoticeMessage("");

      const response = await axios.delete(`${API_BASE_URL}/api/v1/scenarios/delete`, {
        ...buildAuthConfig(),
        data: { scenario_id: form.scenario_id },
      });

      if (!isSuccessResponse(response.data)) {
        throw new Error(response.data?.message || "대화 주제 비활성화에 실패했습니다.");
      }

      setNoticeMessage("대화 주제가 비활성화되었습니다.");
      setForm((prev) => ({ ...prev, is_active: false }));
      await fetchScenarios({ silent: true });
    } catch (error) {
      console.error("시나리오 비활성화 실패", error);
      setErrorMessage(error.response?.data?.message || error.message || "대화 주제 비활성화 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col bg-[#f6f8fb] px-5 py-6 font-sans text-gray-900">
      <header className="mb-5 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#4d6fb6]">대화 시나리오 관리</p>
          <h1 className="mt-1 text-[25px] font-black leading-tight">AI 대화 주제</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            일정 예약에서 사용할 질문 템플릿을 관리합니다
          </p>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="전체 주제" value={`${scenarios.length}개`} />
        <StatCard label="활성 주제" value={`${activeCount}개`} />
      </section>

      {errorMessage && (
        <p className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
          {errorMessage}
        </p>
      )}

      {noticeMessage && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e8f7ee] px-4 py-3 text-sm font-bold leading-6 text-[#237b49]">
          <CheckCircle2 size={18} strokeWidth={2.5} />
          {noticeMessage}
        </p>
      )}

      <section className="mb-4 rounded-[24px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">등록된 주제</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchScenarios()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
              aria-label="새로고침"
            >
              <RefreshCw size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f66c9] text-white"
              aria-label="새 대화 주제 작성"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f7f9fc] py-8 text-sm font-bold text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            불러오는 중입니다
          </div>
        ) : scenarios.length === 0 ? (
          <div className="rounded-2xl bg-[#f7f9fc] py-8 text-center text-sm font-bold text-gray-500">
            등록된 대화 주제가 없습니다.
          </div>
        ) : (
          <div className="max-h-[260px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              {scenarios.map((scenario) => {
                const isSelected = String(selectedScenarioId || "") === String(scenario.scenario_id);
                const isActive = scenario.is_active !== false && scenario.is_active !== 0;

                return (
                  <button
                    key={scenario.scenario_id}
                    type="button"
                    onClick={() => selectScenario(scenario)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-[#2f66c9] bg-[#eef5ff]"
                        : "border-gray-100 bg-[#f7f9fc]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-gray-900">
                          {scenario.title || "제목 없음"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-gray-500">
                          {scenario.category || "분류 없음"} · {scenario.difficulty || "난이도 없음"}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
                        isActive ? "bg-[#e8f7ee] text-[#237b49]" : "bg-gray-200 text-gray-500"
                      }`}
                      >
                        {isActive ? "활성" : "비활성"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5efff] text-[#2f66c9]">
            <ListChecks size={25} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {form.scenario_id ? "대화 주제 수정" : "새 대화 주제"}
            </h2>
            <p className="text-sm font-semibold text-gray-500">
              질문은 한 줄에 하나씩 입력합니다
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            label="제목"
            value={form.title}
            onChange={(value) => updateForm("title", value)}
            placeholder="예: 오늘 기분 확인"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="카테고리"
              value={form.category}
              onChange={(value) => updateForm("category", value)}
              placeholder="일상"
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-black text-gray-800">난이도</span>
              <select
                value={form.difficulty}
                onChange={(event) => updateForm("difficulty", event.target.value)}
                className="rounded-2xl bg-gray-100 px-3 py-4 text-base font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#bcd4ff]"
              >
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-black text-gray-800">질문 목록</span>
            <textarea
              value={form.questionText}
              onChange={(event) => updateForm("questionText", event.target.value)}
              placeholder={`오늘 기분은 어떠세요?\n오늘은 무엇을 하고 지내셨어요?`}
              className="h-32 resize-none rounded-2xl bg-gray-100 px-4 py-3 text-base font-semibold leading-6 text-gray-900 outline-none focus:ring-2 focus:ring-[#bcd4ff]"
            />
          </label>

          <button
            type="button"
            onClick={() => updateForm("is_active", !form.is_active)}
            className={`rounded-2xl px-4 py-4 text-base font-black transition ${
              form.is_active
                ? "bg-[#e8f7ee] text-[#237b49]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {form.is_active ? "활성 상태로 사용" : "비활성 상태"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#2f66c9] py-4 text-base font-black text-white shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} strokeWidth={2.5} />}
            {saving ? "저장 중" : "저장"}
          </button>

          <button
            type="button"
            onClick={handleDeactivate}
            disabled={saving || !form.scenario_id}
            className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-red-50 text-red-600 disabled:opacity-35"
            aria-label="대화 주제 비활성화"
          >
            <Trash2 size={22} strokeWidth={2.5} />
          </button>
        </div>
      </section>
    </main>
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

function FormField({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-black text-gray-800">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl bg-gray-100 px-4 py-4 text-base font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#bcd4ff]"
      />
    </label>
  );
}
