import { supabase } from '../supabase';
import "./Login.css";

export default function Login({ onClose }: {onClose: () => void}) {
  // 구글 로그인
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  // 카카오 로그인
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
    <div className="login-box">
      <button onClick={onClose} className="close-x-button">
        ✕
      </button> 

      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>🐟 붕어빵 지도</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>로그인하고 간식 정보를 공유해보세요!</p>
      
      <div className='login-button-group'>
        <button onClick={handleGoogleLogin} className="google-btn">
          Google 계정으로 계속하기
        </button>
        <button onClick={handleKakaoLogin} className="kakao-btn">
          카카오톡으로 계속하기
        </button>
      </div>
    </div>
  );
}
