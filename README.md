# 붕어빵 맛집 지도 (Bungeobbang Map)

 실시간 위치 데이터를 활용하여 노점(붕어빵, 호떡, 군고구마, 두쫀쿠 등) 정보를 공유하는 커뮤니티 지도 서비스입니다.

---

## 프로젝트 소개
본 프로젝트는 **실시간 위치 데이터 서비스** 구현에 초점을 맞춘 MVP(Minimum Viable Product) 과제입니다. 배달 앱과는 달리 사용자의 자발적인 제보와 리뷰를 통해 정보가 갱신되는 시스템을 지향합니다.

* **개발 기간**: 총 20일
* **주요 타겟**: 겨울철 간식을 찾는 모든 사용자

---

## 기술 스택
- **Frontend**: `React`, `TypeScript`, `Vite`
- **Map Engine**: `Google Maps JavaScript API`
- **Backend & DB**: `Supabase` (Auth, PostgreSQL, Realtime)
- **Deployment**: `Vercel`

---

## 핵심 기능
- **실시간 지도 탐색**: Google Maps API 기반의 커스텀 지도 인터페이스.
- **위치 기반 필터링**: 붕어빵, 호떡, 군고구마 등 카테고리별 마커 필터링.
- **사용자 제보 시스템**: 로그인한 사용자가 현재 위치 또는 특정 좌표에 노점 정보를 등록.
- **신뢰도 시스템**: 리뷰 및 별점 기능을 제공하며, 작성자의 활동량에 따른 티어 배지(Bronze ~ Challenger) 노출.
- **최적화**:
  * **쿼리 최적화**: 지도의 가시 영역($33.0^{\circ}N \sim 38.6^{\circ}N$, $124.0^{\circ}E \sim 132.0^{\circ}E$) 데이터만 호출.
  * **어뷰징 방지**: 제보 후 $10\text{분}$간의 쿨다운 시스템 적용.

---

## 프로젝트 컨벤션 & 구조
### 1. 관심사의 분리 (SoC)
- **Hooks (`useMapLogic`)**: 모든 비즈니스 로직과 상태 관리를 훅에서 처리.
- **Components**: UI 렌더링에만 집중하는 순수 컴포넌트 구조.
- **Services (`storeService`)**: 데이터 통신 로직을 별도로 분리하여 관리.

### 2. 폴더 구조
```text
src/
 ├─ components/
 │   ├─ Map/         # 지도 및 정보창 관련 부품
 │   └─ UI/          # 토스트, 버튼, 스피너, 카테고리 등 공통 UI
 ├─ constants/       # 스타일 및 아이콘 상수
 ├─ hooks/           # 비즈니스 로직 (useMapLogic)
 ├─ pages/           # 메인 페이지 및 로그인 페이지
 ├─ services/        # Supabase API 통신 로직
 └─ types/           # TypeScript 인터페이스