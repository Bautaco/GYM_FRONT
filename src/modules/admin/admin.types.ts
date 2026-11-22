/** Datos necesarios para dar de alta un usuario desde el panel administrativo. */
export interface CreateManagedUserInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone?: string;
  notes?: string;
  trainerId?: string;
  avatarUrl?: string;
}
