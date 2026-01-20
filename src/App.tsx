import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'; // Marker 대신 MarkerF 권장 (React 18 대응)
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

// 수파베이스 클라이언트 생성 (환경변수 사용 권장)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // 2. useState에 제네릭 <Store[]> 추가 (가장 중요한 TS 수정 포인트!)
  const [stores, setStores] = useState<Store[]>([]);

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

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100vh' }}
      center={{ lat: 35.8714, lng: 128.6014 }}
      zoom={13}
    >
      {stores.map((store) => (
        <MarkerF 
          key={store.id} 
          position={{ lat: store.lat, lng: store.lng }} 
          title={store.name}
        />
      ))}
    </GoogleMap>
  );
}