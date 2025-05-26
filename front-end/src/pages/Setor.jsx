import '../styles/styles.css';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import Nav from '../components/Nav';
import ModalEdit from '../components/ModalEdit';

import { API_URL } from '../config/api';

export default function Setor() {
  const [setores, setSetores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState('create');

  const { empresa, loading } = useAuth();

  const fields = [
    { label: 'Descrição', name: 'descricao' }
  ];

  useEffect(() => {
    if (loading || !empresa) return;

    const fetchSetores = async () => {
      try {
        const res = await fetch(`${API_URL}/api/empresa/${empresa.empresa._id}/setor`, {
          headers: {
            Authorization: `Bearer ${empresa.token}`,
          },
        });
        if (!res.ok) throw new Error('Erro ao carregar setores');
        const data = await res.json();
        setSetores(data);
      } catch (err) {
        alert(err.message);
      }
    };
    fetchSetores();
  }, [empresa, loading]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const editUrl = editMode === 'create' ? `${API_URL}/api/setor` : `${API_URL}/api/setor/${formData._id}`;

    try {
      const response = await fetch(editUrl, {
        method: editMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empresa.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Erro ao ${editMode === 'edit' ? 'atualizar' : 'criar'} setor`);

      const savedSetor = await response.json();

      if (editMode === 'create') {
        setSetores((prev) => [...prev, savedSetor]);
      } else {
        setSetores((prev) =>
          prev.map((f) => (f._id === savedSetor._id ? savedSetor : f))
        );
      }

      setShowModal(false);
      alert(`Setor ${editMode === 'edit' ? 'atualizada' : 'cadastrada'} com sucesso!`);
    } catch (error) {
      alert('Erro ao cadastrar setor: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este setor?')) return;

    try {
      const response = await fetch(`${API_URL}/api/setor/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${empresa.token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao remover setor');

      setSetores(setores.filter((setor) => setor._id !== id));
      alert('Setor removido com sucesso!');
    } catch (error) {
      alert('Erro ao remover setor: ' + error.message);
    }
  }

  return (
    <>
      <Nav />

      <div className="content-background">
        <div className="card">
          <div className="card-header">
            <h2>Setores</h2>
            <button className="btn-primary" onClick={(e) => {
              setFormData({descricao: '', empresa: empresa.empresa._id});
              setEditMode('create');
              setShowModal(true);
            }}>Novo Setor</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {setores.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum setor encontrado</td>
                </tr>
              ) : (
                setores.map((setor) => (
                  <tr key={setor._id}>
                    <td>{setor.descricao}</td>
                    <td>
                      <button className="btn-secondary"
                        onClick={() => {
                          setFormData(setor);
                          setEditMode('edit');
                          setShowModal(true);
                        }}>Editar</button>
                      <button className="btn-danger"
                        onClick={() => {
                          handleDelete(setor._id);
                        }}>Remover</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalEdit
        visible={showModal} // Change to true to show the modal
        title={editMode === 'edit' ? 'Editar Setor' : 'Novo Setor'}
        fields={fields}
        data={formData} // Initial data for the modal
        onChange={setFormData} // Handle changes in the modal
        onClose={() => {
          setShowModal(false);
          setEditMode('create'); // volta ao estado inicial ao fechar
          setFormData({});
        }} // Handle closing the modal
        onSubmit={handleSubmit} // Handle form submission
      />
    </>
  );
}
