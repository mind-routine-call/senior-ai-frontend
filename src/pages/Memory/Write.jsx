import React from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function MemoryWrite() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 py-6 bg-white min-h-screen px-4 font-sans">
      
      {/* 1. 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">박어르신 등록메모리</h1>
      </div>

      {/* 2. 입력 폼 */}
      <div className="flex flex-col gap-5">
        
        {/* 추억 제목 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">추억제목</label>
          <input 
            type="text" 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 추억 날짜 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">추억날짜</label>
          <input 
            type="date" 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full outline-none focus:ring-2 focus:ring-gray-400 text-gray-700"
          />
        </div>

        {/* 상세내용 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">상세설명내용</label>
          <textarea 
            className="bg-[#e5e7eb] p-3.5 rounded-md w-full h-48 outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            placeholder="추억을 설명해주세요."
          ></textarea>
        </div>

        {/* 이미지 및 파일 업로드 */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-semibold text-gray-700">이미지 및 파일 업로드</label>
          {/* 파일 업로드 버튼 */}
          <div className="bg-[#e5e7eb] p-4 rounded-md w-full flex items-center justify-center text-gray-500 text-sm h-16 cursor-pointer hover:bg-gray-300 transition-colors">
            <span>+ 사진을 선택해주세요</span>
          </div>
        </div>

      </div>

      {/* 3. 하단 버튼 */}
      <div className="flex gap-3 mt-auto">
        <button 
          className="flex-1 bg-[#e5e7eb] text-gray-700 font-bold py-4 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => navigate(-1)} // 뒤로 가기
        >
          삭제
        </button>
        <button 
          className="flex-1 bg-[#e5e7eb] text-gray-700 font-bold py-4 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => console.log('저장 API 연결 대기 중')}
        >
          저장
        </button>
      </div>

    </div>
  );
}