import { useEffect, useState } from 'react';
import { Users, FileText, Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { format } from 'date-fns';

interface Stats {
  totalInquiries: number;
  pendingInquiries: number;
  approvedInquiries: number;
  rejectedInquiries: number;
  totalAnnouncements: number;
  totalEvents: number;
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
    totalAnnouncements: 0,
    totalEvents: 0,
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

      if (inquiries) {
        setStats({
          totalInquiries: inquiries.length,
          pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
          approvedInquiries: inquiries.filter(i => i.status === 'approved').length,
          rejectedInquiries: inquiries.filter(i => i.status === 'rejected').length,
          totalAnnouncements: 0,
          totalEvents: 0,
        });
        setRecentInquiries(inquiries.slice(0, 5));
      }

      // Fetch announcements count
      const { count: announcementsCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        totalAnnouncements: announcementsCount || 0,
        totalEvents: eventsCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Pending',
      value: stats.pendingInquiries,
      icon: Clock,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'Approved',
      value: stats.approvedInquiries,
      icon: CheckCircle,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Rejected',
      value: stats.rejectedInquiries,
      icon: XCircle,
      color: 'bg-destructive/10 text-destructive',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent/10 text-accent';
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                        {loading ? '-' : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Admission Inquiries</CardTitle>
            <CardDescription>Latest inquiries from prospective students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : recentInquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No inquiries yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium text-foreground">{inquiry.student_name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inquiry.class_applying}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
