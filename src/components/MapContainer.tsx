import React from 'react';
import { GoogleMap, MarkerF, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { ICON_URLS } from '../constants/mapIcons';
import { GOOGLE_MAP_STYLE } from '../constants/mapStyles';
import StoreInfoWindow from './Map/StoreInfoWindow';

// 지도 제한 범위 설정
const KOREA_BOUNDS = {
  north: 38.6,
  south: 33.0,
  west: 124.0,
  east: 132.0,
};

interface MapContainerProps {
  session: any;
  stores: any[];
  center: { lat: number; lng: number };
  filter: string;
  myLocation: { lat: number; lng: number } | null;
  onMapLoad: (map: google.maps.Map) => void;
  onIdle: () => void;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onStoreClick: (store: any) => void;
  selectedStore: any;
  setSelectedStore: (store: any) => void;
  reviews: any[];
  handleReviewSubmit: () => void;
  handleDeleteReview: (id: string) => void;
  handleDeleteStore: (id: string) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  rating: number;
  setRating: (val: number) => void;
  setReviews: (val: any[]) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  session, stores, center, filter, myLocation, onMapLoad, onIdle, onMapClick, 
  onStoreClick, selectedStore, setSelectedStore, reviews, handleReviewSubmit, 
  handleDeleteReview, handleDeleteStore, newComment, setNewComment, rating, setRating, setReviews
}) => {
  return (
    <GoogleMap 
      mapContainerStyle={{ width: "100%", height: "100vh" }}
      center={center}
      zoom={13}
      onLoad={onMapLoad}
      onIdle={onIdle}
      onClick={onMapClick}
      options={{
        styles: GOOGLE_MAP_STYLE,
        disableDefaultUI: true,
        restriction: {
          latLngBounds: KOREA_BOUNDS,
          strictBounds: false,
        },
        minZoom: 7,
        maxZoom: 18,
      }}
    >
      <MarkerClusterer
        options={{
          maxZoom: 15,
          styles: [{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="22" fill="#F8C967" stroke="white" stroke-width="2"/>
              </svg>
            `)}`,
            height: 50, width: 50, textColor: "white", textSize: 16, anchorText: [0, 0],
          }]
        }}
      >
        {(clusterer) => (
          <div>
            {stores
              .filter(s => filter === "전체" || s.category === filter)
              .map((store) => (
                <MarkerF 
                  key={store.id} 
                  clusterer={clusterer}
                  position={{ lat: store.lat, lng: store.lng }}
                  onClick={() => onStoreClick(store)}
                  icon={{
                    url: ICON_URLS[store.category] || "/icons/etc.png",
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                />
              ))
            }
          </div>
        )}
      </MarkerClusterer>

      {myLocation && (
        <MarkerF
          position={myLocation}
          options={{ zIndex: 9999, optimized: false }}  
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                <circle cx="15" cy="15" r="12" fill="#4285F4" fill-opacity="0.3"/>
              </svg>
            `)}`,
            anchor: new google.maps.Point(15, 15),
          }}
        />
      )}

      {selectedStore && (
        <InfoWindow
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          onCloseClick={() => {
            setSelectedStore(null);
            setReviews([]);
          }}
        >
          <StoreInfoWindow
            selectedStore={selectedStore}
            reviews={reviews}
            session={session}
            rating={rating}
            newComment={newComment}
            setRating={setRating}
            setNewComment={setNewComment}
            handleReviewSubmit={handleReviewSubmit}
            handleDeleteReview={handleDeleteReview}
            handleDeleteStore={handleDeleteStore}
          />
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapContainer;