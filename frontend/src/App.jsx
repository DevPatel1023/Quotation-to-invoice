  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import Dashboard from "./pages/Dashboard";  
  import Signin from "./pages/Signin";
  import Signup from "./pages/Signup";
  import Landing from "./pages/Landing";
  import Quotation from "./pages/Quotation";
  import Customers from "./pages/Customers";
  import { ThemeProvider } from "./hooks/ThemeContext";
  import Invoice from "./pages/Invoice";
import UserProfile from "./pages/UserProfile";

  function App() {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[#ffffff] text-[#1e2022] dark:bg-[#25282a] dark:text-white transition-colors duration-300">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quotation" element={<Quotation />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/userprofile" element={<UserProfile />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    );
  }

  export default App;
