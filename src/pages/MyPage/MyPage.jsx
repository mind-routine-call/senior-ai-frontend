// src/pages/MyPage/MyPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function MyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [elderList, setElderList] = useState([]);

  // 임시 어르신용 음성 및 글자 크기 세팅 상태 (와이어프레임 UI 제어용)
  const [speechSpeed, setSpeechSpeed] = useState(50);
  const [volume, setVolume] = useState(70);
  const [fontSize, setFontSize] = useState("아주 크게");

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        
        if (!token) {
          alert("로그인이 필요한 서비스입니다.");
          navigate("/login");
          return;
        }

        // 1. 내 프로필 정보 가져오기
        const profileRes = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({
          data: { 
            success: true, 
            result: { 
              name: localStorage.getItem("userName") || "김보호자", 
              role: localStorage.getItem("userRole") || "guardian", 
              
              // 회원가입할 때 Account.jsx가 저장해둔 진짜 초대코드를 꺼내오고, 
              // 그것마저 없을 때만 디자인 가이드용 가짜 코드를 보여줍니다.
              invite_code: localStorage.getItem("my_invite_code") || "ABCDEF-123456"
            } 
          }
        }));

        setUserData(profileRes.data.result);

        // 2. 보호자 계정일 경우, 연결된 어르신 리스트 조회 (대시보드 동기화 핏 적용)
        if (profileRes.data.result.role === "guardian") {
          const activeElderId = 
            localStorage.getItem("selectedElderId") || 
            localStorage.getItem("elder_id") || 
            "1";

          const myGuardianId = localStorage.getItem("guardianId") || localStorage.getItem("id") || "1";

          const eldersRes = await axios.get(`${API_BASE_URL}/api/v1/elders/list`, {
            params: { 
              elder_id: activeElderId,
              guardian_id: myGuardianId 
            },
            headers: { Authorization: `Bearer ${token}` }
          });
            
          // ✨ [수정 파트] 팀원의 백엔드 규격인 isSuccess를 검사하도록 수정합니다!
          const hasData = eldersRes.data?.isSuccess || eldersRes.data?.success;
          
          if (hasData && eldersRes.data.result) {
            const resData = eldersRes.data.result;
            // 배열 타입인지 검사 후 상태 저장
            setElderList(Array.isArray(resData) ? resData : [resData]);
          }
        }
      } catch (error) {
        console.error("마이페이지 데이터 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [navigate]);

  // 초대코드 클립보드 복사 기능
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    alert("초대코드가 클립보드에 복사되었습니다!");
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("서버 로그아웃 통신 실패, 로컬 스토리지 강제 초기화 진행");
    } finally {
      localStorage.clear();
      alert("로그아웃 되었습니다.");
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400 font-bold">로딩 중...</div>;
  }

  // 데이터 안정화 숏컷 변수들
  const isGuardian = userData?.role === "guardian";
  const myName = userData?.name || "사용자";
  const inviteCode = userData?.invite_code || "ABCDEF-123456";

  return (
    <div className="w-full h-full py-6 flex flex-col font-sans bg-gray-50 overflow-y-auto">
      
      {/* ────────────────── [상단 헤더 타이틀 블록] ────────────────── */}
      <div className="px-4 mb-4">
        {/*<h1 className="text-sm font-bold text-gray-400">
          {isGuardian ? "마이페이지 - 보호자용" : "마이페이지 - 어르신용"}
        </h1>*/}
        <h2 className="text-2xl font-black text-gray-900 mt-1">
          {isGuardian ? `${myName} 보호자님` : `${myName} 어르신님`}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {isGuardian ? "보호자계정" : "안녕하세요 😊"}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-20">
        
        {/* ========================================================= */}
        {/* 🅰️ 1. 보호자용 렌더링 구역 */}
        {/* ========================================================= */}
        {isGuardian ? (
          <>
            {/* 연결된 어르신 카드 박스 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200">
              <h3 className="font-black text-gray-800 text-base mb-3">연결된 어르신</h3>
              {elderList.length > 0 ? (
                elderList.map((elder) => (
                  <div key={elder.elder_id} className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                    <p className="text-base text-black">{elder.name || "연결된 어르신 정보가 없습니다."}</p>
                    <p className="text-gray-500 text-xs">최근 접속: 방금 전</p>
                    <p className="text-gray-500 text-xs">인지 상태: {elder.cognitive_note || "안정"}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm font-bold text-gray-400 py-2 text-center">
                  <p>등록된 어르신이 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">대시보드에서 어르신을 먼저 등록해 주세요.</p>
                </div>
              )}
            </div>

            {/* 초대코드 관리 박스 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200">
              <h3 className="font-black text-gray-800 text-base mb-3">초대코드 관리</h3>
              <div className="bg-[#8fa1d4] text-white p-3 rounded-xl flex justify-between items-center font-black tracking-wide shadow-inner">
                <span>{inviteCode}</span>
                <button 
                  onClick={() => handleCopyCode(inviteCode)}
                  className="hover:opacity-75 bg-white bg-opacity-20 p-1.5 rounded-lg text-sm transition-opacity"
                >
                  📋
                </button>
              </div>
            </div>

            {/* 대화/메모 메뉴 바로가기 연동 박스 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200 flex flex-col gap-4">
              <button 
                onClick={() => navigate("/schedule")}
                className="w-full text-left font-black text-gray-800 text-[17px] py-1.5 border-b border-gray-300 hover:text-black flex justify-between items-center"
              >
                <span>채팅 일정 예약</span>
                <span className="text-gray-400">➔</span>
              </button>
              <button 
                onClick={() => navigate("/memory/list")} // 현재 보유 중인 메모리 리스트 페이지 연결
                className="w-full text-left font-black text-gray-800 text-[17px] py-1.5 hover:text-black flex justify-between items-center"
              >
                <span>등록메모리</span>
                <span className="text-gray-400">➔</span>
              </button>
            </div>
          </>
        ) : (
          // =========================================================
          // 🅱️ 2. 어르신용 렌더링 구역
          // =========================================================
          <>
            {/* 연결된 보호자 박스 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200">
              <h3 className="font-black text-gray-800 text-base mb-1">연결된 보호자</h3>
              <p className="text-lg font-black text-gray-900 mt-2">{userData?.guardian_name || "연결된 보호자 없음"}</p>
            </div>

            {/* 음성 설정 슬라이더 바 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200 flex flex-col gap-4">
              <h3 className="font-black text-gray-800 text-base">음성 설정</h3>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-gray-700">읽어주기 속도</span>
                <input 
                  type="range" min="1" max="100" 
                  value={speechSpeed} 
                  onChange={(e) => setSpeechSpeed(e.target.value)}
                  className="w-full accent-[#8fa1d4]" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-gray-700">음량 조절</span>
                <input 
                  type="range" min="1" max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full accent-[#8fa1d4]" 
                />
              </div>
            </div>

            {/* 글자 크기 선택 세트 */}
            <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200">
              <h3 className="font-black text-gray-800 text-base mb-4">글자 크기</h3>
              <div className="flex justify-around items-center font-black">
                {["크게", "아주 크게"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`transition-all ${
                      fontSize === size 
                        ? "text-2xl text-black border-b-[3px] border-black pb-0.5" 
                        : "text-md text-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* 🔏 3. 공통 계정 설정 구역 */}
        {/* ========================================================= */}
        <div className="bg-[#e0e0e0] p-4 rounded-2xl border border-gray-200 flex flex-col gap-3">
          <h3 className="font-black text-gray-800 text-base mb-1">계정 설정</h3>
          <button className="w-full text-left font-bold text-gray-700 text-sm hover:underline">
            개인정보 변경
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left font-bold text-gray-700 text-sm hover:underline text-red-600"
          >
            로그아웃
          </button>
          <button className="w-full text-left font-bold text-gray-400 text-xs hover:underline mt-1">
            탈퇴
          </button>
        </div>

      </div>
    </div>
  );
}