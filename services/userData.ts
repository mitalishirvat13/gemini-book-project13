import { User } from '../types';

export const mockUsers: User[] = [
  // FIX: Added missing 'email' property to each user object to match the User type.
  { id: 'student1', name: 'Alice Smith', email: 'alice.smith@example.com' },
  { id: 'student2', name: 'Bob Johnson', email: 'bob.johnson@example.com' },
  { id: 'student3', name: 'Charlie Brown', email: 'charlie.brown@example.com' },
  { id: 'student4', name: 'Diana Prince', email: 'diana.prince@example.com' },
];
