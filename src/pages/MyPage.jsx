import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useState, useEffect } from 'react'

function MyPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [profileEmoji, setProfileEmoji] = useState('📚')
  const user = auth.currentUser

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    if (!user) return
    const docSnap = await getDoc(doc(db, 'users', user.uid))
    if (docSnap.exists()) {
      const data = docSnap.data()
      setNickname(data.nickname)
      if (data.photoURL) {
        setProfileEmoji(data.photoURL)
      }
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F4FAF7] font-sans antialiased flex flex-col">

      {/* 1. 상단 앱바 (뒤로가기 클릭 시 /home으로 강제 이동하도록 교정) */}
      <div className="flex items-center px-5 h-14 bg-white border-b border-[#D4EAE0] shadow-sm">
        <button 
          onClick={() => navigate('/home')} // 👈 기존 navigate(-1)에서 무조건 홈으로 가도록 변경!
          className="text-[#9AABA0] hover:text-[#3A4E44] mr-3 text-lg font-bold p-1 transition-colors"
        >
          ←
        </button>
        <h1 className="text-base font-bold text-[#3A4E44] tracking-tight">마이페이지</h1>
      </div>

      {/* 2. 유저 프로필 영역 */}
      <div className="flex flex-col items-center pt-10 pb-8 flex-shrink-0">
        <div className="w-20 h-20 rounded-full bg-white border-2 border-[#B8D8C8] flex items-center justify-center mb-4 shadow-sm select-none">
          <span className="text-4xl">{profileEmoji}</span>
        </div>
        <p className="text-lg font-bold text-[#3A4E44] tracking-tight">{nickname || '독서가'}</p>
        <p className="text-sm font-medium text-[#9AABA0] mt-1">{user?.email}</p>
      </div>

      {/* 3. 메뉴 리스트 */}
      <div className="px-5 w-full max-w-[390px] mx-auto">
        <div className="bg-white border border-[#D4EAE0] rounded-2xl overflow-hidden shadow-xs">
          
          <button
            onClick={() => navigate('/set-profile', { state: { isEdit: true } })}
            className="w-full flex justify-between items-center px-5 py-4 text-sm font-bold text-[#3A4E44] border-b border-[#D4EAE0] active:bg-[#F4FAF7] transition-colors"
          >
            <span>프로필 수정</span>
            <span className="text-[#9AABA0] font-light">→</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex justify-between items-center px-5 py-4 text-sm font-bold text-[#D85A30] active:bg-[#F4FAF7] transition-colors"
          >
            <span>로그아웃</span>
            <span className="font-light">→</span>
          </button>
          
        </div>
      </div>

    </div>
  )
}

export default MyPage