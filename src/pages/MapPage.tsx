import { useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import Login from './Login';
import "./MapPage.css"
import ReportModal from '../components/ReportModal';
import CategoryTab from '../components/UI/CategoryTab';
import MapContainer from '../components/MapContainer';
import { useMapLogic } from '../hooks/useMapLogic';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AuthButtons from '../components/UI/AuthButtons';
import Toast from '../components/UI/Toast';

export default function MapPage({ session }: { session: any }) {
  const [toastMessage, setToastMessage] = useState(""); // 토스트 메시지 내용
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부
  const [isModalOpen, setIsModalOpen] = useState(false); // 새로운 맛집 제보 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const {
  isLoading,
  stores, filter, setFilter, center, setCenter, myLocation, setMap,
  fetchStoresInBounds, selectedStore, setSelectedStore, reviews, setReviews,
  handleStoreClick, handleReviewSubmit, handleDeleteReview, handleReportSubmit, handleDeleteStore,
} = useMapLogic(session, triggerToast);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

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

  if (!isLoaded || isLoading) return <LoadingSpinner />;

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
        onMapLoad={setMap} 
        onIdle={fetchStoresInBounds} 
        onMapClick={(e) => {
          if (!session) return triggerToast("🔑 로그인 후 제보 가능합니다.");
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat && lng) {
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
          onSubmit={async (name, category) => {
            const success = await handleReportSubmit(name, category, clickedCoord!.lat, clickedCoord!.lng);
            
            // 제보가 성공했다면 모달을 닫습니다.
            if (success) {
              setIsModalOpen(false);
            }
          }}
        />
      )} 
      {/* 토스트 알림 UI */}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}