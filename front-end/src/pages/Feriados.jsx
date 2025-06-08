import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import Nav from '../components/Nav';
import ModalEdit from '../components/ModalEdit';
import { useAuth } from '../context/AuthContext';


export default function Feriados() {
  const [feriados, setFeriados] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [data, setData] = useState('');
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState('create');
  // const [loading, setLoading] = useState(false);

  const { empresa, loading } = useAuth();


  const fetchFeriados = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/${empresa.empresa._id}/feriado`, {
        headers: {
          Authorization: `Bearer ${empresa.token}`,
        },
      });

      if (!res.ok) throw new Error('Erro ao carregar feriados');

      const data = await res.json();
      setFeriados(data);
    } catch (error) {
      alert('Erro ao carregar feriados: ' + error.message);
    }
  };

  useEffect(() => {
    if (loading || !empresa) return;

    fetchFeriados();
  }, [empresa, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editMode === 'edit' ? 'PUT' : 'POST';
    const url = editMode === 'edit'
      ? `${API_URL}/api/feriado/${formData._id}`
      : `${API_URL}/api/feriado`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empresa.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao salvar feriado');

      await fetchFeriados();
      alert(editMode === 'edit' ? 'Feriado atualizado!' : 'Feriado cadastrado!');

      setShowModal(false);
      setFormData({});
      setEditMode('create');
    } catch (error) {
      alert(error.message);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este feriado?')) return;


    console.log('Removendo feriado com ID:', id);
    try {
      const response = await fetch(`${API_URL}/api/feriado/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${empresa.token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao remover feriado');

      setFeriados(feriados.filter((feriado) => feriado._id !== id));
      alert('Feriado removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      alert('Erro ao remover feriado: ' + error.message);
    }
  }


  return (
    <>
      <Nav />

      <div className="content-background">
        <div className="card">
          <div className="card-header">
            <h2>Feriados</h2>
            <button className="btn-primary" onClick={(e) => {
              e.preventDefault();
              console.log('Clicou no botão Novo feriado');
              setFormData({ descricao: '', data: '', empresa: empresa.empresa._id });
              setEditMode('create');
              setShowModal(true);
            }}>Novo feriado</button>
          </div>

          {loading ? (
            <p>Carregando feriados...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody colSpan="6" style={{ textAlign: 'center' }}>
                {feriados.map((f) => (
                  <tr key={f._id}>
                    <td>{f.descricao}</td>
                    <td>{(() => {
                      const d = new Date(f.data);
                      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                      return d.toLocaleDateString('pt-BR'); 
                    })()}
                    </td>
                    <td>
                      <button className="btn-secondary"
                        onClick={() => {
                          setFormData(f);
                          setEditMode('edit');
                          setShowModal(true);
                        }}>Editar</button>
                      <button className="btn-danger"
                        onClick={() => {
                          console.log('Clicou no botão Remover feriado', f._id);
                          handleDelete(f._id);
                        }}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ModalEdit
        visible={showModal} // Change to true to show the modal
        title={editMode === 'edit' ? 'Editar feriado' : 'Novo feriado'}
        fields={[
          { label: 'Descrição', name: 'descricao', type: 'text' },
          { label: 'Data', name: 'data', type: 'date' },
        ]}

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
