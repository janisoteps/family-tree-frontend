import React, { useState } from 'react';
import type { CreatePersonInput, Person } from '../../types/familyTree';
import './PersonForm.css';

interface PersonFormProps {
  person?: Person | null;
  onSubmit: (data: CreatePersonInput) => Promise<void>;
  onCancel: () => void;
}

export function PersonForm({ person, onSubmit, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState<CreatePersonInput>({
    first_name: person?.first_name || null,
    last_name: person?.last_name || null,
    maiden_name: person?.maiden_name || null,
    birth_date: person?.birth_date || null,
    death_date: person?.death_date || null,
    birth_place: person?.birth_place || null,
    death_place: person?.death_place || null,
    gender: person?.gender || null,
    occupation: person?.occupation || null,
    notes: person?.notes || null,
    photo_url: person?.photo_url || null,
    email: person?.email || null,
    phone: person?.phone || null,
    current_address: person?.current_address || null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CreatePersonInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="person-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="maiden_name">Maiden Name</label>
          <input
            id="maiden_name"
            type="text"
            value={formData.maiden_name || ''}
            onChange={(e) => handleChange('maiden_name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="birth_date">Birth Date</label>
          <input
            id="birth_date"
            type="date"
            value={formData.birth_date || ''}
            onChange={(e) => handleChange('birth_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="death_date">Death Date</label>
          <input
            id="death_date"
            type="date"
            value={formData.death_date || ''}
            onChange={(e) => handleChange('death_date', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="birth_place">Birth Place</label>
          <input
            id="birth_place"
            type="text"
            value={formData.birth_place || ''}
            onChange={(e) => handleChange('birth_place', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="death_place">Death Place</label>
          <input
            id="death_place"
            type="text"
            value={formData.death_place || ''}
            onChange={(e) => handleChange('death_place', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="occupation">Occupation</label>
        <input
          id="occupation"
          type="text"
          value={formData.occupation || ''}
          onChange={(e) => handleChange('occupation', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="current_address">Current Address</label>
        <textarea
          id="current_address"
          value={formData.current_address || ''}
          onChange={(e) => handleChange('current_address', e.target.value)}
          rows={2}
        />
      </div>

      <div className="form-group">
        <label htmlFor="photo_url">Photo URL</label>
        <input
          id="photo_url"
          type="url"
          value={formData.photo_url || ''}
          onChange={(e) => handleChange('photo_url', e.target.value)}
        />
        {formData.photo_url && (
          <div className="photo-preview">
            <img src={formData.photo_url} alt="Preview" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
          </div>
        )}
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
          {isSubmitting ? 'Saving...' : person ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

