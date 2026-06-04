import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [chartsData, setChartsData] = useState(null); 
  const [chatsData, setChatsData] = useState(null);

  // 임시 어르신 ID 
  const elderId = 1; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, chartsRes, chatsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/summary`),
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/charts`),
          axios.get(`${API_BASE_URL}/api/v1/dashboard/${elderId}/chats`)
        ]);

        if(summaryRes.data.isSuccess) setSummaryData(summaryRes.data.result);
        if(chartsRes.data.isSuccess) setChartsData(chartsRes.data.result); // 차트 데이터 저장
        if(chatsRes.data.isSuccess) setChatsData(chatsRes.data.result);
        
        console.log("데이터 가져오기 성공");

      } catch (error) {
        console.error("데이터 가져오기 실패", error);
      }
    };

    fetchDashboardData();
  }, []);

  const elder = summaryData?.elder || {};
  const latestAssessment = summaryData?.latest_assessment || {};
  const weeklyCallCount = summaryData?.weekly_call_count || 0;
  
  const formattedChartData = chartsData?.trends?.map(item => {
    const date = new Date(item.assessed_at);
    return {
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      score: item.total_score
    };
  }) || [];

  return (
    <div className="flex flex-col gap-4 py-6 bg-gray-50 min-h-full pb-20 font-sans">

   {/* 0. 헤더 */}
      <div className="flex justify-between items-center px-4">
        <h1 className="text-xl font-bold text-gray-800">mindroutine</h1>
        <button className="w-9 h-9 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </button>
      </div>

{/* 1. 어르신 프로필 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mx-4">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-indigo-300">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-lg font-bold text-gray-800">{elder.name || '어르신 이름'}</div>
          <div className="text-[13px] text-gray-500 font-medium">
            {elder.gender === 'M' ? '남성' : elder.gender === 'F' ? '여성' : '성별'} | {elder.age ? `${elder.age}세` : '나이'} | {elder.cognitive_note || '상태 없음'}
          </div>
        </div>
      </div>

      {/* 2. 종합 점수 */}
      <div className="grid grid-cols-2 gap-3 mx-4">
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
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-4">
        <h2 className="font-bold text-gray-700 mb-5 text-[15px]">인지 영역별 점수</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-20 flex-shrink-0">기억력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full transition-all duration-500" style={{ width: `${latestAssessment.memory_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.memory_score || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-20 flex-shrink-0">주의집중력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full transition-all duration-500" style={{ width: `${latestAssessment.attention_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.attention_score || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-20 flex-shrink-0">언어능력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full transition-all duration-500" style={{ width: `${latestAssessment.language_score || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{latestAssessment.language_score || 0}</span>
          </div>
        </div>
      </div>

      {/* 4. 주간 점수 추이 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-4">
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">주간 점수 추이</h2>
        <div className="h-48 w-full mt-4">
          {formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">데이터가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 5. 주간 대화 주제 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-4">
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">최근 대화 주제</h2>
        <div className="flex flex-wrap gap-2">
          {chatsData && chatsData.length > 0 ? (
            chatsData.map((chat) => (
              chat.scenario_title && (
                <span key={`topic-${chat.call_id}`} className="px-4 py-1.5 bg-[#f1f5f9] text-gray-600 font-medium rounded-full text-[13px]">
                  #{chat.scenario_title}
                </span>
              )
            ))
          ) : (
            <span className="text-sm text-gray-400">최근 대화 주제가 없습니다.</span>
          )}
        </div>
      </div>

      {/*  6. 최근 대화 내역 리스트*/}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-4 mb-4">
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">최근 대화 내역</h2>
        <div className="flex flex-col gap-3">
          {chatsData && chatsData.length > 0 ? (
            chatsData.map((chat) => (
              <div key={`chat-${chat.call_id}`} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-800 text-[14px]">
                    {chat.scenario_title || '자유 대화'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {new Date(chat.started_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${chat.call_status === '진행중' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                    {chat.call_status}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">대화 {chat.turn_count}회</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">최근 진행된 대화가 없습니다.</div>
          )}
        </div>
      </div>

    </div>
  );
}