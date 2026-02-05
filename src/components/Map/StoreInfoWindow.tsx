import React from 'react';
import { getTier } from '../../constants/tiers';

interface StoreInfoWindowProps {
  selectedStore: any;
  reviews: any[];
  session: any;
  rating: number;
  newComment: string;
  setRating: (val: number) => void;
  setNewComment: (val: string) => void;
  handleReviewSubmit: () => void;
  handleDeleteReview: (id: string) => void;
  handleDeleteStore: (id: string) => void;
}

const StoreInfoWindow: React.FC<StoreInfoWindowProps> = ({
  selectedStore, reviews, session, rating, newComment, 
  setRating, setNewComment, handleReviewSubmit, 
  handleDeleteReview, handleDeleteStore
}) => {
  return (
    <div style={{ color: "black", padding: "5px", width: "250px" }}>
      <h3 style={{ margin: 0 }}>{selectedStore.name}</h3>
      <p style={{ margin: "5px 0", fontSize: "14px" }}>카테고리: {selectedStore.category}</p>
      <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />
      
      {/* 리뷰 목록 영역 */}
      <div style={{ marginTop: "10px", maxHeight: "200px", overflowY: "auto" }}>
        {reviews.length > 0 ? (
          reviews.map((rev: any) => {
            const userTier = getTier(0); // 추후 실제 활동량 데이터 연결 가능
            return (
              <div key={rev.id} style={{ fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #f9f9f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div title={userTier.name} style={{ display: "flex", alignItems: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" fill={userTier.color} stroke="white" strokeWidth="2"/>
                      </svg>
                    </div>
                    <strong style={{ whiteSpace: "nowrap" }}>{rev.user_name}</strong>
                    <span style={{ color: "#f8c967", marginLeft: "2px" }}>{"⭐".repeat(rev.rating)}</span>
                  </div>
                  {session?.user?.id === rev.user_id && (
                    <button 
                      onClick={() => handleDeleteReview(rev.id)} 
                      style={{ background: "none", border: "none", color: "#ff4d4f", cursor: "pointer", fontSize: "10px" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p style={{ margin: "4px 0", color: "#333", paddingLeft: "18px" }}>{rev.content}</p>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>아직 리뷰가 없습니다.</p>
        )}
      </div>

      {/* 리뷰 입력 폼 */}
      {session && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))} 
            style={{ padding: "5px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{"⭐".repeat(num)}</option>)}
          </select>
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder=" 리뷰를 입력하세요..." 
            style={{ padding: "5px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ddd" }} 
          />
          <button onClick={handleReviewSubmit} className="buttonStyle" style={{ padding: "5px", fontSize: "12px" }}>리뷰 등록</button>
        </div>
      )}
      
      <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />  
      <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#888" }}>
        제보일: {new Date(selectedStore.created_at).toLocaleDateString()}
      </p>
      
      {/* 가게 삭제 버튼 */}
      {session && session?.user?.id === selectedStore.user_id && (
        <button 
          onClick={() => handleDeleteStore(selectedStore.id)} 
          style={{ marginTop: "10px", width: "100%", padding: "5px", backgroundColor: "#ff4d4f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          제보 삭제
        </button>
      )}
    </div>
  );
};

export default StoreInfoWindow;