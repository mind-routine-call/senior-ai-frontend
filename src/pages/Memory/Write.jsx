import { useMemo, useState, useRef } from "react";
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
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    existingMemory?.image_url ? `${API_BASE_URL}${existingMemory.image_url}` : null
  );
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("memory_date", memoryDate);
      if (content.trim()) formData.append("content", content.trim());
      
      if (imageFile) formData.append("image", imageFile); 

      const requestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      };

      if (existingMemory) {
        const response = await axios.patch(
          `${API_BASE_URL}/api/v1/memories/update/${existingMemory.memory_id}`,
          formData,
          requestConfig
        );

        if (!(response.data?.isSuccess || response.data?.success)) {
          throw new Error("등록메모리 수정 실패");
        }

        alert("수정되었습니다.");
      } else {
        formData.append("elder_id", Number(activeElderId));

        const response = await axios.post(
          `${API_BASE_URL}/api/v1/memories/upload`,
          formData,
          requestConfig
        );

        if (!(response.data?.isSuccess || response.data?.success)) {
          throw new Error("등록메모리 등록 실패");
        }

        alert("등록되었습니다.");
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-700">추억 사진 업로드</span>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          {previewUrl ? (
            <div 
              className="relative w-full h-48 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-gray-200"
              onClick={() => fileInputRef.current.click()}
            >
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-bold">사진 변경하기</span>
              </div>
            </div>
          ) : (
            <div 
              className="w-full rounded-xl bg-gray-100 p-4 flex flex-col items-center justify-center text-gray-500 text-sm h-32 cursor-pointer hover:bg-gray-200 transition-colors border border-dashed border-gray-300"
              onClick={() => fileInputRef.current.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="font-semibold">클릭하여 사진 선택</span>
            </div>
          )}
        </div>

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
            {isSaving ? "처리 중..." : existingMemory ? "수정" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
  
}
