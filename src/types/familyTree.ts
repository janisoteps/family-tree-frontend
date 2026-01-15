/**
 * Gender types for a person
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Parent relationship type
 */
export type ParentType = 'biological' | 'adoptive' | 'step' | 'foster';

/**
 * Union type (marriage, partnership, etc.)
 */
export type UnionType = 'marriage' | 'partnership' | 'civil_union' | 'other';

/**
 * Union status
 */
export type UnionStatus = 'ongoing' | 'divorced' | 'annulled' | 'widowed' | 'separated';

/**
 * Represents a person/node in the family tree
 */
export interface Person {
  id: string;
  first_name: string | null;
  last_name: string | null;
  maiden_name: string | null;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  death_place: string | null;
  gender: string | null;
  occupation: string | null;
  notes: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  current_address: string | null;
  data: string | null; // Stringified JSON
}

/**
 * Represents a parent-child relationship
 */
export interface ParentChildRelationship {
  parent_id: string;
  child_id: string;
  parent_type: ParentType;
}

/**
 * Represents a union (marriage, partnership, etc.) between two people
 */
export interface Union {
  person1_id: string;
  person2_id: string;
  unionId: string;
  type: UnionType;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  status: UnionStatus;
  notes: string | null;
}

/**
 * Complete family tree graph response from the backend
 */
export interface FamilyTreeGraph {
  nodes: Person[];
  parentOf: ParentOfRow[];
  unions: UnionRow[];
}

/**
 * Response type for listing all persons
 */
export interface PersonListResponse {
  persons: Person[];
}

/**
 * Input type for creating a person
 */
export interface CreatePersonInput {
  first_name?: string | null;
  last_name?: string | null;
  maiden_name?: string | null;
  birth_date?: string | null; // ISO date: YYYY-MM-DD
  death_date?: string | null; // ISO date: YYYY-MM-DD
  birth_place?: string | null;
  death_place?: string | null;
  gender?: string | null;
  occupation?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  current_address?: string | null;
  data?: string | null; // Stringified JSON
}

/**
 * Input type for creating a union
 */
export interface CreateUnionInput {
  person1_id: string; // Required
  person2_id: string; // Required
  unionId?: string | null;
  type?: string | null; // e.g., "marriage", "partnership"
  startDate?: string | null; // ISO date: YYYY-MM-DD
  endDate?: string | null; // ISO date: YYYY-MM-DD
  place?: string | null;
  status?: string | null; // e.g., "ongoing", "divorced", "annulled"
  notes?: string | null;
}

/**
 * Response type for union operations
 */
export interface UnionRow {
  person1_id: string;
  person2_id: string;
  unionId: string | null;
  type: string | null;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  status: string | null;
  notes: string | null;
}

/**
 * Input type for creating a parent-child relationship
 */
export interface CreateParentOfInput {
  parent_id: string; // Required
  child_id: string; // Required
  parent_type?: string | null; // e.g., "biological", "adoptive", "step", "foster"
}

/**
 * Response type for parent-child relationship operations
 */
export interface ParentOfRow {
  parent_id: string;
  child_id: string;
  parent_type: string | null;
}

