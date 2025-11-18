import React from 'react'
import { FaBookOpen } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Pine from "../assets/pine-transparent.png"

const Navbar = () => {
  return (
    <nav className="bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] shadow-sm sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div 
              className="absolute -top-1.5 -left-1.5 w-full h-full bg-gradient-to-br from-[rgba(var(--accent),0.3)] to-[rgba(var(--warning),0.2)] transform rotate-12 opacity-60 group-hover:opacity-80 transition-all duration-300"
              style={{ borderRadius: '20px' }} // Squircle shape
            ></div>
            <div className="relative w-12 h-12 bg-[rgb(var(--card))] rounded-[16px] flex items-center justify-center shadow-md border border-[rgb(var(--border))] group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <img src={Pine} height={56} width={56} alt="Pine Logo" className="object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-serif text-[rgb(var(--copy-primary))] font-bold tracking-wider">
              Pine
            </h1>
            <p className="text-sm text-[rgb(var(--copy-secondary))] font-light">
              Your cozy digital journal
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 text-sm font-medium text-[rgb(var(--copy-primary))] bg-[rgb(var(--surface))] rounded-lg hover:bg-[rgb(var(--card))] hover:text-[rgb(var(--accent))] transition-all duration-200 shadow-sm border border-[rgb(var(--border))] hover:shadow-md"
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className="px-4 py-2 text-sm font-medium text-[rgb(var(--cta-text))] bg-[rgb(var(--cta))] rounded-lg hover:bg-[rgb(var(--cta-active))] transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar