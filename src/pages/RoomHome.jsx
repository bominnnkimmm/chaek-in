import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { doc, getDoc, collection, getDocs, onSnapshot, updateDoc } from 'firebase/firestore'
import Footer from '../components/Footer' 

function RoomHome() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [passages, setPassages] = useState([])
  const [memberProfiles, setMemberProfiles] = useState([])

  useEffect(() => {
    fetchRoom()
    fetchPassages()

    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() })
        fetchMemberProfiles(docSnap.data().members || [])
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchRoom = async () => {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId))
    if (roomDoc.exists()) {
      const roomData = roomDoc.data()
      setRoom({ id: roomDoc.id, ...roomData })
      fetchMemberProfiles(roomData.members || [])
    }
  }

  const fetchMemberProfiles = async (memberUids) => {
    try {
      const profiles = await Promise.all(
        memberUids.map(async (uid) => {
          const userSnap = await getDoc(doc(db, 'users', uid))
          return {
            uid,
            emoji: userSnap.exists() && userSnap.data().photoURL ? userSnap.data().photoURL : '📚'
          }
        })
      )
      setMemberProfiles(profiles)
    } catch (e) {
      console.error("멤버 이모지 로드 실패:", e)
    }
  }

  const fetchPassages = async () => {
    const snapshot = await getDocs(collection(db, 'rooms', roomId, 'passages'))
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    setPassages(list)
  }

  const handleBookmark = async () => {
    const page = prompt('현재 읽은 페이지를 입력해주세요!')
    if (!page || isNaN(page)) return
    const uid = auth.currentUser.uid
    await updateDoc(doc(db, 'rooms', roomId), {
      [`bookmarks.${uid}`]: Number(page)
    })
  }

  const handleCopyCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    alert('초대코드가 클립보드에 복사되었어요! 📋')
  }

  const handleMoveToLibrary = async () => {
    const message = `완독 서재로 보관할까요? 보관 후에는 새 구절을 등록할 수 없어요.`
    if (!window.confirm(message)) return
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        isCompleted: true,
        completedAt: new Date()
      })
      alert('완독을 축하해요! 🎉')
      navigate('/home')
    } catch (error) {
      alert('오류: ' + error.message)
    }
  }

  const getHighResThumbnail = (url) => {
    if (!url) return ''
    if (url.includes('fname=')) {
      const rawUrl = url.split('fname=')[1]
      return decodeURIComponent(rawUrl)
    }
    return url
  }

  if (!room) return <div className="p-5 text-[#9AABA0] text-sm">로딩 중...</div>

  const bookmarks = room.bookmarks || {}
  const colors = room.colors || {}
  const nicknames = room.nicknames || {}
  const currentMembersCount = room.members?.length || 0
  const maxMembersCount = room.maxMembers || 0
  const formattedDueDate = room.dueDate
    ? (typeof room.dueDate === 'string' ? room.dueDate : room.dueDate?.toDate?.()?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }))
    : '설정 없음'

  return (
    <div className="min-h-screen bg-[#F4FAF7]">
      {/* 데스크탑 반응형 wrapper */}
      <div className="w-full max-w-[480px] mx-auto px-5 pt-4 pb-24">

        {/* 1. 앱바 */}
        <div className="flex justify-between items-center h-12 mb-2">
          <button onClick={() => navigate('/home')} className="text-[#9AABA0] text-lg font-bold p-1">←</button>
          <h1 className="text-sm font-bold text-[#3A4E44] truncate max-w-[240px]">{room.bookTitle}</h1>
          <div className="w-8"></div>
        </div>

        {/* 2. 정보 패널 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <div className="flex flex-col gap-2">
            
            {/* 참여 인원 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3A4E44]">
                <span>👥</span>
                <span>참여 인원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#9AABA0]">
                  <span className="text-[#3A4E44]">{currentMembersCount}</span> / {maxMembersCount}명
                </span>
                {/* 참여자 원형 프로필 */}
                <div className="flex items-center">
                  {memberProfiles.map((member, i) => (
                    <div
                      key={member.uid}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-white border-2 border-white"
                      style={{
                        boxShadow: `0 0 0 2px ${colors[member.uid] || '#B8D8C8'}`,
                        marginLeft: i > 0 ? '-6px' : '0',
                        zIndex: memberProfiles.length - i
                      }}
                      title={nicknames[member.uid] || '참여자'}
                    >
                      {member.emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#F4FAF7] w-full"></div>

            {/* 완독 목표일 */}
            <div className="flex items-center justify-between text-xs font-bold text-[#3A4E44]">
              <div className="flex items-center gap-1.5">
                <span>🎯</span>
                <span>완독 목표일</span>
              </div>
              <span className="text-[#9AABA0] font-medium">{formattedDueDate}</span>
            </div>
          </div>
        </div>

        {/* 3. 실시간 독서 현황 */}
        {Object.keys(bookmarks).length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            {Object.entries(bookmarks).map(([uid, page]) => (
              <div key={uid} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D4EAE0]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[uid] || '#B8D8C8' }} />
                <span className="text-[10px] font-bold text-[#3A4E44] whitespace-nowrap">
                  {nicknames[uid] || '독서가'}: <span className="text-[#9AABA0]">p.{page}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 4. 책 표지 */}
        <div className="flex justify-center my-8 pt-4">
          <div className="relative inline-block">
            {/* 북마크 탭 */}
            <div className="absolute -top-11 left-0 flex justify-start gap-2.5 z-20">
              {room.members?.map((uid) => (
                <div
                  key={uid}
                  className="cursor-pointer hover:-translate-y-1 transition-transform"
                  onClick={() => uid === auth.currentUser.uid && handleBookmark()}>
                  <div
                    className="w-[22px] h-14 flex items-end justify-center pb-2.5"
                    style={{
                      backgroundColor: colors[uid] || '#B8D8C8',
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'
                    }}>
                    <p className="text-white text-[9px] font-black leading-none">{bookmarks[uid] || '?'}</p>
                  </div>
                </div>
              ))}
            </div>

            <img
              src={getHighResThumbnail(room.bookThumbnail)}
              alt={room.bookTitle}
              className="w-44 h-64 object-cover shadow-xl relative z-10"
              onError={(e) => { e.target.src = room.bookThumbnail }}
            />

            {/* 우측 인덱스 탭 */}
            <div className="absolute -right-3.5 top-8 flex flex-col gap-1.5 z-20">
              {passages.map((p, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/record/${p.id}`, { state: { roomId, passage: p } })}
                  className="w-3.5 h-6 rounded-r-md cursor-pointer"
                  style={{ backgroundColor: p.color || '#B8D8C8' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 5. 액션 버튼 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleBookmark}
            className="flex-1 h-14 bg-white text-[#3A4E44] rounded-2xl flex flex-col items-center justify-center gap-0.5 font-bold text-xs">
            <span className="text-base">🔖</span>
            현재 페이지 책갈피
          </button>
          <button
            onClick={() => navigate(`/room/${roomId}/add-passage`)}
            className="flex-1 h-14 bg-white text-[#3A4E44] rounded-2xl flex flex-col items-center justify-center gap-0.5 font-bold text-xs">
            <span className="text-base">✍️</span>
            구절 기록하기
          </button>
        </div>

        {/* 6. 구절 목록 */}
        <div className="mb-6">
          <p className="text-sm font-bold text-[#3A4E44] mb-3">구절 목록</p>
          {passages.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-xs text-[#9AABA0]">아직 기록된 구절이 없어요 ✨</p>
            </div>
          ) : (
            passages.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/record/${p.id}`, { state: { roomId, passage: p } })}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 mb-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#B8D8C8' }} />
                <p className="flex-1 text-xs font-semibold text-[#3A4E44] truncate">{p.text}</p>
                <span className="text-[10px] font-bold text-[#9AABA0] bg-[#F4FAF7] px-2 py-0.5 rounded-md">p.{p.page}</span>
              </div>
            ))
          )}
        </div>

        {/* 7. 초대코드 */}
        <div
          onClick={() => handleCopyCode(room.inviteCode)}
          className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3A4E44]">🔗 초대코드</span>
            <span className="text-sm font-black text-[#B8D8C8] tracking-widest uppercase">{room.inviteCode}</span>
          </div>
          <span className="text-[10px] font-bold text-[#9AABA0]">클릭하여 복사</span>
        </div>

        {/* 8. 서재 보관 */}
        <button
          onClick={handleMoveToLibrary}
          className="w-full h-12 bg-white text-[#3A4E44] border border-[#D4EAE0] rounded-2xl text-xs font-bold mb-6 flex items-center justify-center gap-1.5">
          <span>📥</span> 나의 서재로 보관하기
        </button>

      </div>
      <Footer />
    </div>
  )
}

export default RoomHome