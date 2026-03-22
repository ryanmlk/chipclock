"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import type { Employee } from "@/generated/prisma/client";
import { useEffect, useState } from "react";
import { EmployeeDialog } from "@/components/employeeDialog";
import { Trash2, Edit, Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await fetch(`/api/employees`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete employee");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleManage = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employees Management</CardTitle>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Primary Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">
                  {emp.first_name} {emp.last_name}
                </TableCell>
                <TableCell className="capitalize">{emp.role.replace("_", " ")}</TableCell>
                <TableCell>{emp.phone || "N/A"}</TableCell>
                <TableCell className="capitalize">{emp.positions[0] || "N/A"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${emp.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {emp.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleManage(emp)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteEmployee(emp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <EmployeeDialog
          isOpen={isDialogOpen}
          onChangeState={setIsDialogOpen}
          employee={selectedEmployee}
          onSave={fetchEmployees}
        />
      </CardContent>
    </Card>
  );
}
