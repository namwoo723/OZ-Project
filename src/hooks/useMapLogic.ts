import { useState, useEffect, useMemo } from 'react';
import { storeService } from '../services/storeService';
import type { Store } from '../types/store';
import { supabase } from '../supabase';

export const useMapLogic = (session: any, triggerToast: (msg: string) => void) => {
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [center, setCenter] = useState({ lat: 35.8714, lng: 128.6014 });
  const [filter, setFilter] = useState("전체");
  const [reviews, setReviews] = useState<any[]>([]);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 로딩 지연 타이머
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeOver(true);
    }, 1000); // 1초 지연
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !isTimeOver;

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

  // 가게 클릭 시 리뷰 로드
  const handleStoreClick = async (store: Store) => {
    setSelectedStore(store);
    try {
      const data = await storeService.fetchReviews(store.id);
      setReviews(data);
    } catch (error) {
      console.error("리뷰 로드 실패:", error);
    }
  };

  // 리뷰 등록
  const handleReviewSubmit = async (content: string, rating: number) => {
    if (!content.trim() || !session) return;
    try {
      await storeService.addReview({
        store_id: selectedStore?.id,
        user_id: session.user.id,
        user_name: session.user.user_metadata.full_name || "익명",
        user_avatar: session.user.user_metadata.avatar_url,
        rating,
        content,
        user_activity_count: userActivityCount + 1 
      });
      triggerToast("⭐ 리뷰가 등록되었습니다!");
      if (selectedStore) handleStoreClick(selectedStore);
    } catch (error) {
      triggerToast("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("리뷰를 정말 삭제하시겠습니까?")) return;
    try {
      await storeService.deleteReview(reviewId);
      if (selectedStore) {
        const data = await storeService.fetchReviews(selectedStore.id);
        setReviews(data);
      }
      triggerToast("리뷰가 삭제되었습니다.");
    } catch (error) {
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  // 제보 등록
  const handleReportSubmit = async (name: string, category: string, lat: number, lng: number) => {
    const LAST_REPORT_KEY = `last_report_${session?.user?.id}`;
    const lastReportTime = localStorage.getItem(LAST_REPORT_KEY);
    const now = Date.now();
    if (lastReportTime && now - Number(lastReportTime) < 10 * 60 * 1000) {
      triggerToast(`⚠️ 10분 후 다시 시도해주세요.`);
      return false;
    }
    
    try {
      const { error } = await supabase.from("stores").insert([{ name, category, lat, lng, user_id: session.user.id }]);
      if (error) throw error;
      localStorage.setItem(LAST_REPORT_KEY, now.toString());
      triggerToast("🐟 맛집 제보 완료!");
      fetchStores();
      return true; 
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 제보 삭제
  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm("이 제보를 삭제하시겠습니까?")) return;
    try {
      await storeService.deleteStore(storeId);
      triggerToast("제보가 삭제되었습니다.");
      setSelectedStore(null);
      fetchStores();
    } catch (error) {
      triggerToast("삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchStores();
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (p) => setMyLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        null, { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return {
    isLoading,
    stores, filter, setFilter, center, setCenter, myLocation, setMap,
    fetchStoresInBounds, selectedStore, setSelectedStore, reviews, setReviews,
    handleStoreClick, handleReviewSubmit, handleDeleteReview, handleReportSubmit, handleDeleteStore
  };
};