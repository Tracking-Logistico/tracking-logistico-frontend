import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Package2 } from "lucide-react";
import { gsap } from "gsap";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils"; 

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    const opening = !isMenuOpen;
    setIsMenuOpen(opening);

    if (opening) {
      gsap.to(line1Ref.current, {
        rotate: 45,
        y: 6,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(line2Ref.current, {
        rotate: -45,
        y: -6,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.fromTo(
        menuRef.current,
        { autoAlpha: 0, y: -20 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    } else {
      gsap.to(line1Ref.current, {
        rotate: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(line2Ref.current, {
        rotate: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(menuRef.current, {
        autoAlpha: 0,
        y: -20,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  };

  const closeMenu = () => {
    if (!isMenuOpen) return;
    toggleMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="LogisTrack - Ir a la página de inicio"
        >
          <Package2 className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <span className="font-bold text-xl">LogisTrack</span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-4"
          aria-label="Navegación principal"
        >
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Iniciar Sesión
          </Link>

          <Link to="/registro" className={cn(buttonVariants())}>
            Registrarse
          </Link>
        </nav>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden relative h-10 w-10 flex items-center justify-center"
        >
          <span className="sr-only">
            {isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          </span>
          <span className="relative block h-5 w-6">
            <span
              ref={line1Ref}
              className="absolute left-0 top-0 h-0.5 w-6 bg-foreground origin-center"
            />
            <span
              ref={line2Ref}
              className="absolute left-0 bottom-0 h-0.5 w-6 bg-foreground origin-center"
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={cn(
          "md:hidden fixed inset-0 top-16 h-[calc(100vh-4rem)] w-full bg-background flex flex-col items-center justify-center gap-6",
          !isMenuOpen && "pointer-events-none"
        )}
        style={{ visibility: isMenuOpen ? "visible" : "hidden", opacity: 0 }}
        aria-label="Navegación móvil"
      >
        <Link
          to="/login"
          onClick={closeMenu}
          className={cn(buttonVariants({ variant: "ghost" }), "text-lg w-4/5 justify-center")}
        >
          Iniciar Sesión
        </Link>

        <Link
          to="/registro"
          onClick={closeMenu}
          className={cn(buttonVariants(), "text-lg w-4/5 justify-center")}
        >
          Registrarse
        </Link>
      </div>
    </header>
  );
}