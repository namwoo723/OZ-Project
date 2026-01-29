import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { supabase } from "../supabase"; // 기존 수파베이스 설정 파일
import Login from '../pages/Login';
import "./MyMap.css"
import type { Store } from '../types/store';
import { CATEGORIES, ICON_URLS } from '../constants/mapIcons';
import { GOOGLE_MAP_STYLE } from '../constants/mapStyles';
import { storeService } from '../services/storeService';
import ReportModal from './ReportModal';

export default function MyMap({ session }: { session: any }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });
  const [stores, setStores] = useState<Store[]>([]); // useState에 제네릭 <Store[]> 추가
  const [selectedStore, setSelectedStore] = useState<Store | null>(null); // 클릭한 가게 저장(InfoWindow)
  const [center, setCenter] = useState({ lat: 35.8714, lng: 128.6014 }); // 현재 위치 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false); // 새로운 맛집 제보 모달
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [filter, setfilter] = useState("전체");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태
  const [toastMessage, setToastMessage] = useState(""); // 토스트 메시지 내용
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부
  const [isTimeOver, setIsTimeOver] = useState(false); // 로딩스피너 시간 지연 상태
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  // 로딩스피너 시간 지연 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeOver(true);
    }, 1000);

    return () => clearTimeout(timer);
  },[]);
  
  const fetchStores = async () => {
    try {
      const data = await storeService.fetchStores();
      setStores(data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      triggerToast("데이터를 불러오지 못했습니다.");
    } finally {
      setIsTimeOver(true); 
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // 가게 클릭 시 리뷰 로드
  const handleStoreClick = async (store: Store) => {
    setSelectedStore(store);
    try {
      const data = await storeService.fetchReviews(store.id);
      setReviews(data);
    } catch (error) {
      console.error("리뷰 로드 실패:", error)
    }
  };

  // 리뷰 등록 함수
  const handleReviewSubmit = async () => {
    if (!newComment.trim()) return;
    if (!session) {
      triggerToast("🔑 로그인 후 리뷰를 남겨주세요!");
      return;
    }

    try {
      await storeService.addReview({
        store_id: selectedStore?.id,
        user_id: session.user.id,
        user_name: session.user.user_metadata.full_name || "익명",
        user_avatar: session.user.user_metadata.avatar_url,
        rating,
        content: newComment
      });

      setNewComment(""); // 입력창 초기화
      triggerToast("⭐ 리뷰가 등록되었습니다!");
      handleStoreClick(selectedStore!); // 리뷰 목록 갱신
    } catch (error) {
      triggerToast("리뷰 등록 중 오류가 발생했습니다.");
    }
  }

  // 실시간 위치 추적 함수
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMyLocation(newPos); // 내 위치 상태 업데이트
        },
        (error) => console.error("위치 추적 실패:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000} // 정밀도 옵션
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  // 위치 가져오기 함수
  const handleFindMyLocation = () => {
    console.log("위치 버튼 클릭!", myLocation);
    if (myLocation) {
      // 이미 실시간으로 추적 중인 내 위치(myLocation)로 지도 중심 이동
      setCenter({
        lat: myLocation.lat,
        lng: myLocation.lng
      });
    } else {
      triggerToast("📍 위치 정보를 가져올 수 없습니다. 설정을 확인해 주세요.")
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const handleReportSubmit = async (name: string, category: string) => {
    // 유효성 검사(이름 공백 혹은 좌표 없을시 중단)
    if(!name || !clickedCoord) {
      triggerToast("가게 이름을 입력해 주세요!");
      return;
    }

    // 수파베이스 insert 호출
    const { error } = await supabase
      .from("stores")
      .insert([{
          name,
          category,
          lat: clickedCoord.lat,
          lng: clickedCoord.lng,
          user_id: session?.user?.id // 현재 로그인한 사용자의 ID 추가
      }]);
    if (error) {
      alert("저장 중 오류가 발생했습니다.");
      return;
    }

    // 저장 성공 후 처리
    triggerToast("🐟 맛집 제보 완료!")
    setIsModalOpen(false); // 모달 닫기
    // 지도 데이터 새로고침 (방금 넣은 마커 바로 보이게 하기)
    fetchStores();
  }

  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm("이 제보를 삭제하시겠습니까?")) return;

    try {
      await storeService.deleteStore(storeId);
      triggerToast("제보가 삭제되었습니다.");
      setSelectedStore(null);
      fetchStores(); // 다시 가져오기
    } catch (error) {
      triggerToast("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!isLoaded || !isTimeOver) {
    return (
      <div className='spinner-overlay'>
        <img src="/icons/Bungeobbang.png" className='bungeo-spinner' alt="loading" />
        <p style={{ marginTop: "20px", fontWeight: "bold", color: "#f8c967" }}>
          붕어빵 굽는 중... 🐟
        </p>
      </div>
    )
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 상단 버튼 컨테이너 */}
      <div style = {{ position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", gap: "10px"}}>
        {!session ? (
          // 비로그인 상태: 로그인 버튼 노출
          <button onClick={() => setIsLoginModalOpen(true)} className="buttonStyle">🔑 로그인</button>
        ) : (
          // 로그인 상태: 프로필과 로그아웃 버튼 노출
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={session?.user?.user_metadata?.avatar_url} style={{ width: "35px", borderRadius: "50%" }} />
            <button onClick={() => supabase.auth.signOut()} className="buttonStyle">로그아웃</button>
          </div>
        )}
        <button onClick={handleFindMyLocation} className="buttonStyle">📍 내 위치 찾기</button>
      </div>

      {/* 로그인 모달 */}
      {!session && isLoginModalOpen && (
        <div style={{ 
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
          zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ position: "relative" }}>
            <Login onClose={() => setIsLoginModalOpen(false)}/>
          </div>
        </div>
      )}

      {/* 지도 위에 필버 버튼들 배치 */}
      <div style = {{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
        {CATEGORIES.map(cat => (
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
            triggerToast("🔑 로그인 후 제보하실 수 있습니다!")
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
          styles: GOOGLE_MAP_STYLE,
          disableDefaultUI: true, // 불필요한 구글 버튼 제거
        }}
      >
        <MarkerClusterer
          options={{
            styles: [
              {
                // data:image/svg+xml(선언문): SVG 이미지 데이터임을 선언, encodeURIComponent(번역기): 디버그를 위한 안전한 문자열로 번역
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="22" fill="#F8C967" stroke="white" stroke-width="2"/>
                  </svg>
                `)}`,
                height: 50,
                width: 50,
                
                // 텍스트 스타일: 중앙 숫자 디자인
                textColor: "white",
                textSize: 16,           // 숫자 크기
                anchorText: [0, 0],     // 텍스트 위치 (0,0 이 중앙)
              }
            ]
          }}
        >
          {(clusterer) => (
            <div>
              {stores
                .filter(s => filter === "전체" || s.category === filter) // 필터링 로직 추가
                .map((store) => (
                  <MarkerF 
                    key = {store.id} 
                    clusterer={clusterer}
                    position = {{ lat: store.lat, lng: store.lng }}
                    onClick = {() => handleStoreClick(store)} // 마커 클릭 시 데이터 저장
                    icon = {{
                      url: ICON_URLS[store.category] || "/icons/etc.png", // 카테고리 매칭
                      scaledSize: new google.maps.Size(40, 40), // 아이콘 크기 조절
                    }}
                  />
                ))
              }
            </div>
          )}
        </MarkerClusterer>
        {/* 내 위치 마커 */}
        {myLocation && (
          <MarkerF
            position = {myLocation}
            options = {{
              zIndex: 9999, // 다른 마커들보다 상위 표시
              optimized: false // 구글 맵이 레이어 순서를 임의로 섞지 못하게 설정
            }}  
            icon = {{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                  <circle cx="15" cy="15" r="12" fill="#4285F4" fill-opacity="0.3"/>
                </svg>
              `)}`,
              anchor: new google.maps.Point(15, 15), // 중심점 설정
            }}
          />
        )}
        {/* 선택된 가게가 있을 때만 말풍선 표시 */}
        {selectedStore && (
          <InfoWindow
            position = {{ lat: selectedStore.lat, lng: selectedStore.lng }}
            onCloseClick = {() => {
              setSelectedStore(null);
              setReviews([]); // 리뷰 상태도 초기화
            }} // 닫기 버튼 클릭 시 초기화
          >
            <div style = {{ color: "black", padding: "5px", width: "250px" }}>
              <h3 style = {{ margin: 0 }}>{selectedStore.name}</h3>
              <p style = {{ margin: "5px 0", fontSize: "14px" }}>카테고리: {selectedStore.category}</p>

              <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />

              {/* 리뷰 목록 표시 */}
              <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "10px" }}>
                {reviews.length > 0 ? reviews.map(r => (
                  <div key={r.id} style={{ fontSize: "12px", marginBottom: "8px", borderBottom: "1px solid #f9f9f9" }}>
                    <strong>{r.user_name}</strong> <span style={{ color: "#f8c967" }}>{"⭐".repeat(r.rating)}</span>
                    <p style={{ margin: "2px 0" }}>{r.content}</p>
                  </div>
                )) : <p style={{ fontSize: "12px", color: "#999" }}>아직 리뷰가 없어요. 첫 리뷰를 남겨보세요! 🐟</p>}
              </div>

              {/* 리뷰 입력 폼 (로그인 시에만) */}
              {session && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: "5px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ddd" }}>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="1">⭐</option>
                  </select>
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder=" 리뷰를 입력하세요..."
                    style={{ padding: "5px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                  <button onClick={handleReviewSubmit} className="buttonStyle" style={{ padding: "5px", fontSize: "12px",  }}>리뷰 등록</button>
                </div>
              )}

              <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />  

              {/* 날짜 표시 추가 */}
              <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#888" }}>
                제보일: {new Date(selectedStore.created_at).toLocaleDateString()}
              </p>

              {/* 삭제 버튼: 본인이 등록한 가게일때만 표시 */ }
              {session && session?.user?.id === selectedStore.user_id && (
                <button
                  onClick={() => handleDeleteStore(selectedStore.id)}
                  style={{
                    marginTop: "10px", width: "100%", padding: "5px", 
                    backgroundColor: "#ff4d4f", color: "white", border: "none", 
                    borderRadius: "8px", cursor: "pointer"
                  }}
                >
                  제보 삭제
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* 제보 모달 */}
      {isModalOpen && (
        <ReportModal
          onClose = {() => setIsModalOpen(false)}
          onSubmit = {handleReportSubmit}
        />
      )} 
      {/* 토스트 알림 UI */}
      {showToast && (
        <div className='toast-container'>
          {toastMessage}
        </div>
      )}
    </div>
  );
}