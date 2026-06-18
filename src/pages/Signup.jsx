import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password || !passwordCheck) {
      alert('모든 항목을 입력해주세요!')
      return
    }
    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않아요!')
      return
    }
    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 해요!')
      return
    }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/set-profile')
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('이미 사용 중인 이메일이에요!')
      } else {
        alert('오류: ' + error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-sans antialiased">
      <div className="w-[390px] px-6 flex flex-col">

        {/* 상단 타이틀 영역 */}
        <div className="flex flex-col mb-8">
          {/* 민트색 북마크 아이콘 심볼 */}
          <div className="w-12 h-12 bg-[#B8D8C8] rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-[#B8D8C8]/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">회원가입</h1>
          <p className="text-sm text-[#6B7280] mt-1.5 font-medium">책크인에서 교환독서를 시작해 보세요.</p>
        </div>

        {/* 이메일 입력 섹션 */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#111827] mb-2 pl-0.5">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl px-4 text-[14px] bg-white outline-none focus:border-[#B8D8C8] transition-colors placeholder-[#9CA3AF]"
          />
        </div>

        {/* 비밀번호 입력 섹션 */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#111827] mb-2 pl-0.5">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl px-4 text-[14px] bg-white outline-none focus:border-[#B8D8C8] transition-colors placeholder-[#9CA3AF]"
          />
        </div>

        {/* 비밀번호 확인 입력 섹션 */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#111827] mb-2 pl-0.5">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 한번 더 입력해주세요"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl px-4 text-[14px] bg-white outline-none focus:border-[#B8D8C8] transition-colors placeholder-[#9CA3AF]"
          />
        </div>

        {/* 가입 완료 버튼 (글자색 딥그린 text-[#2C4A3E]로 가독성 확보) */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full h-[52px] bg-[#B8D8C8] active:bg-[#A6C8B7] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-[#2C4A3E] rounded-2xl text-[15px] font-bold mb-6 shadow-md shadow-[#B8D8C8]/10 transition-colors">
          {loading ? '가입 중...' : '책크인 시작하기'}
        </button>

        {/* 하단 로그인 링크 */}
        <p className="text-center text-[13px] text-[#6B7280] font-medium">
          이미 책크인 중이세요?{' '}
          <span
            onClick={() => navigate('/')}
            className="text-[#B8D8C8] hover:text-[#97BCAB] font-bold cursor-pointer ml-1 transition-colors">
            로그인하기
          </span>
        </p>

      </div>
    </div>
  )
}

export default Signup