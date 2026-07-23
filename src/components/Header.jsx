import { Link } from "react-router-dom"
import logo from "../assets/logos/logo13.png"
import { Menu, X } from "lucide-react"
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const  Header = () => { 
  const [menuOpen, setMenuOpen] = useState(false);
  const {isAuthenticated,user}=useAuth()

  return   <header className="sticky top-0 z-50 bg-violet-50/80 backdrop-blur-md border-b border-violet-950/10">
                <div className="max-w-full mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex  h-full gap-3 border-b border-gray-100 px-6">
                        <div className="flex h-full items-start justify-start overflow-hidden rounded-xl ">
                            <img src={logo} alt="InfluenceHub" className="h-full min-w-full object-cover " />
                        </div>
                        {/* <h2 className="text-lg font-bold tracking-tight text-primary">influenceHub</h2> */}
                    </div>

                    <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
                        <Link to="/" className="text-primary font-semibold border-b-2 border-amber-400 pb-1">
                            Home
                        </Link>
                        {/* <Link to="/#deals" className="hover:text-primary transition">
                            Deals
                        </Link>
                        <Link to="/#contact" className="hover:text-primary transition">
                            Contact
                        </Link> */}
                    </nav>

                    <div className="flex items-center gap-5">
                       {!user?<>
                        <Link to="/auth/login" className="hidden md:inline text-sm font-semibold hover:text-violet-800 transition">
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="hidden sm:inline-flex items-center rounded-full bg-amber-400 text-violet-950 font-semibold text-sm px-6 py-3 shadow-md hover:bg-amber-500 hover:-translate-y-0.5 transition"
                        >
                            Register for Free
                        </Link>
                       
                       </>:<Link
                            to="/dashboard"
                            className="hidden sm:inline-flex items-center rounded-full bg-amber-400 text-violet-950 font-semibold text-sm px-6 py-3 shadow-md hover:bg-amber-500 hover:-translate-y-0.5 transition"
                        >
                            Dashboard
                        </Link>}
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-violet-950/5"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="md:hidden flex flex-col gap-1 px-5 pb-6 border-b border-violet-950/10 bg-violet-50">
                        <a href="#" className="py-3 border-b border-violet-950/5 font-medium">
                            Home
                        </a>
                        <a href="#deals" className="py-3 border-b border-violet-950/5 font-medium">
                            Deals
                        </a>
                        <a href="#contact" className="py-3 border-b border-violet-950/5 font-medium">
                            Contact
                        </a>
                        <div className="flex gap-3 mt-4">
                            <a href="#" className="flex-1 text-center rounded-full border border-violet-950/20 py-3 text-sm font-semibold">
                                Log in
                            </a>
                            <a href="#" className="flex-1 text-center rounded-full bg-amber-400 text-violet-950 py-3 text-sm font-semibold">
                                Register
                            </a>
                        </div>
                    </div>
                )}
            </header> }

            export default Header