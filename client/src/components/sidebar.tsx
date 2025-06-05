import { Link, useLocation } from "wouter";
import { Receipt, BarChart3, FileText, Users, MessageSquare, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: enquiries } = useQuery({
    queryKey: ["/api/enquiries"],
  });

  const pendingInvoicesCount = invoices?.filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue').length || 0;
  const openEnquiriesCount = enquiries?.filter((enq: any) => enq.status === 'open').length || 0;

  return (
    <div className="w-64 bg-card shadow-lg flex flex-col border-r border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Receipt className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">InvoiceFlow</h1>
            <p className="text-sm text-muted-foreground">Pro</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn("sidebar-nav-item", isActive && "active")}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === "Invoices" && pendingInvoicesCount > 0 && (
                  <span className="ml-auto bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {pendingInvoicesCount}
                  </span>
                )}
                {item.name === "Enquiries" && openEnquiriesCount > 0 && (
                  <span className="ml-auto bg-orange-100 text-orange-600 dark:bg-orange-800/20 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                    {openEnquiriesCount}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Business Owner</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
