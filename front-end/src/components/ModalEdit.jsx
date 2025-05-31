import React from 'react';

export default function ModalEdit({ visible, title, fields, data, onChange, onClose, onSubmit }) {
  if (!visible) return null;

  const handleChange = (name, value, type) => {
    if (type === 'tel' && typeof data[name] === 'object') {
      onChange({ ...data, [name]: { ...data[name], numero: value } });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <form onSubmit={onSubmit}>
          <h3>{title}</h3>

          {fields.map(({ label, name, type = 'text', readOnly, options }) => (
            <div key={name}>
              <label>{label}</label>

              {type === 'select' ? (
                <select
                  name={name}
                  value={data[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value, type)}
                >
                  <option value="">Selecione</option>
                  {options.map((opt) => (
                    <option key={opt._id || opt.value} value={opt._id || opt.value}>
                      {opt.descricao || opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={
                    type === 'tel' && typeof data[name] === 'object'
                      ? data[name]?.numero || ''
                      : data[name] || ''
                  }
                  readOnly={readOnly}
                  onChange={(e) => handleChange(name, e.target.value, type)}
                />
              )}
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
