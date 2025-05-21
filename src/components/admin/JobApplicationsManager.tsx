
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export default function JobApplicationsManager() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      let query = supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
      
      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setApplications(applications.filter(app => app.id !== id));
      
      if (selectedApplication?.id === id) {
        setOpenDialog(false);
      }
      
      toast({
        title: 'Application Deleted',
        description: 'The application has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the application',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'Under Review':
        return <Badge variant="secondary" className="bg-amber-500">Under Review</Badge>;
      case 'Interview':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Interview</Badge>;
      case 'Shortlisted':
        return <Badge variant="outline" className="border-green-500 text-green-700">Shortlisted</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Hired':
        return <Badge variant="outline" className="border-green-700 bg-green-100 text-green-800">Hired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Job Applications</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setTimeout(() => fetchApplications(), 100);
          }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Hired">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchApplications}>
            Refresh
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Clock className="mr-2 h-5 w-5 animate-spin" />
                      Loading applications...
                    </div>
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.full_name}</TableCell>
                    <TableCell>{application.job_title}</TableCell>
                    <TableCell>{application.department}</TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewApplication(application)}
                          title="View Application"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(application.resume_url, '_blank')}
                          title="Download Resume"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedApplication && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Application Details
              </DialogTitle>
              <DialogDescription>
                Submitted on {new Date(selectedApplication.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedApplication.full_name}</h3>
                  <p className="text-gray-600">
                    {selectedApplication.email} | {selectedApplication.phone}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Position</h4>
                  <p>{selectedApplication.job_title}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Department</h4>
                  <p>{selectedApplication.department}</p>
                </div>
              </div>
              
              {selectedApplication.portfolio_url && (
                <div>
                  <h4 className="font-semibold mb-1">Portfolio/LinkedIn</h4>
                  <a 
                    href={selectedApplication.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedApplication.portfolio_url}
                  </a>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-1">Cover Letter</h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedApplication.resume_url, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <div className="font-semibold mb-2 sm:mb-0">Update Status:</div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'Under Review')}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  Under Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'Interview')}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Interview
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-700 hover:bg-green-50"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'Shortlisted')}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Shortlist
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-700 hover:bg-red-50"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'Rejected')}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'Hired')}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Hired
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
