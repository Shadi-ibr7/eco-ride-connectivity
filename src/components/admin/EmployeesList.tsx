import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Employee {
  email: string;
  created_at: string;
}

interface EmployeesListProps {
  employees: Employee[];
  onRemoveEmployee: (email: string) => void;
}

export const EmployeesList = ({ employees, onRemoveEmployee }: EmployeesListProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.email}>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveEmployee(employee.email)}
                >
                  Retirer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};