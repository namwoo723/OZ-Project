import React from "react";
import { supabase } from '../supabase';

export default function Login({ onClose }: {onClose: () => void}) {
  // 구글 로그인
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  // 카카오 로그인 함수 (연동 설정 후 작동)
  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        // 비즈앱으로 전환 후, account_email 추가
        scopes: 'profile_nickname profile_image account_email',
      },
    });
  };

  return (
    <div style={loginBoxStyle}>
      <button onClick={onClose} style={closeXButtonStyle}>
        ✕
      </button> 

      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>🐟 붕어빵 지도</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>로그인하고 간식 정보를 공유해보세요!</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        <button onClick={handleGoogleLogin} style={googleBtnStyle}>
          Google 계정으로 계속하기
        </button>
        <button onClick={handleKakaoLogin} style={kakaoBtnStyle}>
          카카오톡으로 계속하기
        </button>
      </div>
    </div>
  );
}

// 스타일 정의
const loginBoxStyle: React.CSSProperties = {
  position: "relative", // X 버튼의 기준점이 됩니다.
  padding: "50px 40px 40px", // 상단 여백을 조금 더 주어 버튼 공간 확보
  borderRadius: "20px", 
  backgroundColor: "white",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)", 
  textAlign: "center", 
  width: "350px"
};

const closeXButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "15px",
  right: "20px",
  background: "none",
  border: "none",
  fontSize: "24px",
  color: "#999",
  cursor: "pointer",
  lineHeight: "1",
  padding: "5px"
};

const googleBtnStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid #ddd",
  backgroundColor: "white", cursor: "pointer", fontWeight: "bold"
};

const kakaoBtnStyle = {
  padding: "12px", borderRadius: "8px", border: "none",
  backgroundColor: "#FEE500", color: "#3C1E1E", cursor: "pointer", fontWeight: "bold"
};