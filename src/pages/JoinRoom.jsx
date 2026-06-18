import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, auth } from '../firebase'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

function JoinRoom() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const [nickname, setNickname] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 이미 다른 유저들이 선점하여 사용할 수 없는 색상 목록 상태
  const [takenColors, setTakenColors] = useState([])

  // 🎨 처음에 말씀하신 그린/핑크 계열에 어우러지는 감성 파스텔 뮤트 컬러 라인업
  const colors = [
    '#3A4E44', // 딥 옥 (시그니처 그린)
    '#B8D8C8', // 옥 민트 (파스텔 그린)
    '#EAC8D4', // 로즈 쿼츠 (파스텔 핑크)
    '#E6CBB5', // 토스트 베이지
    '#BAC7D5', // 포그 블루
    '#C6B8D8'  // 소프트 라벤더
  ]

  // 책방 데이터를 미리 조회해 이미 선점된 색상 추출
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomSnap = await getDoc(doc(db, 'rooms', roomId))
        if (roomSnap.exists()) {
          const roomData = roomSnap.data()
          if (roomData.colors) {
            setTakenColors(Object.values(roomData.colors))
          }
        }
      } catch (error) {
        console.error("책방 데이터 로드 실패:", error)
      }
    }
    fetchRoomData()
  }, [roomId])

  const handleJoin = async () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요!')
      return
    }
    if (nickname.length > 8) {
      alert('닉네임은 8자 이하로 입력해주세요!')
      return
    }
    if (!selectedColor) {
      alert('색상을 선택해주세요!')
      return
    }
    
    setLoading(true)
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        members: arrayUnion(auth.currentUser.uid),
        [`nicknames.${auth.currentUser.uid}`]: nickname,
        [`colors.${auth.currentUser.uid}`]: selectedColor,
      })
      navigate(`/room/${roomId}`)
    } catch (error) {
      alert('오류: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F4FAF7] px-5 pt-6 font-sans antialiased flex flex-col justify-between pb-10">
      <div className="w-full max-w-[390px] mx-auto flex-1">

        {/* 상단 앱바 */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#9AABA0] hover:text-[#3A4E44] text-lg font-bold p-1 transition-colors"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#3A4E44] tracking-tight">책방 들어가기</h1>
        </div>

        {/* 닉네임 섹션 */}
        <div className="mb-6">
          <label className="block text-[13px] font-bold text-[#3A4E44] mb-2 pl-0.5 tracking-tight">닉네임</label>
          <div className="relative shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="이 책방에서 사용할 닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={8}
              className="w-full h-11 bg-white px-4 text-xs font-medium text-[#3A4E44] outline-none border border-transparent focus:border-[#B8D8C8] transition-colors placeholder-[#9AABA0]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#9AABA0] select-none">
              <span className={nickname.length > 0 ? "text-[#B8D8C8]" : ""}>{nickname.length}</span>/8
            </div>
          </div>
        </div>

        {/* 색상 선택 섹션 (뮤트 스펙 적용) */}
        <div className="mb-8">
          <p className="text-[13px] font-bold text-[#3A4E44] pl-0.5 tracking-tight">내 색상 선택</p>
          <p className="text-[11px] text-[#9AABA0] mt-0.5 mb-5 pl-0.5 font-medium">책에 남길 흔적의 색상이에요 (선착순 고유 지정)</p>
          
          <div className="grid grid-cols-6 gap-3">
            {colors.map((color) => {
              const isTaken = takenColors.includes(color)

              return (
                <button
                  key={color}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setSelectedColor(color)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                    isTaken 
                      ? 'opacity-20 cursor-not-allowed scale-90' 
                      : 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm'
                  }`}
                  style={{
                    backgroundColor: color,
                    // 선택 시 겉면에 서비스 아이덴티티인 딥 옥 링이 둘러지도록 고도화
                    boxShadow: selectedColor === color ? '0 0 0 3px #F4FAF7, 0 0 0 5px #3A4E44' : 'none'
                  }}
                >
                  {/* 내가 선택한 컬러일 때 체크 피드백 */}
                  {selectedColor === color && (
                    <span className="text-white text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">✓</span>
                  )}
                  
                  {/* 다른 유저가 선점했을 때 비활성화 마크 */}
                  {isTaken && (
                    <span className="text-white text-[10px] font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">✕</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* 하단 고정 버튼 */}
      <div className="w-full max-w-[390px] mx-auto mt-4">
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full h-[52px] bg-[#3A4E44] active:bg-[#25332C] disabled:bg-[#E5E7EB] disabled:text-[#9AABA0] text-white rounded-2xl text-[14px] font-bold shadow-md shadow-[#3A4E44]/10 transition-colors"
        >
          {loading ? '책방 입장하는 중...' : '책방 입장하기'}
        </button>
      </div>

    </div>
  )
}

export default JoinRoom