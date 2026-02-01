import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'director' | 'teacher' | 'student';

const roleConfig: Record<UserRole, { title: string; subtitle: string; color: string; bgColor: string }> = {
  director: {
    title: 'HRMS Portal',
    subtitle: 'Director Access',
    color: 'text-primary',
    bgColor: 'bg-primary',
  },
  teacher: {
    title: 'Teacher Portal',
    subtitle: 'Teacher Access',
    color: 'text-accent',
    bgColor: 'bg-accent',
  },
  student: {
    title: 'Student Portal',
    subtitle: 'Student Access',
    color: 'text-secondary',
    bgColor: 'bg-secondary',
  },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const currentRole = (role as UserRole) || 'student';
  const config = roleConfig[currentRole] || roleConfig.student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      
      // Redirect based on role
      if (currentRole === 'director' || currentRole === 'teacher') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-card rounded-2xl p-8 card-shadow border border-border">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {config.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
            <p className="text-muted-foreground mt-2">
              Vivekananda International School
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link to={`/register/${currentRole}`} className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
