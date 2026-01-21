import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow } from '@react-google-maps/api'; // Marker 대신 MarkerF 권장 (React 18 대응)
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// 1. Store 타입 정의 (파일을 따로 만드셨다면 import 하세요)
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
  etc: "icons/etc.png",
}

// 수파베이스 클라이언트 생성 (환경변수 사용 권장)
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
  
  useEffect(() => {
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
    fetchStores();
  }, []);
  
  console.log(stores)

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle = {{ width: '100%', height: '100vh' }}
      center = {{ lat: 35.8714, lng: 128.6014 }}
      zoom = {13}
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
      {stores.map((store) => (
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
          <div style = {{ color: 'black', padding: '5px' }}>
            <h3 style = {{ margin: 0 }}>{selectedStore.name}</h3>
            <p style = {{ margin: '5px 0 0' }}>카테고리: {selectedStore.category}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : <></>;
}