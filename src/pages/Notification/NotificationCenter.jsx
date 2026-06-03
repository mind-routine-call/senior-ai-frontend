import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const navigate = useNavigate();

  // 실시간 알림 목록 더미 데이터
  const alerts = [
    {
      id: 1,
      elderlyName: "김푸름 어르신",
      type: "심각",
      message: "대명사의 과도한 반복(6회) 및 발음 정확도 저하(55%) 감지!",
      time: "방금 전",
      isRead: false
    },
    {
      id: 2,
      elderlyName: "박아름 어르신",
      type: "주의",
      message: "최종 인지 능력 점수가 임계치 미만(62점)으로 하락했습니다.",
      time: "2시간 전",
      isRead: false
    },
    {
      id: 3,
      elderlyName: "김푸름 어르신",
      type: "정상",
      message: "오늘의 인지 케어 대화가 안정적으로 완료되었습니다.",
      time: "어제",
      isRead: true
    }
  ];

  return (
    <div style={{ 
      backgroundColor: '#f1f3f5', 
      minHeight: '100vh', 
      // 💡 컨테이너 자체를 폰 노치 밑으로 완전히 끄집어 내리기 위해 상단 바깥 여백을 64px로 대폭 증가!
      padding: '64px 16px 16px 16px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      justifyContent: 'center'
    }}>
      {/* 모바일 컨테이너 UI */}
      <div style={{ 
        width: '100%', 
        maxWidth: '393px', 
        backgroundColor: '#ffffff', 
        borderRadius: '40px', 
        overflow: 'hidden',
        paddingBottom: '24px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.05)'
      }}>
        
        {/* 상단 헤더 영역 (원래대로 내부 패딩은 깔끔하게 복구) */}
        <div style={{ 
          padding: '24px 24px 16px 24px', 
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>
            🔔 이상징후 알림 센터
          </h1>
          <span style={{ 
            backgroundColor: '#f03e3e', 
            color: '#fff', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            padding: '2px 8px', 
            borderRadius: '10px' 
          }}>
            {alerts.filter(a => !a.isRead).length}
          </span>
        </div>

        {/* 알림 리스트 목록 */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {alerts.map((alert) => {
            const isDanger = alert.type === "심각";
            const isWarning = alert.type === "주의";
            
            let cardBg = '#f8f9fa';
            let borderColor = '#e9ecef';
            let badgeBg = '#adb5bd';
            
            if (isDanger) {
              cardBg = '#fff5f5';
              borderColor = '#ffc9c9';
              badgeBg = '#f03e3e';
            } else if (isWarning) {
              cardBg = '#fff9db';
              borderColor = '#ffe066';
              badgeBg = '#f59f00';
            }

            return (
              <div 
                key={alert.id} 
                onClick={() => {
                  console.log(`${alert.id}번 알림 클릭됨! 나중에 상세 리포트로 연결 예정`);
                }}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative',
                  opacity: alert.isRead ? 0.6 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#343a40' }}>
                    {alert.elderlyName}
                  </span>
                  <span style={{ 
                    backgroundColor: badgeBg, 
                    color: '#fff', 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>
                    {alert.type}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#495057', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  {alert.message}
                </p>

                <div style={{ fontSize: '11px', color: '#adb5bd', textAlign: 'right' }}>
                  {alert.time}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;