import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { createClient } from '@supabase/supabase-js';

// 수파베이스 연결 설정
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function MyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  const [stores, setStores] = useState([]);

  // 1. DB에서 노점 데이터 불러오기
  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*');
      setStores(data);
    };
    fetchStores();
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100vh' }}
      center={{ lat: 35.8714, lng: 128.6014 }} // 대구 중심 좌표
      zoom={13}
    >
      {/* 2. 불러온 데이터를 마커로 표시 */}
      {stores.map(store => (
        <Marker 
          key={store.id} 
          position={{ lat: store.lat, lng: store.lng }} 
          title={store.name}
        />
      ))}
    </GoogleMap>
  ) : <></>;
}