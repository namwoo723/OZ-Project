import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import MapPage from './pages/MapPage';

export default function App() {
  const [session, setSession] = useState<any>(null); // 로그인 세션
  // 로그인 상태 감지 useEffect
  useEffect(() => {
    // 현재 세션 가져오기(새로고침이나 앱 접속 직후 브라우저에 저장된 로그인 정보가 있는지 서버에 확인하는 함수)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // 로그인/로그아웃 상태 확인(로그인 상태의 변화를 실시간으로 감시하는 구독 서비스)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    console.log(session)
    return () => subscription.unsubscribe() // 메모리 누수 방지
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MapPage session={session} />
    </div>
  );
}



