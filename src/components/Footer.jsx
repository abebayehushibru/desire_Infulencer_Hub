import logo2 from "../assets/logos/logo2.png"
const Footer=()=>{
  return  <footer className=" bg-gradient-to-br from-primary via-secondary to-primary text-violet-200/70 pt-16 pb-7">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-white/10">
                        <div>
                            <a href="#" className="flex relative  items-center gap-2 font-bold text-lg h-12 w-full text-white">
                                   <img src={logo2} alt="InfluenceHub" className="h-full absolute w-full mr-10 object-cover scale-150" />
                            </a>
                            <p className="mt-4 text-sm leading-relaxed max-w-xs text-violet-200/50">
                                The marketplace connecting influencers and creators with the brands that fit their content.
                            </p>
                            {/* <div className="flex gap-2.5 mt-5">
                {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-violet-950 transition"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div> */}
                        </div>

                        <div>
                            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Product</h4>
                            <ul className="flex flex-col gap-3 text-sm">
                                <li><a href="#" className="hover:text-amber-400 transition">For Creators</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition">For Brands</a></li>
                                <li><a href="#deals" className="hover:text-amber-400 transition">Deals</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Company</h4>
                            <ul className="flex flex-col gap-3 text-sm">
                                <li><a href="#" className="hover:text-amber-400 transition">About</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition">Careers</a></li>
                                <li><a href="#contact" className="hover:text-amber-400 transition">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Legal</h4>
                            <ul className="flex flex-col gap-3 text-sm">
                                <li><a href="#" className="hover:text-amber-400 transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition">Terms</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-wrap justify-between gap-3 text-xs text-violet-200/40">
                        <span>© 2026 InfulencerHub. All rights reserved.</span>
                        <span>Made for creators, by desire tech.</span>
                    </div>
                </div>
            </footer>
}
export default Footer