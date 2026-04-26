import { OSProvider } from './context/OSContext'
import Desktop from './components/Desktop'
import './styles/apps.css'

function App() {
  return (
    <OSProvider>
      <Desktop />
    </OSProvider>
  )
}

export default App
