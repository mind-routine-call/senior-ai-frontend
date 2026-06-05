import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function MemoryWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { elderId: routeElderId } = useParams();
  const existingMemory = location.state?.memory;

  const activeElderId = useMemo(() => {
    const query = new URLSearchParams(window.location.search);
    return (
      routeElderId ||
      existingMemory?.elder_id ||
      query.get("elder_id") ||
      localStorage.getItem("selectedElderId") ||
      localStorage.getItem("elder_id") ||
      "1"
    );
  }, [existingMemory?.elder_id, routeElderId]);

  const [title, setTitle] = useState(existingMemory?.title || "");
  const [memoryDate, setMemoryDate] = useState(
    existingMemory?.memory_date
      ? String(existingMemory.memory_date).substring(0, 10)
      : "",
  );
  const [content, setContent] = useState(existingMemory?.content || "");
  const [imageUrl, setImageUrl] = useState(existingMemory?.image_url || "");
  const [isSaving, setIsSaving] = useState(false);

  const config = useMemo(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  }, []);

  const moveToList = () => {
    navigate(`/memory/${activeElderId}`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("추억 제목을 입력해주세요.");
      return;
    }

    if (!memoryDate) {
      alert("추억 날짜를 선택해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        memory_date: memoryDate,
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      if (existingMemory) {
        const response = await axios.patch(
          `${API_BASE_URL}/api/v1/memories/update/${existingMemory.memory_id}`,
          payload,
          config,
        );

        if (!(response.data?.isSuccess || response.data?.success)) {
          throw new Error("등록메모리 수정 실패");
        }

        alert("추억이 수정되었습니다.");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/memories/upload`,
          {
            ...payload,
            elder_id: Number(activeElderId),
          },
          config,
        );

        if (!(response.data?.isSuccess || response.data?.success)) {
          throw new Error("등록메모리 등록 실패");
        }

        alert("추억이 등록되었습니다.");
      }

      moveToList();
    } catch (error) {
      console.error("등록메모리 저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrCancel = async () => {
    if (!existingMemory) {
      moveToList();
      return;
    }

    if (!window.confirm("이 추억을 삭제하시겠습니까?")) return;

    setIsSaving(true);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/memories/delete/${existingMemory.memory_id}`,
        config,
      );

      if (!(response.data?.isSuccess || response.data?.success)) {
        throw new Error("등록메모리 삭제 실패");
      }

      alert("추억이 삭제되었습니다.");
      moveToList();
    } catch (error) {
      console.error("등록메모리 삭제 실패", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-5 bg-white py-6">
      <header>
        <p className="text-xs font-semibold text-indigo-500">등록메모리</p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
          {existingMemory ? "추억 수정" : "추억 추가"}
        </h1>
        <p className="mt-2 text-sm font-medium leading-5 text-gray-500">
          어르신과 AI가 자연스럽게 이야기할 수 있는 기억을 적어주세요.
        </p>
      </header>

      <form className="flex flex-1 flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-700">추억 제목</span>
          <input
            className="w-full rounded-xl bg-gray-100 p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 봄날의 가족 여행"
            type="text"
            value={title}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-700">추억 날짜</span>
          <input
            className="w-full rounded-xl bg-gray-100 p-4 text-base font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setMemoryDate(e.target.value)}
            type="date"
            value={memoryDate}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-700">상세 내용</span>
          <textarea
            className="h-44 w-full resize-none rounded-xl bg-gray-100 p-4 text-base font-medium leading-6 outline-none focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setContent(e.target.value)}
            placeholder="어르신이 기억하면 좋을 장소, 사람, 사건을 적어주세요."
            value={content}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-700">이미지 URL</span>
          <input
            className="w-full rounded-xl bg-gray-100 p-4 text-base font-medium outline-none focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="이미지 주소가 있으면 입력해주세요."
            type="url"
            value={imageUrl}
          />
        </label>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
          <button
            className="rounded-xl bg-gray-100 py-4 text-base font-extrabold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            disabled={isSaving}
            onClick={handleDeleteOrCancel}
            type="button"
          >
            {existingMemory ? "삭제" : "취소"}
          </button>
          <button
            className="rounded-xl bg-indigo-600 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSaving}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "저장 중" : existingMemory ? "수정" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
