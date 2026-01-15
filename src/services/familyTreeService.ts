import type {
  Person,
  PersonListResponse,
  CreatePersonInput,
  CreateUnionInput,
  UnionRow,
  CreateParentOfInput,
  ParentOfRow,
  FamilyTreeGraph,
} from '../types/familyTree';
import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';

/**
 * Error class for API errors
 */
export class ApiError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  return response.json();
}

/**
 * Helper function to handle network errors
 */
function handleNetworkError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError(
    `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    0,
    'Network Error'
  );
}

/**
 * Lists all persons from the backend
 * @returns Promise resolving to the list of persons
 * @throws {ApiError} If the API request fails
 */
export async function listAllPersons(): Promise<PersonListResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.NODE}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<PersonListResponse>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Creates a new person
 * @param input - The person data to create
 * @returns Promise resolving to the created person with id
 * @throws {ApiError} If the API request fails
 */
export async function createPerson(input: CreatePersonInput): Promise<Person> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PERSON}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<Person>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Creates a new union (marriage/partnership) between two people
 * @param input - The union data to create
 * @returns Promise resolving to the created union
 * @throws {ApiError} If the API request fails
 */
export async function createUnion(input: CreateUnionInput): Promise<UnionRow> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.UNION}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<UnionRow>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Creates a parent-child relationship
 * @param input - The parent-child relationship data to create
 * @returns Promise resolving to the created parent-child relationship
 * @throws {ApiError} If the API request fails
 */
export async function createParentOf(
  input: CreateParentOfInput
): Promise<ParentOfRow> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PARENT_OF}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<ParentOfRow>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Gets the complete family tree graph from the backend
 * @returns Promise resolving to the family tree graph
 * @throws {ApiError} If the API request fails
 */
export async function getFamilyTreeGraph(): Promise<FamilyTreeGraph> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GRAPH}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<FamilyTreeGraph>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Updates a person by ID (partial update)
 * @param personId - The ID of the person to update
 * @param input - The partial person data to update (only provided fields will be updated)
 * @returns Promise resolving to the updated person
 * @throws {ApiError} If the API request fails
 */
export async function updatePerson(
  personId: string,
  input: CreatePersonInput
): Promise<Person> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PERSON}/${personId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<Person>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Deletes a person by ID
 * @param personId - The ID of the person to delete
 * @returns Promise resolving to void
 * @throws {ApiError} If the API request fails
 */
export async function deletePerson(personId: string): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PERSON}/${personId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    // DELETE requests may return empty body (204 No Content)
    // Try to parse JSON if content exists, otherwise return void
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      await response.json();
    }
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Updates a person's position in the graph layout
 * @param personId - The ID of the person to update
 * @param x - The X coordinate (pixels)
 * @param y - The Y coordinate (pixels)
 * @returns Promise resolving to the updated person
 * @throws {ApiError} If the API request fails
 */
export async function updatePersonPosition(
  personId: string,
  x: number,
  y: number
): Promise<Person> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PERSON}/${personId}/position`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ x, y }),
    });

    return handleResponse<Person>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

/**
 * Clears a person's position to reset to auto-layout
 * @param personId - The ID of the person to reset
 * @returns Promise resolving to the updated person
 * @throws {ApiError} If the API request fails
 */
export async function clearPersonPosition(personId: string): Promise<Person> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.PERSON}/${personId}/position`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Person>(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

