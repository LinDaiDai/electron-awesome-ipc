import { createRoot } from 'react-dom/client';
import App from './App';
import { attachIpc } from '../../model';

attachIpc('windowOne');
const container = document.getElementById('app');
const root = createRoot(container as HTMLElement);
root.render(<App />);
