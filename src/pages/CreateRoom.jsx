import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'

function CreateRoom() {
  const location = useLocation()
  const navigate = useNavigate()
  const book = location.state?.book
  const [members, setMembers] = useState(3)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState(null)

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const inviteCode = generateCode()
      await addDoc(collection(db, 'rooms'), {
        bookTitle: book.title,
        bookThumbnail: book.thumbnail,
        bookAuthor: book.authors?.join(', '),
        maxMembers: members,
        inviteCode: inviteCode,
        dueDate: dueDate,
        isCompleted: false,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        members: [auth.currentUser.uid]
      })
      alert(`책방이 만들어졌어요! 초대코드: ${inviteCode}`)
      navigate('/home')
    } catch (error) {
      alert('오류: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5F0] via-[#F4FAF7] to-[#F4FAF7] px-5 pt-6 font-sans antialiased flex flex-col justify-between pb-10">
      <div className="w-full max-w-[390px] mx-auto flex-1">
        
        {/* 상단 타이틀 앱바 */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#9AABA0] hover:text-[#3A4E44] text-lg font-bold p-1 transition-colors"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#3A4E44] tracking-tight">교환독서 개설</h1>
        </div>

        {/* 선택된 도서 정보 카드 */}
        {book && (
          <div className="flex gap-4 bg-white rounded-2xl p-4 mb-6 shadow-[0_4px_14px_rgba(58,78,68,0.04)]">
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-14 h-20 object-cover shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            />
            <div className="flex flex-col justify-center min-w-0">
              <p className="text-[14px] font-bold text-[#3A4E44] truncate mb-1 leading-tight">{book.title}</p>
              <p className="text-[12px] font-medium text-[#9AABA0] truncate">{book.authors?.join(', ')}</p>
            </div>
          </div>
        )}

        {/* 인원 설정 섹션 */}
        <div className="mb-6">
          <p className="text-[13px] font-bold text-[#3A4E44] mb-3 pl-0.5 tracking-tight">인원 설정</p>
          <div className="flex gap-2.5">
            {[2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMembers(n)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all shadow-[0_2px_6px_rgba(0,0,0,0.02)] ${
                  members === n
                    ? 'bg-[#B8D8C8] text-[#3A4E44] scale-[1.02]'
                    : 'bg-white text-[#9AABA0] hover:text-[#3A4E44]'
                }`}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        {/* 완독 목표일 설정 섹션 (💡 버그 수정 완벽 반영 공간) */}
        <div className="mb-8">
          <p className="text-[13px] font-bold text-[#3A4E44] mb-3 pl-0.5 tracking-tight">완독 목표일</p>
          
          {/* 달력 팝업 창이 뒤로 숨지 않도록 부모 컨테이너에 relative 및 z-index 세팅 제거/조정 */}
          <div className="relative shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-xl">
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
              placeholderText="날짜를 선택해주세요"
              className="w-full h-11 bg-white px-4 text-xs font-medium text-[#3A4E44] outline-none border border-transparent focus:border-[#B8D8C8] rounded-xl transition-colors placeholder-[#9AABA0] cursor-pointer"
              minDate={new Date()}
              
              /* 🔥 중요: 달력 레이어가 화면 최상단(z-50)에 위치하여 무조건 클릭되도록 강제 주입 */
              popperClassName="z-50"
              popperModifiers={[
                {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                  },
                },
              ]}
            />
          </div>
        </div>

      </div>

      {/* 책방 개설하기 하단 고정 버튼 */}
      <div className="w-full max-w-[390px] mx-auto mt-4">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full h-[52px] bg-[#3A4E44] active:bg-[#25332C] disabled:bg-[#E5E7EB] disabled:text-[#9AABA0] text-white rounded-2xl text-[14px] font-bold shadow-md shadow-[#3A4E44]/10 transition-colors"
        >
          {loading ? '교환독서 개설 중...' : '교환독서 개설 + 초대코드 생성'}
        </button>
      </div>

    </div>
  )
}

export default CreateRoom