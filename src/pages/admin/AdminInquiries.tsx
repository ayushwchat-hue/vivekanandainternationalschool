import { useEffect, useState } from 'react';
import { Eye, Check, X, Mail, Phone, MapPin, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  student_name: string;
  parent_name: string;
  email: string;
  phone: string;
  class_applying: string;
  previous_school: string | null;
  address: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const AdminInquiries = () => {
  const { toast } = useToast();
  const { sessionToken } = useAdminAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (sessionToken) {
      fetchInquiries();
    }
  }, [sessionToken]);

  const fetchInquiries = async () => {
    if (!sessionToken) {
      toast({
        title: 'Error',
        description: 'Not authenticated',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'get-inquiries', sessionToken }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setInquiries(data.data || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inquiries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!sessionToken) {
      toast({
        title: 'Error',
        description: 'Not authenticated',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'update-inquiry-status', 
          sessionToken,
          data: { id, status }
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: `Inquiry ${status}`,
      });
      fetchInquiries();
      setSelectedInquiry(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

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

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Admission Inquiries
          </h1>
          <p className="text-muted-foreground">Manage admission applications</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inquiries Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : filteredInquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No inquiries found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Parent</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{inquiry.student_name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{inquiry.parent_name}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{inquiry.parent_name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inquiry.class_applying}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Detail Dialog */}
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Inquiry Details</DialogTitle>
              <DialogDescription>
                Application for {selectedInquiry?.class_applying}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-medium">{selectedInquiry.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parent Name</p>
                    <p className="font-medium">{selectedInquiry.parent_name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{selectedInquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{selectedInquiry.phone}</span>
                  </div>
                  {selectedInquiry.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{selectedInquiry.address}</span>
                    </div>
                  )}
                </div>

                {selectedInquiry.previous_school && (
                  <div>
                    <p className="text-sm text-muted-foreground">Previous School</p>
                    <p>{selectedInquiry.previous_school}</p>
                  </div>
                )}

                {selectedInquiry.message && (
                  <div>
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{selectedInquiry.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status}
                  </span>

                  {selectedInquiry.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => updateStatus(selectedInquiry.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => updateStatus(selectedInquiry.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiries;
