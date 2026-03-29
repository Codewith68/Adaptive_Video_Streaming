"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Library" },
    { href: "/upload", label: "Upload" },
  ];

  return (
    <nav className="site-nav">
      <div className="nav-shell">
        <Link href="/" className="brand">
          <div className="brand-mark">SV</div>
          <div>
            <div className="brand-title">StreamVault</div>
            <div className="brand-subtitle">MongoDB + Prisma media library</div>
          </div>
        </Link>

        <div className="nav-links">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="brand-pill">Adaptive HLS</span>
          <Link href="/upload" className="button-primary nav-cta">
            New upload
          </Link>
        </div>
      </div>
    </nav>
  );
}
