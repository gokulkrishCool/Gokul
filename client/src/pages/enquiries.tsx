import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Building, Clock, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Enquiries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { toast } = useToast();

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ["/api/enquiries"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to update enquiry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Enquiry updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update enquiry",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete enquiry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedEnquiry(null);
      toast({
        title: "Success",
        description: "Enquiry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete enquiry",
        variant: "destructive",
      });
    },
  });

  const filteredEnquiries = enquiries?.filter((enquiry: any) => {
    const matchesSearch = searchTerm === "" || 
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || enquiry.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-green-100 text-green-700 dark:bg-green-800/20 dark:text-green-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/20 dark:text-yellow-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-800/20 dark:text-orange-400",
      urgent: "bg-red-100 text-red-700 dark:bg-red-800/20 dark:text-red-400",
    };
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "bg-blue-100 text-blue-700 dark:bg-blue-800/20 dark:text-blue-400",
      in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/20 dark:text-yellow-400",
      closed: "bg-green-100 text-green-700 dark:bg-green-800/20 dark:text-green-400",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const handleUpdateStatus = (enquiry: any, status: string) => {
    updateMutation.mutate({
      id: enquiry.id,
      data: { status }
    });
  };

  const handleUpdatePriority = (enquiry: any, priority: string) => {
    updateMutation.mutate({
      id: enquiry.id,
      data: { priority }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
            <p className="text-muted-foreground">Manage customer enquiries and support requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                ? "No enquiries match your filters" 
                : "No enquiries yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Customer enquiries will appear here when they contact you"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry: any) => (
              <Card key={enquiry.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6" onClick={() => setSelectedEnquiry(enquiry)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`priority-indicator ${enquiry.priority} mt-2`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{enquiry.subject}</h3>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(enquiry.priority)}
                            {getStatusBadge(enquiry.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span className="font-medium">{enquiry.name}</span>
                          <span className="flex items-center">
                            <Mail className="mr-1 h-3 w-3" />
                            {enquiry.email}
                          </span>
                          {enquiry.phone && (
                            <span className="flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              {enquiry.phone}
                            </span>
                          )}
                          {enquiry.company && (
                            <span className="flex items-center">
                              <Building className="mr-1 h-3 w-3" />
                              {enquiry.company}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {enquiry.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                          </span>
                          
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={enquiry.status}
                              onValueChange={(status) => handleUpdateStatus(enquiry, status)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Select
                              value={enquiry.priority}
                              onValueChange={(priority) => handleUpdatePriority(enquiry, priority)}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Enquiry Detail Modal */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEnquiry?.subject}</DialogTitle>
          </DialogHeader>
          
          {selectedEnquiry && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getPriorityBadge(selectedEnquiry.priority)}
                  {getStatusBadge(selectedEnquiry.status)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(selectedEnquiry.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Name:</span>
                      <span>{selectedEnquiry.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>{selectedEnquiry.email}</span>
                    </div>
                    {selectedEnquiry.phone && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        <span>{selectedEnquiry.phone}</span>
                      </div>
                    )}
                    {selectedEnquiry.company && (
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>{selectedEnquiry.company}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Select
                      value={selectedEnquiry.status}
                      onValueChange={(status) => handleUpdateStatus(selectedEnquiry, status)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={selectedEnquiry.priority}
                      onValueChange={(priority) => handleUpdatePriority(selectedEnquiry, priority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDelete(selectedEnquiry.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete Enquiry
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Message</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedEnquiry.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
