import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CallDetail from './pages/CallDetail';
import VoiceTest from './pages/VoiceTest';
 
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calls/:callId" element={<CallDetail />} />
        <Route path="/voice-test" element={<VoiceTest />} />
      </Routes>
    </Layout>
  );
}

export default App;
