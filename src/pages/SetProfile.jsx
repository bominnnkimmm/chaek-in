import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // 👈 useLocation 추가
import { auth, db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore' // 👈 기존 데이터 로드를 위해 getDoc 추가

function SetProfile() {
  const navigate = useNavigate()
  const location = useLocation() // 👈 마이페이지에서 보낸 단서(state)를 받기 위한 훅

  // 마이페이지에서 { state: { isEdit: true } }를 보냈다면 true, 아니면 false가 됩니다.
  const isEditMode = location.state?.isEdit || false 

  const [nickname, setNickname] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('📚')
  const [loading, setLoading] = useState(false)

  const emojiList = ['📚', '🍄', '🐰', '🍥', '😎', '🪐', '🍀', '⚽️', '🎨', '🍙']

  // 🛠️ 프로필 '수정' 모드일 때는 기존에 저장되어 있던 닉네임과 이모지를 불러와 화면에 먼저 채워줍니다.
  useEffect(() => {
    if (isEditMode && auth.currentUser) {
      const loadExistingProfile = async () => {
        const docRef = doc(db, 'users', auth.currentUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.nickname) setNickname(data.nickname)
          if (data.photoURL) setSelectedEmoji(data.photoURL)
        }
      }
      loadExistingProfile()
    }
  }, [isEditMode])

  const handleSave = async () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요!')
      return
    }
    if (nickname.length > 8) {
      alert('닉네임은 8자 이하로 입력해주세요!')
      return
    }
    
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        nickname: nickname,
        photoURL: selectedEmoji, 
        uid: auth.currentUser.uid,
        updatedAt: new Date() // 수정된 시간 기록
      }, { merge: true }) // merge: true를 주면 기존 데이터 중 바뀐 부분만 쏙 안전하게 덮어씁니다.
      
      // 수정 모드였다면 마이페이지로 돌려보내고, 처음 가입이면 홈으로 보냅니다.
      if (isEditMode) {
        navigate('/mypage')
      } else {
        navigate('/home')
      }
    } catch (error) {
      alert('오류: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-sans antialiased">
      <div className="w-[390px] px-6 flex flex-col">

        {/* 상단 타이틀 영역 (수정 모드에 따라 텍스트 자동 변경) */}
        <div className="flex flex-col mb-8 text-left">
          <div className="w-12 h-12 bg-[#B8D8C8] rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-[#B8D8C8]/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          
          {/* 💡 조건부 렌더링: 수정 모드일 때 타이틀 변경 */}
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            {isEditMode ? '프로필 수정' : '프로필 설정'}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1.5 font-medium">
            {isEditMode ? '변경할 캐릭터와 닉네임을 정해주세요.' : '책크인에서 사용할 캐릭터와 닉네임을 정해주세요.'}
          </p>
        </div>

        {/* 현재 선택된 프로필 이모지 표시 영역 */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#EAF5F0] flex items-center justify-center border-2 border-white shadow-md shadow-[#B8D8C8]/10 relative select-none">
            <span className="text-4xl">{selectedEmoji}</span>
          </div>
        </div>

        {/* 이모지 선택 리스트 */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#111827] mb-2.5 pl-0.5">프로필 캐릭터 선택</label>
          <div className="grid grid-cols-5 gap-2 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`h-11 text-2xl flex items-center justify-center rounded-xl transition-all duration-200 ${
                  selectedEmoji === emoji 
                    ? 'bg-[#EAF5F0] border-2 border-[#B8D8C8] scale-105' 
                    : 'hover:bg-[#F9FAFB] active:scale-95'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 닉네임 입력 섹션 */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-[#111827] mb-2 pl-0.5">닉네임 (최대 8자)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={8}
              className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl pl-4 pr-16 text-[14px] bg-white outline-none focus:border-[#B8D8C8] transition-colors placeholder-[#9CA3AF]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#9CA3AF] select-none">
              <span className={nickname.length > 0 ? "text-[#B8D8C8] font-bold" : ""}>{nickname.length}</span>/8
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 (💡 수정 모드일 때 '수정 완료'로 텍스트 자동 스위칭) */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-[52px] bg-[#B8D8C8] active:bg-[#A6C8B7] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-[#2C4A3E] rounded-2xl text-[15px] font-bold shadow-md shadow-[#B8D8C8]/10 transition-colors"
        >
          {loading ? '저장 중...' : (isEditMode ? '수정 완료' : '책크인 시작하기')}
        </button>

      </div>
    </div>
  )
}

export default SetProfile