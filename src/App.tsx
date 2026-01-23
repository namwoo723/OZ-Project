import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow } from '@react-google-maps/api';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// 1. Store 타입 정의 (나중에 파일 따로 만들어 import 처리)
interface Store {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  created_at: string;
}

const ICON_URLS: { [key: string]: string } = {
  붕어빵: "/icons/Bungeobbang.png",
  군고구마: "/icons/sweet-potato.png",
  호떡: "/icons/Hotteok.png",
  두쫀쿠: "icons/Dubai-Chewy-Cookies.png",
  기타: "icons/etc.png",  
}

// 수파베이스 클라이언트 생성
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // 2. useState에 제네릭 <Store[]> 추가
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null); // 클릭한 가게 저장
  
  // 현재 위치 상태 추가
  const [center, setCenter] = useState({ lat: 35.8714, lng: 128.6014 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [newStoreName, setNewStoreName] = useState("");
  const [newCategory, setNewCategory] = useState("붕어빵");

  const [session, setSession] = useState<any>(null); // 로그인 세션

  const [filter, setfilter] = useState("전체");

  // 구글 로그인 함수
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  // 로그인 상태 감지 useEffect
  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // 로그인/로그아웃 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    console.log(session)
    return () => subscription.unsubscribe()
  }, []);

  const fetchStores = async () => {
    // 3. 수파베이스 호출 시 테이블 이름 뒤에 <Store> 타입을 명시
    const { data, error } = await supabase
      .from('stores')
      .select('*');

    if (error) {
      console.error('데이터를 불러오지 못했습니다:', error);
      return;
    }

    if (data) {
      setStores(data as Store[]); // 데이터를 Store 배열로 확정
    }
  };
  
  useEffect(() => {
    fetchStores();
  }, []);

  // 위치 가져오기 함수
  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => alert("위치 정보를 가져올 수 없습니다.")
      );
    }
  };

  const handleReportSubmit = async () => {
    // 유효성 검사(이름 공백 혹은 좌표 없을시 중단)
    if(!newStoreName || !clickedCoord) {
      alert("가게 이름을 입력하고 지도를 다시 클릭해 주세요.");
      return;
    }

    // 수파베이스 insert 호출
    const { error } = await supabase
      .from("stores")
      .insert([
        {
          name: newStoreName,
          category: newCategory,
          lat: clickedCoord.lat,
          lng: clickedCoord.lng,
        },
      ]);
    if (error) {
      console.error("제보 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
      return;
    }

    // 저장 성공 후 처리
    alert("성공적으로 제보되었습니다!")
    setIsModalOpen(false); // 모달 닫기
    setNewStoreName(""); // 입력창 초기화

    // 지도 데이터 새로고침 (방금 넣은 마커 바로 보이게 하기)
    fetchStores();
  }

  
  console.log(stores)

  // 버튼 공통 스타일
  const buttonStyle = {
      padding: "10px 15px",
      backgroundColor: "#f8c967", // 붕어빵 색상 테마
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
  };

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 상단 버튼 컨테이너 */}
      <div style = {{ position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", gap: "10px"}}>
        {/* 로그인 여부에 따라 버튼 변경 */}
        {!session ? (
          <button onClick = {handleLogin} style = { buttonStyle }>🔑 구글 로그인</button>
        ) : (
          <div style = {{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src = {session.user.user_metadata.avatar_url}
              alt = "profile"
              style = {{ width: "35px", borderRadius: "50%"}}
            />
            <button onClick = {handleLogout} style ={buttonStyle}>로그아웃</button>
          </div>
        )}
        <button onClick={handleFindMyLocation} style = {buttonStyle}>📍 내 위치 찾기</button>
      </div>
      {/* 지도 위에 필버 버튼들 배치 */}
      <div style = {{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
        {["전체", "붕어빵", "호떡", "군고구마", "두쫀쿠", "기타"].map(cat => (
          <button
            key = {cat}
            onClick = {() => setfilter(cat)}
            style = {{
              padding: "8px 12px",
              backgroundColor: filter === cat ? "#F8C967" : "white", // 선택된 것만 강조
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* 구글 맵 컴포넌트 */}
      <GoogleMap 
        mapContainerStyle = {{ width: "100%", height: "100vh" }}
        center = { center }
        zoom = {13}
        onClick = {(e) => {
          // 로그인했을 떄만 제보 모달 열기 로직
          if (!session) {
            alert("로그인 후 제보하실 수 있습니다!")
            return;
          }
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();

          if (lat && lng) {
            console.log("제보 위치:", lat, lng);
            setClickedCoord({ lat, lng });
            setIsModalOpen(true); // 모달 오픈
          }
        }}
        options = {{
          styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] },
            { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c9b2a6" }] },
            { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
            { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
            { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#93817c" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#f5f1e6" }] },
            { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#fdfcf8" }] },
            { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#f8c967" }] },
            { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#e9bc62" }] },
            { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#b9d3c2" }] }
          ],
          disableDefaultUI: true, // 불필요한 구글 버튼 제거
        }}
      >
        {stores
          .filter(s => filter === "전체" || s.category === filter) // 필터링 로직 추가
          .map((store) => (
            <MarkerF 
              key = {store.id} 
              position = {{ lat: store.lat, lng: store.lng }}
              onClick = {() => setSelectedStore(store)} // 마커 클릭 시 데이터 저장
              icon = {{
                url: ICON_URLS[store.category] || "/icons/etc.png", // 카테고리 매칭
                scaledSize: new google.maps.Size(40, 40), // 아이콘 크기 조절
              }}
            />
        ))}
        {/* 선택된 가게가 있을 때만 말풍선 표시 */}
        {selectedStore && (
          <InfoWindow
            position = {{ lat: selectedStore.lat, lng: selectedStore.lng }}
            onCloseClick = {() => setSelectedStore(null)} // 닫기 버튼 클릭 시 초기화
          >
            <div style = {{ color: "black", padding: "5px" }}>
              <h3 style = {{ margin: 0 }}>{selectedStore.name}</h3>
              <p style = {{ margin: "5px 0 0" }}>카테고리: {selectedStore.category}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* 제보 모달 */}
      {isModalOpen && (
        <div style = {{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', padding: '20px', borderRadius: '12px', zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', width: '300px', color: 'black'
        }}>
          <h2 style = {{ marginTop: 0, fontSize: '18px' }}>🐟 새로운 맛집 제보</h2>
          
          <label style = {{ fontSize: '12px', color: '#666' }}>가게 이름</label>
          <input 
            type = "text" 
            value = {newStoreName}
            onChange = {(e) => setNewStoreName(e.target.value)}
            style = {{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
            placeholder = "예: 북문 꿀붕어빵"
          />

          <label style = {{ fontSize: '12px', color: '#666' }}>카테고리</label>
          <select 
            value = {newCategory}
            onChange = {(e) => setNewCategory(e.target.value)}
            style = {{ width: '100%', padding: '8px', marginBottom: '20px' }}
          >
            <option value = "붕어빵">붕어빵</option>
            <option value = "호떡">호떡</option>
            <option value = "군고구마">군고구마</option>
            <option value = "두쫀쿠">두쫀쿠</option>
            <option value = "기타">기타</option>
          </select>

          <div style = {{ display: 'flex', gap: '10px' }}>
            <button onClick = {() => setIsModalOpen(false)} style = {{ flex: 1, padding: '10px', cursor: 'pointer' }}>취소</button>
            <button 
              onClick = {handleReportSubmit}
              style = {{ flex: 1, padding: '10px', backgroundColor: '#f8c967', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              제보하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}