import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Bell, DollarSign, FileText, Users, MessageSquare, ArrowUp, Clock, TriangleAlert, ChevronRight, UserPlus, Download, Settings as SettingsIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import InvoiceModal from "@/components/invoice-modal";
import ClientModal from "@/components/client-modal";

export default function Dashboard() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: enquiries, isLoading: enquiriesLoading } = useQuery({
    queryKey: ["/api/enquiries"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const recentInvoices = invoices?.slice(0, 5) || [];
  const recentEnquiries = enquiries?.slice(0, 3) || [];

  const getStatusBadge = (status: string) => {
    return <span className={`invoice-status ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-700 dark:bg-green-800/20 dark:text-green-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/20 dark:text-yellow-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-800/20 dark:text-orange-400",
      urgent: "bg-red-100 text-red-700 dark:bg-red-800/20 dark:text-red-400",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search invoices, clients..."
                className="pl-10 w-80"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${statsLoading ? "..." : stats?.totalRevenue?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    12.5% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600 dark:text-green-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                  <p className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.pendingInvoices || "0"}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    Awaiting payment
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800/20 rounded-lg flex items-center justify-center">
                  <FileText className="text-orange-600 dark:text-orange-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                  <p className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.activeClients || "0"}
                  </p>
                  <p className="text-sm text-primary flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    3 new this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Enquiries</p>
                  <p className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.openEnquiries || "0"}
                  </p>
                  <p className="text-sm text-destructive flex items-center mt-1">
                    <TriangleAlert className="mr-1 h-3 w-3" />
                    2 urgent
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-800/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-red-600 dark:text-red-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-muted h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
                  <Button onClick={() => setShowInvoiceModal(true)} className="mt-4">
                    Create your first invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Invoice</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Client</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice: any) => {
                        const client = clients?.find((c: any) => c.id === invoice.clientId);
                        return (
                          <tr key={invoice.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 text-sm font-medium">{invoice.invoiceNumber}</td>
                            <td className="py-3 text-sm">{client?.name || "Unknown Client"}</td>
                            <td className="py-3 text-sm">${parseFloat(invoice.total).toFixed(2)}</td>
                            <td className="py-3">{getStatusBadge(invoice.status)}</td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {new Date(invoice.issueDate).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Enquiries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Enquiries</CardTitle>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {enquiriesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentEnquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No enquiries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEnquiries.map((enquiry: any) => (
                    <div key={enquiry.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className={`priority-indicator ${enquiry.priority} mt-2`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{enquiry.subject}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{enquiry.message}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs text-muted-foreground">From: {enquiry.email}</span>
                          {getPriorityBadge(enquiry.priority)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => setShowInvoiceModal(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="text-primary h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Create Invoice</p>
                    <p className="text-sm text-muted-foreground">Generate new invoice</p>
                  </div>
                </div>
                <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => setShowClientModal(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="text-green-600 dark:text-green-400 h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Add Client</p>
                    <p className="text-sm text-muted-foreground">Add new client</p>
                  </div>
                </div>
                <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/20 rounded-lg flex items-center justify-center">
                    <Download className="text-orange-600 dark:text-orange-400 h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download reports</p>
                  </div>
                </div>
                <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800/20 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="text-purple-600 dark:text-purple-400 h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Settings</p>
                    <p className="text-sm text-muted-foreground">Configure app</p>
                  </div>
                </div>
                <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <InvoiceModal open={showInvoiceModal} onOpenChange={setShowInvoiceModal} />
      <ClientModal open={showClientModal} onOpenChange={setShowClientModal} />
    </>
  );
}
