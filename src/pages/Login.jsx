import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // 눈모양 토글을 위한 상태 (true: 비밀번호 보임, false: 점으로 가려짐)
  const [showPassword, setShowPassword] = useState(false) 
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/home')
    } catch (error) {
      alert('로그인 실패: ' + error.message)
    }
  }

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/home')
    } catch (error) {
      alert('로그인 실패: ' + error.message)
    }
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
          
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">책크인</h1>
          <p className="text-sm text-[#6B7280] mt-1.5 font-medium">로그인 후 친구들과 교환독서를 시작해보세요!</p>
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
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#111827] mb-2 pl-0.5">비밀번호</label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"} 
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl pl-4 pr-12 text-[14px] bg-white outline-none focus:border-[#B8D8C8] transition-colors placeholder-[#9CA3AF]"
            />
            
            {/* 눈모양 버튼 아이콘 */}
            <div 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 cursor-pointer text-[#9CA3AF] hover:text-[#6B7280] select-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* 이메일 로그인 버튼 */}
        <button 
          onClick={handleEmailLogin}
          className="w-full h-[52px] bg-[#B8D8C8] active:bg-[#A6C8B7] text-[#2C4A3E] rounded-2xl text-[15px] font-bold mb-6 shadow-md shadow-[#B8D8C8]/10 transition-colors">
          이메일로 로그인
        </button>

        {/* 또는 구분선 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
          <span className="text-[11px] text-[#9CA3AF] font-medium">또는</span>
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
        </div>

        {/* 구글 로그인 버튼 (절대 깨지지 않는 완전한 내장형 SVG 적용) */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full h-[52px] border border-[#E5E7EB] rounded-2xl bg-white active:bg-[#F9FAFB] text-[#111827] text-[14px] font-semibold mb-8 flex items-center justify-center gap-3 transition-colors">

          Google로 계속하기
        </button>

        {/* 하단 회원가입 링크 */}
        <p className="text-center text-[13px] text-[#6B7280] font-medium">
          처음 오셨나요? <span onClick={() => navigate('/signup')} className="text-[#B8D8C8] hover:text-[#97BCAB] font-bold cursor-pointer ml-1 transition-colors">회원가입</span>
        </p>

      </div>
    </div>
  )
}

export default Login