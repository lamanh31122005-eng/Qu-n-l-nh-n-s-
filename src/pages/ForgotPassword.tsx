import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import bannerImg from '@/assets/banner.png';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-accent/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-12"
        >
          <img
            src={bannerImg}
            alt="Banner"
            className="rounded-2xl max-w-md w-full"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Hệ thống Quản lý Nhân sự</h2>
            <p className="text-muted-foreground mt-2">Quản lý hiệu quả – Phát triển bền vững</p>
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              HR
            </div>
            <h1 className="text-2xl font-bold text-foreground">Quên mật khẩu</h1>
            <p className="text-sm text-muted-foreground mt-1">Nhập email để nhận liên kết đặt lại mật khẩu</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@congty.vn"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Gửi liên kết đặt lại
              </Button>

              <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline mt-3">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Email đã được gửi!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vui lòng kiểm tra hộp thư <span className="font-medium text-foreground">{email}</span> để đặt lại mật khẩu.
                </p>
              </div>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
