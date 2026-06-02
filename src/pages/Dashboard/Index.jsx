import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 py-6 bg-gray-50 min-h-full pb-20 font-sans">

      {/* 0. */}
      <div className="flex justify-between items-center px-2">
        <h1 className="text-xl font-bold text-gray-800">서비스명</h1>
        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xl">
          👤
        </div>
      </div>

      {/* 1. 어르신 프로필 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mx-1">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl">
          👤
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="bg-gray-200 h-4 w-24 rounded"></div>
          <div className="bg-gray-100 h-3 w-40 rounded mt-1"></div>
        </div>
      </div>

      {/* 2. 종합 점수 */}
      <div className="grid grid-cols-2 gap-3 mx-1">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">일간 종합 점수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">📊</span>
            <span className="text-2xl font-bold">86점</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">↗ 지난주 대비</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">주간 종합 점수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">📊</span>
            <span className="text-2xl font-bold">86점</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">↗ 지난주 대비</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">월간 종합 점수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">📊</span>
            <span className="text-2xl font-bold">86점</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">↗ 지난주 대비</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-[13px] text-gray-600 mb-3">월간 대화 횟수</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">💬</span>
            <span className="text-2xl font-bold">5회</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">↘ 지난주 대비</p>
        </div>
      </div>

      {/* 3. 인지 영역별 점수 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mx-1">
        <h2 className="font-bold text-gray-700 mb-5 text-[15px]">인지 영역별 점수</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">기억력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 w-[85%] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">지남력</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 w-[60%] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-14">유창성</span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 w-[90%] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-14 leading-tight">보조지표<br/><span className="text-[10px] text-gray-400">(대명사 반복)</span></span>
            <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 w-[75%] rounded-full"></div>
            </div>
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
        <h2 className="font-bold text-gray-700 mb-4 text-[15px]">주간 대화 주제</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">#식사메뉴</span>
          <span className="px-8 py-1.5 bg-gray-400 text-white rounded-full text-sm"></span>
          <span className="px-6 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm"></span>
          <span className="px-10 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm"></span>
        </div>
      </div>

    </div>
  );
}