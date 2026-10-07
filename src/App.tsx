import { useRoute, useScrollAfterRoute } from './router';
import { useParallax } from './hooks';
import { Nav, Footer } from './components/Chrome';
import Home from './pages/Home';
import Family from './pages/Family';
import Memories from './pages/Memories';
import Albums from './pages/Albums';
import { UIProvider } from './ui';

export default function App() {
  const path = useRoute();
  useScrollAfterRoute(path);
  useParallax(path);
  const Page = path === '/otbasy' ? Family : path === '/estelikter' ? Memories : path === '/albomdar' ? Albums : Home;
  return (
    <UIProvider>
      <Nav path={path} />
      <main key={path} className="page"><Page /></main>
      <Footer />
      <div className="curtain" aria-hidden><span /></div>
    </UIProvider>
  );
}
