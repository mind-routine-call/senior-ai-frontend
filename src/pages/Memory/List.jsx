import React from 'react';

export default function MemoryList() {
  // 임시 데이터 (API 연동할 부분)
  const dummyMemories = [
    { memory_id: 1, title: '봄꽃 구경 갔던 날', memory_date: '2025-05-14' },
    { memory_id: 2, title: '손주 백일잔치', memory_date: '2025-04-20' },
    { memory_id: 3, title: '가족 외식', memory_date: '2025-04-05' },
  ];

  return (
    <div className="flex flex-col gap-4 py-6 bg-white min-h-screen px-4 font-sans">
      
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">박어르신 등록메모리</h1>
      </div>

      {/* 2. 메모리 리스트 영역 */}
      <div className="flex flex-col gap-3">
        {dummyMemories.map((memory) => (
          <div
            key={memory.memory_id}
            className="bg-[#e5e7eb] p-5 rounded-md flex flex-col justify-center cursor-pointer hover:bg-gray-300 transition-colors"
          >
            <span className="font-bold text-gray-800 text-[15px] mb-1">{memory.title}</span>
            <span className="text-sm text-gray-700">{memory.memory_date}</span>
          </div>
        ))}

        {/* 3. 새 메모리 추가 버튼 (+) */}
        <div 
          className="bg-[#e5e7eb] p-5 rounded-md flex justify-center items-center cursor-pointer hover:bg-gray-300 transition-colors mt-1 h-20"
          onClick={() => console.log('작성 페이지로 이동')}
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold leading-none mb-0.5">+</span>
          </div>
        </div>
      </div>

    </div>
  );
}