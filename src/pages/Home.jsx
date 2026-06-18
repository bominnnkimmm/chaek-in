import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks } from '../api/kakao'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import Footer from '../components/Footer'

function Home() {
  const [showModal, setShowModal] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [results, setResults] = useState([])
  const [rooms, setRooms] = useState([])
  const [completedRooms, setCompletedRooms] = useState([])
  const [tab, setTab] = useState('create')
  const [inviteCode, setInviteCode] = useState('')
  const [libraryView, setLibraryView] = useState('cover')
  const [userEmoji, setUserEmoji] = useState('📚')
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms()
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    if (!auth.currentUser) return
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid)
      const docSnap = await getDoc(userDocRef)
      if (docSnap.exists() && docSnap.data().photoURL) {
        setUserEmoji(docSnap.data().photoURL)
      }
    } catch (error) {
      console.error("유저 프로필 로드 실패:", error)
    }
  }

  const getDeterministicNum = (str, seed) => {
    let hash = seed
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash)
  }

  const fetchRooms = async () => {
    if (!auth.currentUser) return
    const q = query(
      collection(db, 'rooms'),
      where('members', 'array-contains', auth.currentUser.uid)
    )
    const snapshot = await getDocs(q)
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    const completed = all.filter(r => r.isCompleted).map((room) => {
      const spineColors = ['#3A4E44', '#B8D8C8', '#EAC8D4']
      const colorIndex = getDeterministicNum(room.id, 1) % spineColors.length
      const heightIndex = getDeterministicNum(room.id, 2) % 4
      const widthIndex = getDeterministicNum(room.id, 3) % 3

      return {
        ...room,
        spineColor: spineColors[colorIndex],
        textColor: spineColors[colorIndex] === '#3A4E44' ? '#FFFFFF' : '#3A4E44',
        spineHeight: `${95 + heightIndex * 8}px`,
        spineWidth: `${26 + widthIndex * 4}px`
      }
    })

    setRooms(all.filter(r => !r.isCompleted))
    setCompletedRooms(completed)
  }

  const handleSearch = async () => {
    if (!queryText) return
    const books = await searchBooks(queryText)
    setResults(books)
  }

  const handleJoin = async () => {
    if (!inviteCode) return
    const q = query(collection(db, 'rooms'), where('inviteCode', '==', inviteCode))
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      alert('존재하지 않는 초대코드예요!')
      return
    }
    const roomDoc = snapshot.docs[0]
    setShowModal(false)
    navigate(`/join-room/${roomDoc.id}`)
  }

  return (
    <div className="min-h-screen bg-[#F4FAF7] font-sans antialiased flex flex-col justify-between pb-24 md:pb-12">
      
      {/* 1. 상단 내비게이션 바 (반응형 대응: 중앙 정렬 및 최대 너비 지정) */}
      <div className="sticky top-0 z-40 w-full bg-white border-b border-[#D4EAE0] shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-5 h-14">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-7 h-7 bg-[#B8D8C8] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-[#3A4E44] tracking-tight">책크인</h1>
          </div>
          
          <div className="flex items-center gap-3.5 text-[#3A4E44]">
            <button 
              onClick={() => { setTab('create'); setShowModal(true); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F4FAF7] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button 
              onClick={() => navigate('/mypage')}
              className="w-8 h-8 rounded-full bg-[#EAF5F0] border border-[#B8D8C8] flex items-center justify-center text-sm shadow-xs transition-transform overflow-hidden select-none"
            >
              {userEmoji}
            </button>
          </div>
        </div>
      </div>

      {/* 💻 메인 콘텐츠 영역 (모바일 `1컬럼 세로` ➡️ 데스크톱 `lg:grid-cols-12 2분할 컬럼` 반응형 트랜지션) */}
      <div className="w-full max-w-6xl mx-auto px-5 pt-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: 진행 중인 교환독서 목록 (전체 12칸 중 PC에서는 5칸 차지) */}
        <div className="lg:col-span-5">
          <p className="text-[13px] font-bold text-[#3A4E44] mb-3.5 pl-0.5 tracking-tight">진행 중인 교환독서</p>
          {rooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <p className="text-sm font-medium text-[#9AABA0] leading-relaxed">
                아직 참여 중인 책방이 없어요.<br/>친구들과 함께 독서를 시작해보세요! 📚
              </p>
            </div>
          ) : (
            // 모바일 1열 ➡️ 태블릿/PC 해상도에서 공간에 따라 그리드로 분할 배치 가능
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-[0_4px_14px_rgba(58,78,68,0.04)] hover:shadow-[0_6px_20px_rgba(58,78,68,0.08)] transition-all cursor-pointer group"
                >
                  <img
                    src={room.bookThumbnail}
                    alt={room.bookTitle}
                    className="w-14 h-20 object-cover rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex-shrink-0"
                  />
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <p className="text-[14px] font-bold text-[#3A4E44] truncate group-hover:text-[#B8D8C8] transition-colors">{room.bookTitle}</p>
                    <p className="text-[12px] font-medium text-[#9AABA0] truncate mb-2">{room.bookAuthor}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] font-semibold text-[#9AABA0]">초대코드: <span className="text-[#B8D8C8]">{room.inviteCode}</span></p>
                      {room.dueDate && (
                        <span className="text-[11px] font-medium text-[#EAC8D4] whitespace-nowrap">
                          🎯 {typeof room.dueDate === 'string' ? room.dueDate : room.dueDate?.toDate?.()?.toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: 나의 서재 보관 책장 (전체 12칸 중 PC에서는 7칸 차지) */}
        <div className="lg:col-span-7">
          <div className="flex justify-between items-start mb-4 pl-0.5">
            <div> 
              <p className="text-[13px] font-bold text-[#3A4E44] tracking-tight">나의 서재</p>
            </div>
            
            <div className="flex items-center bg-[#E5EAE7] p-0.5 rounded-lg text-[10px] font-bold text-[#6B7280]">
              <button 
                onClick={() => setLibraryView('cover')}
                className="px-2 py-1 rounded-md transition-all"
                style={libraryView === 'cover' ? { backgroundColor: 'white', color: '#3A4E44' } : {}}
              >
                표지형
              </button>
              <button 
                onClick={() => setLibraryView('spine')}
                className="px-2 py-1 rounded-md transition-all"
                style={libraryView === 'spine' ? { backgroundColor: 'white', color: '#3A4E44' } : {}}
              >
                책장형
              </button>
            </div>
          </div>
          
          {/* PC 환경에 맞춰 최소 높이(min-h)를 더 넉넉하고 웅장하게 확장 */}
          <div className="relative bg-gradient-to-b from-white to-[#F1F3F5] pt-12 pb-4 px-6 border border-[#E5E7EB] rounded-2xl min-h-[220px] flex items-end shadow-inner overflow-hidden">
            
            {completedRooms.length === 0 ? (
              <div className="w-full text-center pb-8 z-10">
                <p className="text-[11px] text-[#9AABA0]">아직 완독 보관된 책이 없습니다.</p>
              </div>
            ) : libraryView === 'cover' ? (
              <div className="flex items-end gap-4 w-full overflow-x-auto pb-2 scrollbar-hide relative z-10 animate-fade-in flex-wrap sm:flex-nowrap">
                {completedRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="relative flex-shrink-0 group cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 mb-[4px]"
                  >
                    <img 
                      src={room.bookThumbnail} 
                      alt={room.bookTitle} 
                      className="w-[72px] h-[104px] md:w-[80px] md:h-[116px] object-cover shadow-[4px_6px_12px_rgba(0,0,0,0.15)] border-0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-0 border-b-4 border-[#D4EAE0] w-full pb-[4px] relative z-10 mb-[2px] overflow-x-auto scrollbar-hide animate-fade-in">
                {completedRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="relative flex-shrink-0 group cursor-pointer origin-bottom transition-transform duration-200 hover:-translate-y-1.5 flex justify-center items-center overflow-hidden"
                    style={{ 
                      width: room.spineWidth, 
                      height: `calc(${room.spineHeight} * 1.15)`, // 데스크톱 스케일에 맞춰 서재 세로축 살짝 보정
                      backgroundColor: room.spineColor,
                      boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.15), 1px 0 2px rgba(0,0,0,0.1)'
                    }}
                    title={room.bookTitle}
                  >
                    <div 
                      className="absolute w-[100px] h-[20px] flex items-center justify-center pointer-events-none"
                      style={{ transform: 'rotate(90deg)', transformOrigin: 'center center' }}
                    >
                      <p className="text-[9px] font-bold tracking-tight text-center whitespace-nowrap uppercase truncate select-none w-full px-1" style={{ color: room.textColor }}>
                        {room.bookTitle}
                      </p>
                    </div>
                    <div className="absolute top-1 left-0 right-0 h-[1px] opacity-20 bg-white"></div>
                    <div className="absolute bottom-1.5 left-0 right-0 h-[2px] opacity-20 bg-black"></div>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-1 left-1 right-1 h-2 bg-[#E9EBEF] border-b border-r border-[#D2D5DB] rounded-sm shadow-md"></div>
          </div>
        </div>
      </div>

      {/* 모달 창 디자인 (PC 화면에서는 정중앙 레이아웃으로 변경될 수 있도록 반응형 마스크 튜닝) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 animate-fade-in px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-[#3A4E44]">새 교환독서</h2>
              <button onClick={() => setShowModal(false)} className="text-[#9AABA0] hover:text-[#3A4E44] text-lg font-bold p-1">✕</button>
            </div>
            
            <div className="flex gap-2 mb-5 bg-[#F4FAF7] p-1 rounded-xl">
              <button
                onClick={() => setTab('create')}
                className="flex-1 h-10 rounded-xl text-xs font-bold transition-all text-[#9AABA0] hover:text-[#3A4E44]"
                style={tab === 'create' ? { backgroundColor: '#B8D8C8', color: '#3A4E44' } : {}}
              >
                교환독서 시작하기
              </button>
              <button
                onClick={() => setTab('join')}
                className="flex-1 h-10 rounded-xl text-xs font-bold transition-all text-[#9AABA0] hover:text-[#3A4E44]"
                style={tab === 'join' ? { backgroundColor: '#B8D8C8', color: '#3A4E44' } : {}}
              >
                교환독서 참여하기
              </button>
            </div>

            {tab === 'create' && (
              <>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="책 제목을 검색해 주세요"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="flex-1 h-11 border border-[#D4EAE0] rounded-xl px-4 text-xs outline-none focus:border-[#B8D8C8] bg-white text-[#3A4E44] placeholder-[#9AABA0]"
                  />
                  <button onClick={handleSearch} className="px-5 h-11 bg-[#3A4E44] active:bg-[#25332C] text-white rounded-xl text-xs font-bold transition-colors">
                    검색
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {results.map((book, i) => (
                    <div
                      key={i}
                      onClick={() => navigate('/create-room', { state: { book } })}
                      className="flex gap-3 p-3 border border-[#D4EAE0] rounded-xl bg-white hover:border-[#B8D8C8] cursor-pointer"
                    >
                      <img src={book.thumbnail} alt={book.title} className="w-10 h-14 object-cover rounded-lg shadow-xs" />
                      <div className="flex flex-col justify-center min-w-0">
                        <p className="text-xs font-bold text-[#3A4E44] truncate mb-0.5">{book.title}</p>
                        <p className="text-[11px] font-medium text-[#9AABA0] truncate">{book.authors?.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'join' && (
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="초대코드 입력 (6자리)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full h-11 border border-[#D4EAE0] rounded-xl px-4 text-xs outline-none focus:border-[#B8D8C8] mb-4 bg-white tracking-wider text-center font-bold text-[#3A4E44] placeholder-[#9AABA0]"
                />
                <button onClick={handleJoin} className="w-full h-11 bg-[#3A4E44] active:bg-[#25332C] text-white rounded-xl text-xs font-bold transition-colors">
                  입장하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 모바일 GNB 네비게이션: 데스크톱(`md:`) 환경에서는 완전히 숨김 숨바꼭질 처리 */}
      <div className="block md:hidden">
        <Footer />
      </div>
    </div>
  )
}

export default Home