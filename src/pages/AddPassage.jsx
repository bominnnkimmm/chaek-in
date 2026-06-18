import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { collection, addDoc, doc, getDoc } from 'firebase/firestore'

function AddPassage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 🎨 사용자가 책방 가입 시 이미 선착순으로 골라둔 고유 테마 컬러를 저장할 상태 (기본값 옥민트)
  const [userColor, setUserColor] = useState('#B8D8C8')

  // 유저가 가입할 때 방 정보에 박아둔 고유 색상 긁어오기
  useEffect(() => {
    const fetchUserColorInRoom = async () => {
      if (!auth.currentUser) return
      try {
        const roomSnap = await getDoc(doc(db, 'rooms', roomId))
        if (roomSnap.exists()) {
          const roomData = roomSnap.data()
          // room 도큐먼트 내 colors 오브젝트 안에서 내 uid 키값에 대응하는 색상 추출
          if (roomData.colors && roomData.colors[auth.currentUser.uid]) {
            setUserColor(roomData.colors[auth.currentUser.uid])
          }
        }
      } catch (error) {
        console.error("유저 고유 컬러 로드 실패:", error)
      }
    }
    fetchUserColorInRoom()
  }, [roomId])

  const handleSave = async () => {
    if (!page || !text) {
      alert('페이지 번호와 구절을 입력해주세요!')
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'rooms', roomId, 'passages'), {
        page: Number(page),
        text: text,
        // 💡 수동 선택 칩 대신, 가입 동선에서 이미 선점했던 유저 고유 컬러를 자동으로 매핑 주입
        color: userColor, 
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      })
      navigate(-1)
    } catch (error) {
      alert('오류: ' + error.message)
    }
    setLoading(false)
  }

  return (
    // 상단 종이 감성의 싱그러운 민트 그라데이션 배경 통일
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5F0] via-[#F4FAF7] to-[#F4FAF7] px-5 pt-6 font-sans antialiased flex flex-col justify-between pb-10">
      <div className="w-full max-w-[390px] mx-auto flex-1">

        {/* 1. 상단 앱바 디자인 */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#9AABA0] hover:text-[#3A4E44] text-lg font-bold p-1 transition-colors"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#3A4E44] tracking-tight">구절 기록하기</h1>
        </div>

        {/* 2. 페이지 번호 섹션 (스트로크 제거 및 마감 고도화) */}
        <div className="mb-6">
          <label className="block text-[13px] font-bold text-[#3A4E44] mb-2.5 pl-0.5 tracking-tight">페이지 번호</label>
          <div className="relative w-28 shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden">
            <input
              type="number"
              placeholder="134"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full h-11 bg-white px-4 text-xs font-bold text-[#3A4E44] outline-none border border-transparent focus:border-[#B8D8C8] transition-colors placeholder-[#9AABA0]"
            />
          </div>
        </div>

        {/* 3. 구절 입력 섹션 (카드 섀도우 폼 팩터 디자인 적용) */}
        <div className="mb-8">
          <label className="block text-[13px] font-bold text-[#3A4E44] mb-2.5 pl-0.5 tracking-tight">구절 입력</label>
          <div className="shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
            <textarea
              placeholder="마음에 깊이 와닿은 책의 구절을 기록해 보세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-44 bg-white px-4 py-4 text-xs font-semibold text-[#3A4E44] outline-none border border-transparent focus:border-[#B8D8C8] transition-colors placeholder-[#9AABA0] resize-none leading-relaxed"
            />
          </div>
        </div>

      </div>

      {/* 4. 하단 고정 흔적 남기기 액션 버튼 */}
      <div className="w-full max-w-[390px] mx-auto mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-[52px] bg-[#3A4E44] active:bg-[#25332C] disabled:bg-[#E5E7EB] disabled:text-[#9AABA0] text-white rounded-2xl text-[14px] font-bold shadow-md shadow-[#3A4E44]/10 transition-colors"
        >
          {loading ? '흔적 남기는 중...' : '흔적 남기기'}
        </button>
      </div>

    </div>
  )
}

export default AddPassage