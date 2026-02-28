-----
FATAL: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-ef8713c421220290c9165968ec760d65.log.

To help make Turbopack better, report this error by clicking here.
-----

 ○ Compiling /api/schedule ...
 GET /favicon.ico?favicon.272f43e0.ico 200 in 891ms
[next-auth][warn][NEXTAUTH_URL] 
https://next-auth.js.org/warnings#nextauth_url
 GET /api/auth/session 200 in 1676ms
 ✓ Compiled /api/schedule in 2.1s
 GET /api/schedule?name=Cece 500 in 2315ms

-----
FATAL: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-ef8713c421220290c9165968ec760d65.log.

To help make Turbopack better, report this error by clicking here.
-----

 GET /api/schedule?name=Cece 500 in 34ms
 ○ Compiling /manage/employees ...
 ✓ Compiled /manage/employees in 705ms
 ⨯ ./src/components/employeeDialog.tsx:21:1
Module not found: Can't resolve '@/generated/prisma'
  19 |     SelectValue,
  20 | } from "@/components/ui/select";
> 21 | import { Employee, EmployeeRole } from "@/generated/prisma";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  22 | import { Position } from "@/types/enums";
  23 |
  24 | interface EmployeeDialogProps {

Import map: aliased to relative './src/generated/prisma' inside of [project]/


Import traces:
  Client Component Browser:
    ./src/components/employeeDialog.tsx [Client Component Browser]
    ./src/app/manage/employees/page.tsx [Client Component Browser]
    ./src/app/manage/employees/page.tsx [Server Component]

  Client Component SSR:
    ./src/components/employeeDialog.tsx [Client Component SSR]
    ./src/app/manage/employees/page.tsx [Client Component SSR]
    ./src/app/manage/employees/page.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found


 GET /manage/employees 500 in 823ms
 GET /favicon.ico 500 in 52ms