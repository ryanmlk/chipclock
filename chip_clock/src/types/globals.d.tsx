export {}

// Create a type for the roles
export type Roles = 'crew' | 'manager' | 'apprentice' | 'service_manager' | 'kitchen_manager' | 'certified_trainer';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}