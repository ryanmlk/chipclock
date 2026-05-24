
import { EmployeeRole } from '@/generated/prisma/enums';

declare global {
  type Roles = EmployeeRole;

  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

