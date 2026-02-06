import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { supabase } from "../supabase"; // 기존 수파베이스 설정 파일
import Login from './Login';
import "./MapPage.css"
import type { Store } from '../types/store';
import { storeService } from '../services/storeService';
import ReportModal from '../components/ReportModal';
import CategoryTab from '../components/UI/CategoryTab';
import MapContainer from '../components/MapContainer';
import { useMapLogic } from '../hooks/useMapLogic';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AuthButtons from '../components/UI/AuthButtons';
import Toast from '../components/UI/Toast';

export default function MapPage({ session }: { session: any }) {
  const { 
    stores, filter, setFilter, center, setCenter, myLocation, setMap,
    fetchStores, fetchStoresInBounds, selectedStore, setSelectedStore, reviews, setReviews,
    userActivityCount
  } = useMapLogic(session);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // 새로운 맛집 제보 모달
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태
  const [toastMessage, setToastMessage] = useState(""); // 토스트 메시지 내용
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부
  const [isTimeOver, setIsTimeOver] = useState(false); // 로딩스피너 시간 지연 상태
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  // 로딩스피너 시간 지연 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeOver(true);
    }, 1000);

    return () => clearTimeout(timer);
  },[]);
  

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
        content: newComment,
        user_activity_count: userActivityCount + 1 
      });

      setNewComment(""); // 입력창 초기화
      triggerToast("⭐ 리뷰가 등록되었습니다!");
      handleStoreClick(selectedStore!); // 리뷰 목록 갱신
    } catch (error) {
      triggerToast("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 삭제 함수
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("리뷰를 정말 삭제하시겠습니까?")) return;

    try {
      await storeService.deleteReview(reviewId);
      console.log("리뷰 삭제 성공:", reviewId);

      // 삭제 후 목록 새로고침 (이미 만들어둔 fetchReviews 활용)
      if (selectedStore) {
        const data = await storeService.fetchReviews(selectedStore.id);
        setReviews(data);
      }
      triggerToast("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

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

  const handleReportSubmit = async (name: string, category: string, newLat: number, newLng: number) => {
    // 세션 체크
    if (!session) {
      triggerToast("🔑 로그인이 필요합니다.");
      return;
    }

    // 쿨다운 체크
    const LAST_REPORT_KEY = `last_report_${session.user.id}`;
    const lastReportTime = localStorage.getItem(LAST_REPORT_KEY);
    const now = Date.now();
    const COOLDOWN_MS = 10 * 60 * 1000; // 10분

    if (lastReportTime && now - Number(lastReportTime) < COOLDOWN_MS) {
      const remainingMin = Math.ceil((COOLDOWN_MS - (now - Number(lastReportTime))) / 60000);
      triggerToast(`⚠️ ${remainingMin}분 뒤에 가능합니다!`);
      return;
    }
    
    // 유효성 검사
    if(!name || !clickedCoord) {
      triggerToast("가게 이름을 입력해 주세요!");
      return;
    }

    try {
      // 중복 체크
      const { data: existingStore } = await supabase
        .from("stores")
        .select("id")
        .eq("lat", newLat)
        .eq("lng", newLng)
        .maybeSingle();

      if (existingStore) {
        alert("이미 같은 위치에 등록된 노점이 있습니다! 붕어빵은 나눠 먹어야 제맛이죠. 😉");
        return;
      }

      // 수파베이스 데이터 삽입
      const { error } = await supabase
        .from("stores")
        .insert([{
            name,
            category,
            lat: clickedCoord.lat,
            lng: clickedCoord.lng,
            user_id: session.user.id
        }]);

      if (error) throw error;

      // 성공 시 쿨다운 시간 업데이트
      localStorage.setItem(LAST_REPORT_KEY, now.toString());
      
      triggerToast("🐟 맛집 제보 완료!");
      setIsModalOpen(false); 
      fetchStores(); // 지도 데이터 새로고침

    } catch (error) {
      console.error("제보 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
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

  if (!isLoaded || !isTimeOver) return <LoadingSpinner />;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 상단 버튼 */}
      <AuthButtons
        session={session}
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        onFindMyLocation={handleFindMyLocation}
      />

      {/* 로그인 모달 */}
      {!session && isLoginModalOpen && (
        <div className='modal-overlay'>
          <div style={{ position: "relative" }}>
            <Login onClose={() => setIsLoginModalOpen(false)}/>
          </div>
        </div>
      )}
      
      <MapContainer
        session={session}
        stores={stores}
        center={center}
        filter={filter}
        myLocation={myLocation}
        onMapLoad={(map) => setMap(map)}
        onIdle={fetchStoresInBounds}
        onMapClick={(e) => {
            if (!session) {
              triggerToast("🔑 로그인 후 제보하실 수 있습니다!")
              return;
            }
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (lat && lng) {
              // 한국 범위 체크 로직 동일
              setClickedCoord({ lat, lng });
              setIsModalOpen(true);
            }
        }}
        onStoreClick={handleStoreClick}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        reviews={reviews}
        handleReviewSubmit={handleReviewSubmit}
        handleDeleteReview={handleDeleteReview}
        handleDeleteStore={handleDeleteStore}
        newComment={newComment}
        setNewComment={setNewComment}
        rating={rating}
        setRating={setRating}
        setReviews={setReviews}
      />
      {/* 지도 위에 필버 버튼들 배치 */}
      <CategoryTab
        currentFilter={filter}
        onFilterChange={setFilter}
      />
      
      {/* 제보 모달 */}
      {isModalOpen && (
        <ReportModal
          onClose = {() => setIsModalOpen(false)}
          onSubmit={(name, category) => 
            handleReportSubmit(name, category, clickedCoord!.lat, clickedCoord!.lng)
          }
        />
      )} 
      {/* 토스트 알림 UI */}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}