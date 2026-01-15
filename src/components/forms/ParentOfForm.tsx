import React, { useState, useEffect, useRef } from 'react';
import type { CreateParentOfInput, Person } from '../../types/familyTree';
import { listAllPersons } from '../../services/familyTreeService';
import './ParentOfForm.css';

interface ParentOfFormProps {
  preSelectedParent?: string;
  preSelectedChild?: string;
  onSubmit: (data: CreateParentOfInput) => Promise<void>;
  onCancel: () => void;
}

export function ParentOfForm({
  preSelectedParent,
  preSelectedChild,
  onSubmit,
  onCancel,
}: ParentOfFormProps) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateParentOfInput>({
    parent_id: preSelectedParent || '',
    child_id: preSelectedChild || '',
    parent_type: 'biological',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search states for parent and child
  const [parentSearch, setParentSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');
  const [showParentResults, setShowParentResults] = useState(false);
  const [showChildResults, setShowChildResults] = useState(false);
  const parentInputRef = useRef<HTMLInputElement>(null);
  const childInputRef = useRef<HTMLInputElement>(null);
  const parentResultsRef = useRef<HTMLDivElement>(null);
  const childResultsRef = useRef<HTMLDivElement>(null);

  const getPersonName = (person: Person) => {
    const name = [person.first_name, person.last_name].filter(Boolean).join(' ');
    return name || `Person ${person.id}`;
  };

  useEffect(() => {
    async function fetchPersons() {
      try {
        const response = await listAllPersons();
        setPersons(response.persons);
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPersons();
  }, []);

  // Set initial search values when persons are loaded and pre-selected values exist
  useEffect(() => {
    if (persons.length > 0) {
      if (preSelectedParent) {
        const parent = persons.find(p => p.id === preSelectedParent);
        if (parent) {
          setParentSearch(getPersonName(parent));
        }
      }
      if (preSelectedChild) {
        const child = persons.find(p => p.id === preSelectedChild);
        if (child) {
          setChildSearch(getPersonName(child));
        }
      }
    }
  }, [persons, preSelectedParent, preSelectedChild]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (parentResultsRef.current && !parentResultsRef.current.contains(event.target as Node) && 
          parentInputRef.current && !parentInputRef.current.contains(event.target as Node)) {
        setShowParentResults(false);
      }
      if (childResultsRef.current && !childResultsRef.current.contains(event.target as Node) &&
          childInputRef.current && !childInputRef.current.contains(event.target as Node)) {
        setShowChildResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (field: keyof CreateParentOfInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parent_id || !formData.child_id) {
      alert('Please select both parent and child');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterPersons = (searchQuery: string, excludeId?: string) => {
    if (!searchQuery.trim()) {
      return []; // Don't show results when search is empty
    }
    const query = searchQuery.toLowerCase();
    return persons
      .filter((p) => {
        if (excludeId && p.id === excludeId) return false;
        const name = getPersonName(p).toLowerCase();
        return name.includes(query);
      })
      .slice(0, 10); // Limit to 10 results for better UX
  };

  const handleParentSelect = (person: Person) => {
    setFormData((prev) => ({ ...prev, parent_id: person.id }));
    setParentSearch(getPersonName(person));
    setShowParentResults(false);
  };

  const handleChildSelect = (person: Person) => {
    setFormData((prev) => ({ ...prev, child_id: person.id }));
    setChildSearch(getPersonName(person));
    setShowChildResults(false);
  };

  const handleParentSearchChange = (value: string) => {
    setParentSearch(value);
    setShowParentResults(true);
    if (!value) {
      setFormData((prev) => ({ ...prev, parent_id: '' }));
    }
  };

  const handleChildSearchChange = (value: string) => {
    setChildSearch(value);
    setShowChildResults(true);
    if (!value) {
      setFormData((prev) => ({ ...prev, child_id: '' }));
    }
  };

  if (loading) {
    return <div>Loading persons...</div>;
  }

  const filteredParents = filterPersons(parentSearch, formData.child_id);
  const filteredChildren = filterPersons(childSearch, formData.parent_id);

  return (
    <form onSubmit={handleSubmit} className="parent-of-form">
      <div className="form-group">
        <label htmlFor="parent_id">Parent *</label>
        <div className="search-field-container">
          <input
            ref={parentInputRef}
            id="parent_id"
            type="text"
            value={parentSearch}
            onChange={(e) => handleParentSearchChange(e.target.value)}
            onFocus={() => setShowParentResults(true)}
            placeholder="Search for parent..."
            required
            className="search-input"
          />
          {showParentResults && filteredParents.length > 0 && (
            <div ref={parentResultsRef} className="search-results">
              {filteredParents.map((person) => (
                <div
                  key={person.id}
                  className="search-result-item"
                  onClick={() => handleParentSelect(person)}
                >
                  {getPersonName(person)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="child_id">Child *</label>
        <div className="search-field-container">
          <input
            ref={childInputRef}
            id="child_id"
            type="text"
            value={childSearch}
            onChange={(e) => handleChildSearchChange(e.target.value)}
            onFocus={() => setShowChildResults(true)}
            placeholder="Search for child..."
            required
            className="search-input"
          />
          {showChildResults && filteredChildren.length > 0 && (
            <div ref={childResultsRef} className="search-results">
              {filteredChildren.map((person) => (
                <div
                  key={person.id}
                  className="search-result-item"
                  onClick={() => handleChildSelect(person)}
                >
                  {getPersonName(person)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="parent_type">Parent Type</label>
        <select
          id="parent_type"
          value={formData.parent_type || 'biological'}
          onChange={(e) => handleChange('parent_type', e.target.value)}
        >
          <option value="biological">Biological</option>
          <option value="adoptive">Adoptive</option>
          <option value="step">Step</option>
          <option value="foster">Foster</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Relationship'}
        </button>
      </div>
    </form>
  );
}

