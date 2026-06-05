import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [chatsData, setChatsData] = useState(null);

  // 임시 어르신 ID 
  const elderId = 1; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, , chatsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/summary`),
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/charts`),
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/chats`)
        ]);

        setSummaryData(summaryRes.data.result);
        setChatsData(chatsRes.data.result);
        
        console.log("데이터 가져오기 성공!");

      } catch (error) {
        console.error("데이터 가져오기 실패", error);
      }
    };

    fetchDashboardData();
  }, []);

  const elder = summaryData?.elder || {};
  const latestAssessment = summaryData?.latest_assessment || {};
  const weeklyCallCount = summaryData?.weekly_call_count || 0;
  
  return (
    <div className="flex flex-col gap-4 py-6 bg-gray-50 min-h-full pb-20 font-sans">

      {/* 0. 헤더 */}
      <div className="flex justify-between items-center px-2">
        <h1 className="text-xl font-bold text-gray-800">mindroutine</h1>
        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
      </div>

      {/* 1. 어르신 프로필 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mx-1">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl">👤</div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-lg font-bold text-gray-800">{elder.name || '어르신 이름'}</div>
          <div className="text-sm text-gray-500">
            {elder.gender === 'M' ? '남성' : elder.gender === 'F' ? '여성' : '성별'} | {elder.age ? `${elder.age}세` : '나이'} | {elder.cognitive_note || '상태 없음'}
          </div>
        </div>
      </div>

      {/* 2. 종합 점수 */}
      <div className="grid grid-cols-2 gap-3 mx-1">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">최근 종합 점수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">📊</span>
            <span className="text-2xl font-bold">{latestAssessment.total_score || 0}점</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">주간 대화 횟수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">💬</span>
            <span className="text-2xl font-bold">{weeklyCallCount}회</span>
          </div>
        </div>
      </div>

      {/* 3. 인지 영역별 점수 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-1">
        <h2 className="font-bold text-gray-700 mb-5 text-[15px]">인지 영역별 점수</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">기억력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${latestAssessment.memory_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.memory_score || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">지남력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${latestAssessment.attention_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.attention_score || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">유창성</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${latestAssessment.language_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.language_score || 0}</span>
          </div>
        </div>
      </div>

      {/* 4. 주간 점수 추이 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-1">
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">주간 점수 추이</h2>
        <div className="h-40 rounded-xl flex flex-col items-center justify-end pb-2 text-xs text-gray-400 border-b border-gray-200 relative">
          <svg className="absolute inset-0 w-full h-[85%]" preserveAspectRatio="none">
             <polyline points="0,120 50,110 100,50 150,70 200,65 250,30 300,60 350,10" fill="none" stroke="#9ca3af" strokeWidth="2.5" />
          </svg>
          <div className="flex w-full justify-between px-3 mt-4 z-10">
            <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
          </div>
        </div>
      </div>

      {/* 5. 주간 대화 주제 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-1">
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">최근 대화 주제</h2>
        <div className="flex flex-wrap gap-2">
          {chatsData && chatsData.length > 0 ? (
            chatsData.map((chat) => (
              chat.scenario_title && (
                <span key={chat.call_id} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                  #{chat.scenario_title}
                </span>
              )
            ))
          ) : (
            <span className="text-sm text-gray-400">최근 대화 내역이 없습니다.</span>
          )}
        </div>
      </div>

    </div>
  );
}
