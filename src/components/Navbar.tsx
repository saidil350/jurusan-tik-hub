import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, X, LayoutDashboard, Database } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">TIK</span>
            </div>
            <span className="hidden font-semibold text-sm sm:inline-block">
              Pelayanan Jurusan TIK
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/peminjaman">Peminjaman</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/riwayat">Riwayat</Link>
                </Button>
                {profile?.role === 'admin' && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard/admin">Admin</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/export-database">
                        <Database className="mr-2 h-4 w-4" />
                        Export DB
                      </Link>
                    </Button>
                  </>
                )}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                  <span className="text-xs text-muted-foreground">
                    {profile?.full_name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            {user ? (
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/peminjaman" onClick={() => setMobileMenuOpen(false)}>
                    Peminjaman Baru
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/riwayat" onClick={() => setMobileMenuOpen(false)}>
                    Riwayat
                  </Link>
                </Button>
                {profile?.role === 'admin' && (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/export-database" onClick={() => setMobileMenuOpen(false)}>
                        <Database className="mr-2 h-4 w-4" />
                        Export Database
                      </Link>
                    </Button>
                  </>
                )}
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2 px-4">
                    {profile?.full_name}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Daftar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
