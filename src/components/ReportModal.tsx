import { useState } from 'react';
import './ReportModal.css';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (name: string, category: string) => void;
}

export default function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("붕어빵");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🐟 새로운 맛집 제보</h2>
        
        <label className="input-label">가게 이름</label>
        <input 
          className="modal-input"
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 북문 꿀붕어빵"
        />

        <label className="input-label">카테고리</label>
        <select 
          className="modal-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="붕어빵">붕어빵</option>
          <option value="호떡">호떡</option>
          <option value="군고구마">군고구마</option>
          <option value="두쫀쿠">두쫀쿠</option>
          <option value="기타">기타</option>
        </select>

        <div className="modal-button-group">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button 
            className="btn-submit"
            onClick={() => onSubmit(name, category)}
          >
            제보하기
          </button>
        </div>
      </div>
    </div>
  );
}