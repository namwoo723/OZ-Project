// 1. 노점 카테고리 정의
export type StoreCategory = '붕어빵' | '호떡' | '군고구마' | '타코야끼';

// 2. 노점(Store) 인터페이스
export interface Store {
  id: string;
  name: string;
  category: StoreCategory;
  lat: number;
  lng: number;
  created_at: string;
}

// 3. 제보(Report) 인터페이스 - TTL 로직의 핵심
export interface Report {
  id: string;
  store_id: string;
  user_id: string | null;
  image_url: string | null;
  created_at: string; // 이 시간을 기준으로 '영업 중' 여부를 판단합니다
}