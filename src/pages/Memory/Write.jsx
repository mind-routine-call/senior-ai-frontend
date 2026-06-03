import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function MemoryWrite() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const existingMemory = location.state?.memory;

  const [title, setTitle] = useState(existingMemory ? existingMemory.title : '');
  const [memoryDate, setMemoryDate] = useState(
    existingMemory ? String(existingMemory.memory_date).substring(0, 10) : ''
  );
  const [content, setContent] = useState(existingMemory ? existingMemory.content || '' : '');

  const elderId = 1; 

  // [저장 / 수정] 버튼
  const handleSave = async () => {
    if (!title.trim()) return alert('추억 제목을 입력해주세요.');
    if (!memoryDate) return alert('추억 날짜를 선택해주세요.');

    try {
      if (existingMemory) {
        // 기존 메모리가 있다면 -> 수정 API (PATCH)
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/memories/update/${existingMemory.memory_id}`, {
          title,
          memory_date: memoryDate,
          content,
        });
        if (response.data.isSuccess) {
          alert('추억이 성공적으로 수정되었습니다.');
          navigate('/memory');
        }
      } else {
        // 기존 메모리가 없다면 -> 등록 API (POST)
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/memories/upload`, {
          elder_id: elderId,
          title,
          memory_date: memoryDate,
          content,
        });
        if (response.data.isSuccess) {
          alert('추억이 성공적으로 등록되었습니다.');
          navigate('/memory');
        }
      }
    } catch (error) {
      console.error('저장/수정 실패:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // [취소 / 삭제] 버튼
  const handleDeleteOrCancel = async () => {
    if (!existingMemory) {
      // 새로 쓰는 중이었다면 그냥 뒤로 가기
      navigate(-1);
      return;
    }

    if (!window.confirm('정말로 이 추억을 삭제하시겠습니까?')) return;

    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/memories/delete/${existingMemory.memory_id}`);
      if (response.data.isSuccess) {
        alert('추억이 삭제되었습니다.');
        navigate('/memory');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-4 py-6 bg-white min-h-screen px-4 font-sans">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">박어르신 등록메모리</h1>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">추억제목</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)} 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="제목을 입력하세요 (필수)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">추억날짜</label>
          <input 
            type="date" 
            value={memoryDate}
            onChange={(e) => setMemoryDate(e.target.value)} 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full outline-none focus:ring-2 focus:ring-gray-400 text-gray-700"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">상세설명내용</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)} 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full h-48 outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            placeholder="어르신과의 추억을 설명해주세요."
          ></textarea>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-semibold text-gray-700">이미지 및 파일 업로드</label>
          <div className="bg-[#e5e7eb] p-4 rounded-md w-full flex items-center justify-center text-gray-500 text-sm h-16 cursor-pointer hover:bg-gray-300 transition-colors">
            <span>+ 사진을 선택해주세요</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <button 
          className="flex-1 bg-[#e5e7eb] text-gray-700 font-bold py-4 rounded-md hover:bg-gray-300 transition-colors"
          onClick={handleDeleteOrCancel} 
        >
          {/* 기존 데이터면 '삭제', 아니면 '취소' */}
          {existingMemory ? '삭제' : '취소'}
        </button>
        <button 
          className="flex-1 bg-[#e5e7eb] text-gray-700 font-bold py-4 rounded-md hover:bg-gray-300 transition-colors"
          onClick={handleSave} 
        >
          {/* 기존 데이터면 '수정', 아니면 '저장' */}
          {existingMemory ? '수정' : '저장'}
        </button>
      </div>
    </div>
  );
}