import React from "react";
import { Github, Linkedin, Heart, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#2B3638] border-t border-[#4A5759] py-6 mt-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Attribution */}
          <div className="flex items-center gap-2 text-gray-300">
            <span>Designed and developed by</span>
            <span className="text-[#89ECDB] font-semibold">
              Aditya Karanwal
            </span>
            <Heart size={16} className="text-red-400" fill="currentColor" />
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/karanwal123"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-[#89ECDB] transition-colors duration-200"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/aditya-karanwal-37aa28292/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-[#89ECDB] transition-colors duration-200"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://dog-zone-ebf.notion.site/About-me-173c0f234b3e80688bbbfd1570fa7b41"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-[#89ECDB] transition-colors duration-200"
            >
              <ExternalLink size={20} />
              <span>Notion</span>
            </a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#4A5759] text-center text-sm text-gray-400">
          <p>Built with React, Google Maps API, and lots of cc</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
