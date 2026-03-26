import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/hrm';
import { ROLE_LABELS } from '@/types/hrm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import bannerImg from '@/assets/banner.png';
import { Lock, User, ChevronDown } from 'lucide-react';

const roles: UserRole[] = ['ADMIN', 'HR', 'MANAGER_TECH', 'FINANCE', 'EMPLOYEE'];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [showRoles, setShowRoles] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username || 'admin', password || '123456', role)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-accent/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-12">
          
          <img
            src={bannerImg}
            alt="Banner"
            className="rounded-2xl max-w-md w-full"
            style={{ boxShadow: 'var(--shadow-elevated)' }} />
          
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Tháng 4</h2>
            <p className="text-muted-foreground mt-2">"Tháng của niềm tự hào dân tộc"</p>
          </div>
        </motion.div>
      </div>

      {/* Right - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              HR
            </div>
            <h1 className="text-2xl font-bold text-foreground">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground mt-1">Hệ thống quản lý nhân sự</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Tên đăng nhập</Label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="pl-9" />
                
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Mật khẩu</Label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="pl-9" />
                
              </div>
            </div>

            {/* Role selector */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Vai trò (Demo)</Label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setShowRoles(!showRoles)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground">
                  
                  {ROLE_LABELS[role]}
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
                {showRoles &&
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                    {roles.map((r) =>
                  <button
                    key={r}
                    type="button"
                    onClick={() => {setRole(r);setShowRoles(false);}}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-foreground">
                    
                        {ROLE_LABELS[r]}
                      </button>
                  )}
                  </div>
                }
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">
              Đăng nhập
            </Button>

            <div className="flex items-center justify-between mt-3">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Quên mật khẩu?
              </Link>
              <p className="text-xs text-muted-foreground">
                Demo: Chọn vai trò và nhấn Đăng nhập
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>);

};

export default Login;