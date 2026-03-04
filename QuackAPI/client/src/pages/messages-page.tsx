import { useMessages } from "@/hooks/use-messages";
import { useDevices } from "@/hooks/use-devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { MessageSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import SEO from "@/components/seo";

export default function MessagesPage() {
  const { data: messages, isLoading } = useMessages();
  const { data: devices } = useDevices();

  const getDeviceName = (id: number) => {
    return devices?.find(d => d.id === id)?.deviceName || `Device #${id}`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent': return <Badge className="bg-green-500 hover:bg-green-600">Sent</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <SEO title="Messages" description="View and manage your WhatsApp message history. Track delivery status and message analytics." noindex={true} />
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-2">View the history of messages sent through your API.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-md" />
              ))}
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages?.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>{getStatusBadge(msg.status)}</TableCell>
                      <TableCell className="font-mono text-xs">{msg.toNumber}</TableCell>
                      <TableCell className="max-w-xs truncate" title={msg.content}>
                        {msg.content}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {getDeviceName(msg.deviceId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {msg.createdAt && format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
