import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ActiveQuest from './pages/ActiveQuest';
import VibePicker from './pages/VibePicker';
import QuestLog from './pages/QuestLog';
import Recap from './pages/Recap';
import Nearby from './pages/Nearby';

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'vibe', element: <VibePicker /> },
      { path: 'quest', element: <ActiveQuest /> },
      { path: 'log', element: <QuestLog /> },
      { path: 'recap', element: <Recap /> },
      { path: 'nearby', element: <Nearby /> },
    ],
  },
]);

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
