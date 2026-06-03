import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import RoomHome from './pages/RoomHome'
import RecordDetail from './pages/RecordDetail'
import PrivateRoute from './PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/room/:roomId" element={<PrivateRoute><RoomHome /></PrivateRoute>} />
        <Route path="/record/:recordId" element={<PrivateRoute><RecordDetail /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App