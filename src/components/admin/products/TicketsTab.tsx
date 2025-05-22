
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types/product";

interface TicketsTabProps {
  tickets: Ticket[];
}

const TicketsTab = ({ tickets }: TicketsTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.id}</TableCell>
              <TableCell>{ticket.date}</TableCell>
              <TableCell>{ticket.customer}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Respond</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketsTab;
