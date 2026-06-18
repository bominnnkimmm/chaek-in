import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore'
import html2canvas from 'html2canvas'

function RecordDetail() {
  const { recordId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { roomId, passage, allPassages } = location.state || {}

  const [comments, setComments] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [pickerType, setPickerType] = useState(null)
  const [userColor, setUserColor] = useState('#EAC8D4')
  const [nicknames, setNicknames] = useState({})
  const [colors, setColors] = useState({})
  const [isHighlightMode, setIsHighlightMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [currentPassage, setCurrentPassage] = useState(passage)
  const [currentPassages, setCurrentPassages] = useState(allPassages || [])
  const canvasRef = useRef(null)
  const textRef = useRef(null)
  const touchStartRef = useRef(null)

  useEffect(() => {
    fetchComments()
    fetchRoomData()
    if (!allPassages) fetchAllPassages()
  }, [currentPassage])

  const fetchAllPassages = async () => {
    const snapshot = await getDocs(collection(db, 'rooms', roomId, 'passages'))
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (a.page || 0) - (b.page || 0))
    setCurrentPassages(list)
  }

  const fetchRoomData = async () => {
    if (!auth.currentUser || !roomId) return
    try {
      const roomSnap = await getDoc(doc(db, 'rooms', roomId))
      if (roomSnap.exists()) {
        const roomData = roomSnap.data()
        if (roomData.nicknames) setNicknames(roomData.nicknames)
        if (roomData.colors) setColors(roomData.colors)
        if (roomData.colors?.[auth.currentUser.uid]) {
          setUserColor(roomData.colors[auth.currentUser.uid])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchComments = async () => {
    if (!currentPassage?.id) return
    const snapshot = await getDocs(collection(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments'))
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    setComments(list)
  }

  const currentIndex = currentPassages.findIndex(p => p.id === currentPassage?.id)

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentPassage(currentPassages[currentIndex - 1])
      setComments([])
    }
  }

  const goToNext = () => {
    if (currentIndex < currentPassages.length - 1) {
      setCurrentPassage(currentPassages[currentIndex + 1])
      setComments([])
    }
  }

  const handleTextSelection = () => {
    if (!isHighlightMode) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !canvasRef.current || !textRef.current) return
    const range = selection.getRangeAt(0)
    if (!textRef.current.contains(range.commonAncestorContainer)) return
    const rects = range.getClientRects()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    if (rects.length > 0) {
      const firstRect = rects[0]
      const x = ((firstRect.left - canvasRect.left) / canvasRect.width) * 100
      const y = ((firstRect.top - canvasRect.top + firstRect.height - 12) / canvasRect.height) * 100
      addDoc(collection(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments'), {
        type: 'underline', text: '밑줄', x, y,
        width: firstRect.width, color: userColor,
        createdBy: auth.currentUser.uid, createdAt: new Date()
      }).then(() => { selection.removeAllRanges(); fetchComments() })
    }
  }

  const handleDeleteElement = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('이 흔적을 삭제할까요?')) return
    try {
      await deleteDoc(doc(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments', id))
      fetchComments()
    } catch (err) {
      alert('삭제 실패: ' + err.message)
    }
  }

  const handleDeletePassage = async () => {
    if (comments.length > 0) {
      alert('다른 멤버들이 남긴 흔적이 있어 삭제할 수 없어요!')
      return
    }
    if (!window.confirm('이 구절을 삭제하시겠습니까?')) return
    try {
      await deleteDoc(doc(db, 'rooms', roomId, 'passages', currentPassage.id))
      navigate(-1)
    } catch (err) {
      alert('삭제 실패: ' + err.message)
    }
  }

  const handleSaveElement = async (type, textValue = '') => {
    await addDoc(collection(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments'), {
      type, text: textValue,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      color: userColor,
      createdBy: auth.currentUser.uid, createdAt: new Date()
    })
    setShowPicker(false)
    fetchComments()
  }

  const handleSaveAsImage = async () => {
  if (!canvasRef.current) return
  try {
    const canvas = await html2canvas(canvasRef.current, {
      backgroundColor: '#FEFCF8',
      scale: 2,
      useCORS: true,
      ignoreElements: (element) => {
        return element.classList?.contains('group/item') || false
      },
      onclone: (clonedDoc) => {
        const elements = clonedDoc.querySelectorAll('*')
        elements.forEach(el => {
          const style = el.getAttribute('style')
          if (style && style.includes('oklab')) {
            el.setAttribute('style', style.replace(/oklab\([^)]+\)/g, 'transparent'))
          }
        })
      }
    })
    const link = document.createElement('a')
    link.download = `책크인_${currentPassage.page}페이지.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    alert('저장 실패: ' + err.message)
  }
}

  // 마우스 드래그
  const handleDragStart = (e, id) => {
    e.stopPropagation()
    setDraggedId(id)
    setIsDragging(true)
  }

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !draggedId || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100
    x = Math.max(0, Math.min(x, 95))
    y = Math.max(0, Math.min(y, 95))
    setComments(prev => prev.map(c => c.id === draggedId ? { ...c, x, y } : c))
  }

  const handleDragEnd = async (e, item) => {
    e.stopPropagation()
    if (!isDragging || draggedId !== item.id) return
    setIsDragging(false)
    setDraggedId(null)
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments', item.id), { x: item.x, y: item.y })
    } catch (err) {
      console.error(err)
    }
  }

  // 터치 드래그 (모바일)
  const handleTouchStart = (e, id) => {
    e.stopPropagation()
    touchStartRef.current = { id }
    setDraggedId(id)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || !draggedId || !canvasRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = canvasRef.current.getBoundingClientRect()
    let x = ((touch.clientX - rect.left) / rect.width) * 100
    let y = ((touch.clientY - rect.top) / rect.height) * 100
    x = Math.max(0, Math.min(x, 95))
    y = Math.max(0, Math.min(y, 95))
    setComments(prev => prev.map(c => c.id === draggedId ? { ...c, x, y } : c))
  }

  const handleTouchEnd = async (e, item) => {
    e.stopPropagation()
    if (!isDragging || draggedId !== item.id) return
    setIsDragging(false)
    setDraggedId(null)
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'passages', currentPassage.id, 'comments', item.id), { x: item.x, y: item.y })
    } catch (err) {
      console.error(err)
    }
  }

  if (!currentPassage) return <div className="p-5 text-[#9AABA0] text-sm">로딩 중...</div>

  const isPassageCreator = currentPassage.createdBy === auth.currentUser?.uid
  const canDeletePassage = isPassageCreator && comments.length === 0
  const prevPassage = currentIndex > 0 ? currentPassages[currentIndex - 1] : null

  const renderCanvas = (passageData, commentsData, canvasRefProp, isMain = true) => (
    <div
      ref={isMain ? canvasRef : null}
      onMouseMove={isMain ? handleCanvasMouseMove : undefined}
      onMouseUp={isMain ? () => setIsDragging(false) : undefined}
      onTouchMove={isMain ? handleTouchMove : undefined}
      className="relative bg-[#FEFCF8] border border-[#EBE7DF] px-8 pt-10 pb-12 select-none overflow-hidden flex flex-col justify-between"
      style={{
        height: '540px',
        backgroundImage: 'linear-gradient(#F3EFE6 1px, transparent 1px)',
        backgroundSize: '100% 28px',
        boxShadow: isMain ? '4px 0 12px rgba(0,0,0,0.06)' : '-4px 0 12px rgba(0,0,0,0.06)'
      }}
    >
      <div
        ref={isMain ? textRef : null}
        onMouseUp={isMain ? handleTextSelection : undefined}
        className={`relative z-10 text-[14px] text-[#2A3B31] leading-loose font-serif font-medium tracking-wide indent-2 select-text ${isHighlightMode ? 'cursor-crosshair' : 'cursor-text'}`}
      >
        "{passageData.text}"
      </div>

      {commentsData.map((c) => {
        const isMine = c.createdBy === auth.currentUser?.uid
        const commentColor = colors[c.createdBy] || c.color || userColor
        return (
          <div
            key={c.id}
            onMouseDown={(e) => isMain && isMine && c.type !== 'underline' && handleDragStart(e, c.id)}
            onMouseUp={(e) => isMain && isMine && c.type !== 'underline' && handleDragEnd(e, c)}
            onTouchStart={(e) => isMain && isMine && c.type !== 'underline' && handleTouchStart(e, c.id)}
            onTouchEnd={(e) => isMain && isMine && c.type !== 'underline' && handleTouchEnd(e, c)}
            className={`absolute group/item ${isMain && isMine && c.type !== 'underline' ? 'cursor-move touch-none' : ''}`}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: c.type === 'underline' ? 'none' : 'translate(-50%, -50%)',
              zIndex: c.type === 'underline' ? 5 : 30
            }}
          >
            {c.type === 'text' && (
              <div className="relative flex items-center">
                <span className="text-[10px] font-bold px-1.5 py-0.5 shadow-sm whitespace-nowrap rounded-sm bg-white/90"
                  style={{ color: commentColor }}>
                  {c.text}
                </span>
                {isMain && isMine && (
                  <button onClick={(e) => handleDeleteElement(e, c.id)}
                    className="absolute -top-3.5 -right-3.5 w-4 h-4 bg-[#D85A30] text-white text-[9px] rounded-full hidden group-hover/item:flex items-center justify-center font-black">✕</button>
                )}
              </div>
            )}
            {c.type === 'postit' && (
              <div className="p-2 shadow-md text-[9px] font-bold w-24 min-h-[44px] leading-relaxed rotate-[-1deg] relative break-all whitespace-pre-wrap"
                style={{ backgroundColor: commentColor + '99', color: '#2A3B31', borderTop: '3px solid rgba(0,0,0,0.06)' }}>
                {c.text}
                {isMain && isMine && (
                  <button onClick={(e) => handleDeleteElement(e, c.id)}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#D85A30] text-white text-[9px] rounded-full hidden group-hover/item:flex items-center justify-center font-black z-50">✕</button>
                )}
              </div>
            )}
            {c.type === 'underline' && (
              <div className="relative group/line">
                <div className="h-3.5 opacity-40 origin-left"
                  style={{ backgroundColor: commentColor, width: `${c.width}px` }} />
                {isMain && isMine && (
                  <button onClick={(e) => handleDeleteElement(e, c.id)}
                    className="absolute -top-4 -right-2 w-3.5 h-3.5 bg-[#D85A30]/90 text-white text-[8px] rounded-full hidden group-hover/line:flex items-center justify-center font-bold z-50">✕</button>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="w-full text-right mt-auto pr-1 select-none">
        <span className="font-serif text-[11px] font-medium text-black">{passageData.page}</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4FAF7] flex flex-col pb-8 relative">

      {/* 헤더 */}
      <div className="flex items-center justify-between h-14 px-5 bg-white border-b border-[#D4EAE0] w-full">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-[#9AABA0] text-lg font-bold p-1">←</button>
          <span className="text-xs font-bold text-[#3A4E44] ml-3">구절 상세 보기</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAsImage}
            className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 border bg-white text-[#3A4E44] border-[#D4EAE0]">
            <span>📷</span> 저장
          </button>
          <button
            onClick={() => setIsHighlightMode(!isHighlightMode)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 border ${isHighlightMode ? 'bg-[#3A4E44] text-white border-[#3A4E44]' : 'bg-white text-[#5A6E61] border-[#D4EAE0]'}`}>
            <span>✒️</span> 밑줄 {isHighlightMode ? 'ON' : 'OFF'}
          </button>
          {canDeletePassage && (
            <button onClick={handleDeletePassage}
              className="text-xs font-bold text-[#D85A30] bg-red-50 px-2.5 py-1.5 rounded-xl">
              구절 삭제
            </button>
          )}
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="lg:hidden w-full max-w-[390px] mx-auto flex-1 flex flex-col">
        <div className="mx-4 my-5">
          {renderCanvas(currentPassage, comments, canvasRef, true)}
        </div>
        <div className="flex justify-between px-4 mb-4">
          <button onClick={goToPrev} disabled={currentIndex <= 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border ${currentIndex <= 0 ? 'text-[#D4EAE0] border-[#D4EAE0]' : 'text-[#3A4E44] border-[#D4EAE0] bg-white'}`}>
            ‹ 이전 구절
          </button>
          <span className="text-xs text-[#9AABA0] self-center">{currentIndex + 1} / {currentPassages.length}</span>
          <button onClick={goToNext} disabled={currentIndex >= currentPassages.length - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border ${currentIndex >= currentPassages.length - 1 ? 'text-[#D4EAE0] border-[#D4EAE0]' : 'text-[#3A4E44] border-[#D4EAE0] bg-white'}`}>
            다음 구절 ›
          </button>
        </div>
      </div>

      {/* 데스크탑 레이아웃 */}
      <div className="hidden lg:flex flex-1 items-start justify-center px-8 py-6 gap-0">
        <button onClick={goToPrev} disabled={currentIndex <= 0}
          className={`self-center mr-4 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border ${currentIndex <= 0 ? 'text-[#D4EAE0] border-[#D4EAE0]' : 'text-[#3A4E44] border-[#D4EAE0] bg-white hover:bg-[#F4FAF7]'}`}>
          ‹
        </button>
        <div className="flex-1 max-w-[480px]">
          {prevPassage ? (
            <div onClick={goToPrev} className="cursor-pointer opacity-60 hover:opacity-80 transition-opacity">
              {renderCanvas(prevPassage, [], null, false)}
            </div>
          ) : (
            <div className="h-[540px] bg-[#FEFCF8] border border-[#EBE7DF] flex items-center justify-center">
              <p className="text-xs text-[#9AABA0]">첫 번째 구절이에요</p>
            </div>
          )}
        </div>
        <div className="w-px bg-[#D4EAE0] self-stretch mx-0" style={{ minHeight: '540px' }}></div>
        <div className="flex-1 max-w-[480px]">
          {renderCanvas(currentPassage, comments, canvasRef, true)}
        </div>
        <button onClick={goToNext} disabled={currentIndex >= currentPassages.length - 1}
          className={`self-center ml-4 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border ${currentIndex >= currentPassages.length - 1 ? 'text-[#D4EAE0] border-[#D4EAE0]' : 'text-[#3A4E44] border-[#D4EAE0] bg-white hover:bg-[#F4FAF7]'}`}>
          ›
        </button>
      </div>

      <div className="hidden lg:flex justify-center pb-2">
        <span className="text-xs text-[#9AABA0]">{currentIndex + 1} / {currentPassages.length}</span>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => { setShowPicker(true); setPickerType(null); setCommentText('') }}
        className="fixed bottom-8 right-6 w-12 h-12 bg-[#3A4E44] text-white rounded-full flex items-center justify-center text-xl shadow-lg z-40">
        ＋
      </button>

      {/* 모달 */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl p-6">
            {!pickerType && (
              <>
                <p className="text-xs font-black text-[#3A4E44] mb-4">어떤 흔적을 남길까요?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => setPickerType('text')}
                    className="h-14 bg-[#F4FAF7] rounded-xl text-[11px] font-bold text-[#3A4E44] flex flex-col items-center justify-center gap-1">
                    <span>💬</span>한줄 텍스트
                  </button>
                  <button onClick={() => setPickerType('postit')}
                    className="h-14 bg-[#F4FAF7] rounded-xl text-[11px] font-bold text-[#3A4E44] flex flex-col items-center justify-center gap-1">
                    <span>📄</span>포스트잇 메모
                  </button>
                </div>
                <button onClick={() => setShowPicker(false)}
                  className="w-full mt-4 h-11 text-xs font-bold text-[#9AABA0]">닫기</button>
              </>
            )}
            {(pickerType === 'text' || pickerType === 'postit') && (
              <div className="flex flex-col">
                <p className="text-xs font-black text-[#3A4E44] mb-3">
                  {pickerType === 'text' ? '💬 한줄 텍스트' : '📄 포스트잇 메모'}
                </p>
                <textarea
                  placeholder="감상을 적어보세요"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full h-24 border border-[#D4EAE0] rounded-xl px-4 py-3 text-xs bg-white outline-none mb-4 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setPickerType(null)}
                    className="flex-1 h-12 bg-[#F4FAF7] text-[#9AABA0] font-bold text-xs rounded-xl">이전</button>
                  <button onClick={() => handleSaveElement(pickerType, commentText)}
                    className="flex-1 h-12 bg-[#3A4E44] text-white font-bold text-xs rounded-xl">부착하기</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default RecordDetail