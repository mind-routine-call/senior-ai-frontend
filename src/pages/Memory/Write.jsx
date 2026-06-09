import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../../utils/authSession";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith("blob:")) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

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
      localStorage.getItem("elder_id")
    );
  }, [existingMemory?.elder_id, routeElderId]);

  const [title, setTitle] = useState(existingMemory?.title || "");
  const [memoryDate, setMemoryDate] = useState(
    existingMemory?.memory_date ? String(existingMemory.memory_date).substring(0, 10) : "",
  );
  const [content, setContent] = useState(existingMemory?.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(resolveImageUrl(existingMemory?.image_url));
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);

  const config = useMemo(() => {
    const token = getAccessToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  }, []);

  const moveToList = () => navigate(activeElderId ? `/memory/${activeElderId}` : "/memory");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("이미지 파일만 업로드할 수 있습니다."); e.target.value = ""; return; }
    if (file.size > MAX_IMAGE_SIZE) { alert("이미지는 5MB 이하만 업로드할 수 있습니다."); e.target.value = ""; return; }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!activeElderId) { alert("먼저 관리할 어르신을 선택해주세요."); return; }
    if (!title.trim()) { alert("추억 제목을 입력해주세요."); return; }
    if (!memoryDate) { alert("추억 날짜를 선택해주세요."); return; }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("memory_date", memoryDate);
      if (content.trim()) formData.append("content", content.trim());
      if (imageFile) formData.append("image", imageFile);
      const requestConfig = { ...config, headers: { ...config?.headers } };
      if (existingMemory) {
        const response = await axios.patch(`${API_BASE_URL}/api/v1/memories/update/${existingMemory.memory_id}`, formData, requestConfig);
        if (!(response.data?.isSuccess || response.data?.success)) throw new Error();
        alert("수정되었습니다.");
      } else {
        formData.append("elder_id", Number(activeElderId));
        const response = await axios.post(`${API_BASE_URL}/api/v1/memories/upload`, formData, requestConfig);
        if (!(response.data?.isSuccess || response.data?.success)) throw new Error();
        alert("등록되었습니다.");
      }
      moveToList();
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrCancel = async () => {
    if (!existingMemory) { moveToList(); return; }
    if (!window.confirm("이 추억을 삭제하시겠습니까?")) return;
    setIsSaving(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/memories/delete/${existingMemory.memory_id}`, config);
      if (!(response.data?.isSuccess || response.data?.success)) throw new Error();
      alert("추억이 삭제되었습니다.");
      moveToList();
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col py-6">
      <header className="mb-6">
        <p className="text-xs font-bold" style={{ color: "#FF6E61" }}>등록메모리</p>
        <h1 className="mt-0.5 text-[22px] font-semibold">
          {existingMemory ? "추억 수정" : "추억 추가"}
        </h1>
        <p className="mt-1 text-[13px] text-[#A2A2A2]">
          어르신과 AI가 자연스럽게 이야기할 수 있는 기억을 적어주세요.
        </p>
      </header>

      <form className="flex flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#A2A2A2]">추억 제목</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 봄날의 가족 여행"
            className="h-14 w-full rounded-2xl bg-[#f6f6f6] px-4 text-[15px] font-medium placeholder:text-[#A2A2A2] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#A2A2A2]">추억 날짜</span>
          <input
            type="date"
            value={memoryDate}
            onChange={(e) => setMemoryDate(e.target.value)}
            className="h-14 w-full rounded-2xl bg-[#f6f6f6] px-4 text-[15px] font-medium text-[#1a1a1a] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#A2A2A2]">상세 내용</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="어르신이 기억하면 좋을 장소, 사람, 사건을 적어주세요."
            className="h-40 w-full resize-none rounded-2xl bg-[#f6f6f6] p-4 text-[14px] font-medium leading-6 placeholder:text-[#A2A2A2] focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#A2A2A2]">추억 사진</span>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          {previewUrl ? (
            <div
              className="relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => fileInputRef.current.click()}
            >
              <img src={previewUrl} alt="미리보기" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                <span className="text-[13px] font-semibold text-white">사진 변경하기</span>
              </div>
            </div>
          ) : (
            <div
              className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ebebeb] bg-[#f6f6f6] transition-colors hover:border-[#FF6E61]"
              onClick={() => fileInputRef.current.click()}
            >
              <svg className="mb-2 h-8 w-8 text-[#A2A2A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="text-[13px] font-semibold text-[#A2A2A2]">클릭하여 사진 선택</span>
            </div>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleDeleteOrCancel}
            className="h-13 rounded-2xl bg-[#f6f6f6] text-[15px] font-semibold text-[#1a1a1a] disabled:opacity-50"
          >
            {existingMemory ? "삭제" : "취소"}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="h-13 rounded-2xl text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF6E61, #FCA963)" }}
          >
            {isSaving ? "처리 중..." : existingMemory ? "수정" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
