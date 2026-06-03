import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MemoryList() {
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);

  // 임시 어르신 번호
  const elderId = 1; 

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/memories/list/${elderId}`);
        
        if (response.data.isSuccess) {
          setMemories(response.data.result);
        }
      } catch (error) {
        console.error('메모리 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchMemories();
  }, []);

  return (
    <div className="flex flex-col gap-4 py-6 bg-white min-h-screen px-4 font-sans">
      
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">박어르신 등록메모리</h1>
      </div>

      {/* 2. 메모리 리스트 */}
      <div className="flex flex-col gap-3">
        
        {memories.length === 0 ? (
          <div className="bg-[#e5e7eb] p-5 rounded-md flex justify-center items-center h-24 text-gray-500 text-sm">
            등록된 추억이 없습니다.
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.memory_id}
              className="bg-[#e5e7eb] p-5 rounded-md flex flex-col justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => navigate('/memory/write', { state: { memory } })}
            >
              <span className="font-bold text-gray-800 text-[15px] mb-1">{memory.title}</span>
              <span className="text-sm text-gray-700">
                {String(memory.memory_date).substring(0, 10)}
              </span>
            </div>
          ))
        )}

        {/* 3. 메모리 추가 버튼 */}
        <div 
          className="bg-[#e5e7eb] p-5 rounded-md flex justify-center items-center cursor-pointer hover:bg-gray-300 transition-colors mt-1 h-20"
          onClick={() => navigate('/memory/write')}
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold leading-none mb-0.5">+</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}