import React, { useState, useEffect } from 'react';
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

  const getPersonName = (person: Person) => {
    const name = [person.first_name, person.last_name].filter(Boolean).join(' ');
    return name || `Person ${person.id}`;
  };

  if (loading) {
    return <div>Loading persons...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="parent-of-form">
      <div className="form-group">
        <label htmlFor="parent_id">Parent *</label>
        <select
          id="parent_id"
          value={formData.parent_id}
          onChange={(e) => handleChange('parent_id', e.target.value)}
          required
        >
          <option value="">Select parent...</option>
          {persons
            .filter((p) => p.id !== formData.child_id)
            .map((person) => (
              <option key={person.id} value={person.id}>
                {getPersonName(person)}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="child_id">Child *</label>
        <select
          id="child_id"
          value={formData.child_id}
          onChange={(e) => handleChange('child_id', e.target.value)}
          required
        >
          <option value="">Select child...</option>
          {persons
            .filter((p) => p.id !== formData.parent_id)
            .map((person) => (
              <option key={person.id} value={person.id}>
                {getPersonName(person)}
              </option>
            ))}
        </select>
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

