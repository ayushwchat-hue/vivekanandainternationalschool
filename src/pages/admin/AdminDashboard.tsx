import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Image,
  Edit3,
  TrendingUp,
  LayoutGrid,
  Globe,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { format } from 'date-fns';

interface Stats {
  totalInquiries: number;
  pendingInquiries: number;
  approvedInquiries: number;
  rejectedInquiries: number;
  totalGalleryItems: number;
}

interface RecentInquiry {
  id: string;
  student_name: string;
  class_applying: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalInquiries: 0,
    pendingInquiries: 0,
    approvedInquiries: 0,
    rejectedInquiries: 0,
    totalGalleryItems: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch inquiries
      const { data: inquiries } = await supabase
        .from('admission_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch gallery count
      const { count: galleryCount } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true });

      if (inquiries) {
        setRecentInquiries(inquiries.slice(0, 5));
      }

      setStats({
        totalInquiries: inquiries?.length || 0,
        pendingInquiries: inquiries?.filter(i => i.status === 'pending').length || 0,
        approvedInquiries: inquiries?.filter(i => i.status === 'approved').length || 0,
        rejectedInquiries: inquiries?.filter(i => i.status === 'rejected').length || 0,
        totalGalleryItems: galleryCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Edit Website Content', description: 'Update hero, about, programs & more', icon: Edit3, href: '/admin/content', color: 'bg-primary' },
    { title: 'Manage Inquiries', description: 'Review admission applications', icon: FileText, href: '/admin/inquiries', color: 'bg-secondary' },
    { title: 'Manage Gallery', description: 'Add photos and media', icon: Image, href: '/admin/gallery', color: 'bg-accent' },
  ];

  const statCards = [
    {
      title: 'Admission Inquiries',
      value: stats.totalInquiries,
      subtext: `${stats.pendingInquiries} pending`,
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      href: '/admin/inquiries',
    },
    {
      title: 'Gallery Items',
      value: stats.totalGalleryItems,
      subtext: 'photos & media',
      icon: Image,
      color: 'bg-secondary/10 text-secondary',
      href: '/admin/gallery',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  };

  const websiteSections = [
    { name: 'Hero Section', key: 'hero', description: 'Main banner & stats' },
    { name: 'About Section', key: 'about', description: 'School info & values' },
    { name: 'Programs', key: 'programs', description: 'Academic offerings' },
    { name: 'Facilities', key: 'facilities', description: 'Infrastructure details' },
    { name: 'Testimonials', key: 'testimonials', description: 'Parent reviews' },
    { name: 'Contact Info', key: 'contact', description: 'Address & phone' },
    { name: 'Footer', key: 'footer', description: 'Links & social' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              HRMS Portal Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all website content and administrative tasks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/" target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Preview Website
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/content">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks for managing your website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group flex flex-col items-center p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{action.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">{action.description}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.href}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                          {loading ? '-' : stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Content Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Sections
                </CardTitle>
                <CardDescription>All editable sections of your website</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/content">
                  Edit All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {websiteSections.map((section) => (
                <Link
                  key={section.key}
                  to="/admin/content"
                  className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {section.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{section.description}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Recent Inquiries</CardTitle>
                  <CardDescription>Latest admission applications</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/inquiries">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : recentInquiries.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{inquiry.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {inquiry.class_applying} • {format(new Date(inquiry.created_at), 'MMM d')}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquiry Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Inquiry Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <Clock className="w-8 h-8 mx-auto text-secondary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{loading ? '-' : stats.pendingInquiries}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <CheckCircle className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">{loading ? '-' : stats.approvedInquiries}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-destructive/10">
                  <XCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
                  <p className="text-2xl font-bold text-foreground">{loading ? '-' : stats.rejectedInquiries}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;