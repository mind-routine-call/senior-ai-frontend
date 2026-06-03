import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const NotificationCenter = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/analysis/notifications');
        
        if (response.data && response.data.success) {
          setAlerts(response.data.data);
        }
      } catch (error) {
        console.error("이상징후 알림 목록을 불러오는데 실패했습니다 ㅜㅜ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px', color: '#868e96' }}>⏳ 실시간 이상징후 분석 데이터 불러오는 중...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: '#f1f3f5', 
      minHeight: '100vh', 
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
        
        {/* 상단 헤더 영역 */}
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
            {/* 읽지 않은 알림 개수 실시간 반영 */}
            {alerts.filter(a => !a.isRead).length}
          </span>
        </div>

        {/* 알림 리스트 목록 */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* DB에 알림이 하나도 없을 때 처리 */}
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#adb5bd', fontSize: '14px', padding: '40px 0' }}>
              🎉 아직 감지된 이상징후 알림이 없습니다.
            </div>
          ) : (
            alerts.map((alert) => {
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
                  onClick={() => console.log(`${alert.id}번 알림 상세 보기 기능은 다음 주차에!`)}
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
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;