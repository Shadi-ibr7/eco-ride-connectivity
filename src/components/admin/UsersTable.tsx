import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  credits: number;
  role: string | null;
  suspended_users: any[];
}

interface UsersTableProps {
  users: User[];
  onSuspendUser: (userId: string) => void;
}

export const UsersTable = ({ users, onSuspendUser }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Crédits</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-mono">{user.id}</TableCell>
            <TableCell>{user.name || "Non défini"}</TableCell>
            <TableCell>{user.credits}</TableCell>
            <TableCell>{user.role || "Non défini"}</TableCell>
            <TableCell>
              {user.suspended_users?.[0] ? (
                <span className="text-red-500">Suspendu</span>
              ) : (
                <span className="text-green-500">Actif</span>
              )}
            </TableCell>
            <TableCell>
              {!user.suspended_users?.[0] && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onSuspendUser(user.id)}
                >
                  Suspendre
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};