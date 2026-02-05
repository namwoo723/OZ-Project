import { useState, useEffect, useMemo } from 'react'; // useMemo 추가
import { storeService } from '../services/storeService';
import type { Store } from '../types/store';

export const useMapLogic = (session: any) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [center, setCenter] = useState({ lat: 35.8714, lng: 128.6014 });
  const [filter, setFilter] = useState("전체");
  const [reviews, setReviews] = useState<any[]>([]);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 💡 session을 활용하여 현재 사용자의 제보 횟수를 계산합니다.
  // 이 값은 리뷰 작성 시 'user_activity_count'로 넘겨줄 수 있습니다.
  const userActivityCount = useMemo(() => {
    if (!session || !session.user) return 0;
    return stores.filter(s => s.user_id === session.user.id).length;
  }, [stores, session]);

  const fetchStores = async () => {
    try {
      const data = await storeService.fetchStores();
      setStores(data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  const fetchStoresInBounds = async () => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    try {
      const data = await storeService.fetchStoresInBounds(
        { lat: sw.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: ne.lng() }
      );
      setStores(data);
    } catch (error) {
      console.error("범위 내 데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setMyLocation({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        (error) => console.error("위치 추적 실패:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return {
    stores, setStores,
    selectedStore, setSelectedStore,
    center, setCenter,
    filter, setFilter,
    reviews, setReviews,
    myLocation,
    map, setMap,
    fetchStores,
    fetchStoresInBounds,
    userActivityCount // 이 값을 밖으로 내보내어 MapPage에서 사용 가능하게 함
  };
};