import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import RoomHome from './pages/RoomHome'
import RecordDetail from './pages/RecordDetail'
import CreateRoom from './pages/CreateRoom'
import PrivateRoute from './PrivateRoute'
import AddPassage from './pages/AddPassage'
import Signup from './pages/Signup'
import SetProfile from './pages/SetProfile'
import JoinRoom from './pages/JoinRoom'
import MyPage from './pages/MyPage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/create-room" element={<PrivateRoute><CreateRoom /></PrivateRoute>} />
        <Route path="/room/:roomId" element={<PrivateRoute><RoomHome /></PrivateRoute>} />
        <Route path="/record/:recordId" element={<PrivateRoute><RecordDetail /></PrivateRoute>} />
        <Route path="/room/:roomId/add-passage" element={<PrivateRoute><AddPassage /></PrivateRoute>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/set-profile" element={<SetProfile />} />
        <Route path="/join-room/:roomId" element={<PrivateRoute><JoinRoom /></PrivateRoute>} />
        <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App