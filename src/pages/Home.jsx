import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F4FAF7]">
      
      {/* 앱바 */}
      <div className="flex justify-between items-center px-5 py-4 bg-white border-b border-[#D4EAE0]">
        <h1 className="text-lg font-medium text-[#3A4E44]">책크인</h1>
        <button className="w-8 h-8 bg-[#B8D8C8] rounded-lg text-[#3A4E44] font-medium text-xl">
          +
        </button>
      </div>

      {/* 진행 중인 책방 */}
      <div className="px-5 pt-5">
        <p className="text-sm font-medium text-[#3A4E44] mb-3">진행 중인 책방</p>
        
        {/* 책방 카드 */}
        <div className="bg-white border border-[#D4EAE0] rounded-xl p-3 flex gap-3 mb-3">
          <div className="w-12 h-16 bg-[#D4EAE0] rounded flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#3A4E44]">채식주의자</p>
            <div className="flex gap-1 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D85A30]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#7F77DD]"></div>
            </div>
            <div className="mt-2 h-1 bg-[#E8F4F0] rounded-full">
              <div className="h-1 w-2/3 bg-[#B8D8C8] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 빈 상태 */}
        <p className="text-center text-sm text-[#9AABA0] mt-10">
          아직 참여 중인 책방이 없어요<br/>
          첫 책방을 열어보세요 📚
        </p>
      </div>

    </div>
  )
}

export default Home