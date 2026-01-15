import React, { useState, useEffect } from 'react';
import type { CreateUnionInput, Person } from '../../types/familyTree';
import { listAllPersons } from '../../services/familyTreeService';
import './UnionForm.css';

interface UnionFormProps {
  preSelectedPerson1?: string;
  preSelectedPerson2?: string;
  onSubmit: (data: CreateUnionInput) => Promise<void>;
  onCancel: () => void;
}

export function UnionForm({
  preSelectedPerson1,
  preSelectedPerson2,
  onSubmit,
  onCancel,
}: UnionFormProps) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateUnionInput>({
    person1_id: preSelectedPerson1 || '',
    person2_id: preSelectedPerson2 || '',
    type: null,
    startDate: null,
    endDate: null,
    place: null,
    status: 'ongoing',
    notes: null,
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

  const handleChange = (field: keyof CreateUnionInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person1_id || !formData.person2_id) {
      alert('Please select both persons');
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
    <form onSubmit={handleSubmit} className="union-form">
      <div className="form-group">
        <label htmlFor="person1_id">Person 1 *</label>
        <select
          id="person1_id"
          value={formData.person1_id}
          onChange={(e) => handleChange('person1_id', e.target.value)}
          required
        >
          <option value="">Select person...</option>
          {persons.map((person) => (
            <option key={person.id} value={person.id}>
              {getPersonName(person)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="person2_id">Person 2 *</label>
        <select
          id="person2_id"
          value={formData.person2_id}
          onChange={(e) => handleChange('person2_id', e.target.value)}
          required
        >
          <option value="">Select person...</option>
          {persons
            .filter((p) => p.id !== formData.person1_id)
            .map((person) => (
              <option key={person.id} value={person.id}>
                {getPersonName(person)}
              </option>
            ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={formData.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="marriage">Marriage</option>
            <option value="partnership">Partnership</option>
            <option value="civil_union">Civil Union</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="ongoing">Ongoing</option>
            <option value="divorced">Divorced</option>
            <option value="annulled">Annulled</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="place">Place</label>
        <input
          id="place"
          type="text"
          value={formData.place || ''}
          onChange={(e) => handleChange('place', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Union'}
        </button>
      </div>
    </form>
  );
}

