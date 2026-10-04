import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// No StrictMode: its double effect run would mint two single-use editor sessions.
createRoot(document.getElementById('root')!).render(<App />)
