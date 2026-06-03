import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-[#F4FAF7] flex items-center justify-center">
      <div className="w-[390px] px-6">

        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#3A4E44]">책크인</h1>
          <p className="text-sm text-[#9AABA0] mt-1">check in with books</p>
        </div>

        {/* 구글 로그인 */}
        <button 
        onClick={handleGoogleLogin}
        className="w-full h-11 border border-[#D4EAE0] rounded-xl bg-white text-[#3A4E44] text-sm font-medium mb-4">
          Google로 로그인
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#D4EAE0]"></div>
          <span className="text-xs text-[#9AABA0]">또는</span>
          <div className="flex-1 h-px bg-[#D4EAE0]"></div>
        </div>

        {/* 이메일 입력 */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 border border-[#D4EAE0] rounded-xl px-4 text-sm mb-3 bg-white outline-none"
        />

        {/* 비밀번호 입력 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 border border-[#D4EAE0] rounded-xl px-4 text-sm mb-4 bg-white outline-none"
        />

        {/* 로그인 버튼 */}
        <button 
        onClick={handleEmailLogin}
        className="w-full h-11 bg-[#3A4E44] text-white rounded-xl text-sm font-medium mb-4">
          책크인 하러 가기
        </button>

        {/* 회원가입 링크 */}
        <p className="text-center text-xs text-[#9AABA0]">
          책크인이 처음이세요? <span className="text-[#3A4E44] font-medium">회원가입</span>
        </p>

      </div>
    </div>
  )
}

export default Login