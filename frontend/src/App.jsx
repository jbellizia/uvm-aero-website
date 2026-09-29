import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Car from './pages/Car.jsx';
import Team from './pages/Team.jsx';
import Sponsors from './pages/Sponsors.jsx';
import Contact from './pages/Contact.jsx';
import Support from './pages/Support.jsx';

export default function App() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car" element={<Car />} />
          <Route path="/team" element={<Team />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
