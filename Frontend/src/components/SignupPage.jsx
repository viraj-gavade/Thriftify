import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Leaf, Mail, Lock, User, ArrowRight, Camera } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullname: '', username: '', email: '', password: '', confirmPassword: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullname', form.fullname);
      fd.append('username', form.username);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('confirmPassword', form.confirmPassword);
      if (profilePic) fd.append('profilepic', profilePic);
      await signup(fd);
      toast.success('Account created! Signing you in...');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); },
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mx-auto mb-8">
            <Leaf className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Join Thriftify</h2>
          <p className="text-white/50 leading-relaxed">
            Create an account to start buying and selling pre-loved items sustainably.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Thriftify</span>
          </div>

          <Card className="border-0 shadow-none sm:shadow-card sm:border sm:border-border">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display">Create Account</CardTitle>
              <CardDescription>Fill in your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar upload */}
                <div className="flex justify-center">
                  <label className="relative cursor-pointer group">
                    <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    <span className="block text-[11px] text-muted-foreground text-center mt-1.5">Photo</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10" {...field('fullname')} />
                    </div>
                    {errors.fullname && <p className="text-xs text-destructive">{errors.fullname}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="johndoe" {...field('username')} />
                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" className="pl-10" {...field('email')} />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" placeholder="Min. 8 characters" className="pl-10" {...field('password')} />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" placeholder="Repeat password" className="pl-10" {...field('confirmPassword')} />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
