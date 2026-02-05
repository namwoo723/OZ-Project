import React from 'react';
import { supabase } from '../../supabase';
import Login from '../../pages/Login';

interface AuthButtonsProps {
  session: any;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  onFindMyLocation: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  session, 
  isLoginModalOpen, 
  setIsLoginModalOpen, 
  onFindMyLocation 
}) => {
  return (
    <>
      {/* 상단 버튼 컨테이너 */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", gap: "10px" }}>
        {!session ? (
          <button onClick={() => setIsLoginModalOpen(true)} className="buttonStyle">🔑 로그인</button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img 
              src={session?.user?.user_metadata?.avatar_url} 
              style={{ width: "35px", borderRadius: "50%" }} 
              alt="profile"
            />
            <button onClick={() => supabase.auth.signOut()} className="buttonStyle">로그아웃</button>
          </div>
        )}
        <button onClick={onFindMyLocation} className="buttonStyle">📍 내 위치 찾기</button>
      </div>

      {/* 로그인 모달 로직을 컴포넌트 내부로 이동 */}
      {!session && isLoginModalOpen && (
        <div className='modal-overlay'>
          <div style={{ position: "relative" }}>
            <Login onClose={() => setIsLoginModalOpen(false)}/>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthButtons;