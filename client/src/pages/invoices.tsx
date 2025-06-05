import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Eye, Edit, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InvoiceModal from "@/components/invoice-modal";
import { generateInvoicePDF } from "@/lib/pdf-generator";

export default function Invoices() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const client = clients?.find((c: any) => c.id === invoice.clientId);
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      client?.name.toLowerCase().includes(searchLower) ||
      invoice.status.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    return <span className={`invoice-status ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadPDF = async (invoice: any) => {
    const client = clients?.find((c: any) => c.id === invoice.clientId);
    if (client) {
      await generateInvoicePDF(invoice, client);
    }
  };

  const handleModalClose = () => {
    setShowInvoiceModal(false);
    setEditingInvoice(null);
  };

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices and track payments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No invoices match your search" : "No invoices yet"}
                </p>
                <Button onClick={() => setShowInvoiceModal(true)}>
                  Create your first invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Issue Date</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Due Date</th>
                      <th className="text-left py-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice: any) => {
                      const client = clients?.find((c: any) => c.id === invoice.clientId);
                      return (
                        <tr key={invoice.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 text-sm font-medium">{invoice.invoiceNumber}</td>
                          <td className="py-4 text-sm">{client?.name || "Unknown Client"}</td>
                          <td className="py-4 text-sm font-medium">${parseFloat(invoice.total).toFixed(2)}</td>
                          <td className="py-4">{getStatusBadge(invoice.status)}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPDF(invoice)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(invoice.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
      </main>

      <InvoiceModal
        open={showInvoiceModal}
        onOpenChange={handleModalClose}
        invoice={editingInvoice}
      />
    </>
  );
}
