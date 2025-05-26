import '../styles/styles.css';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import Nav from '../components/Nav';
import ModalEdit from '../components/ModalEdit';

import { API_URL } from '../config/api';

export default function Funcionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [setorOptions, setSetorOptions] = useState([]);
  const [editMode, setEditMode] = useState('create');

  const { empresa, loading } = useAuth();

  const fields = [
    { label: 'Nome', name: 'nome' },
    { label: 'Apelido', name: 'apelido' },
    { label: 'Matrícula', name: 'matricula', readOnly: editMode === 'edit' },
    { label: 'Email', name: 'email' },
    { label: 'Telefone', name: 'telefone', type: 'tel' },
    { label: 'Setor', name: 'setor', type: 'select', options: setorOptions || [] }
  ]

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
        setSetorOptions(data);
      } catch (err) {
        alert(err.message);
      }
    };
    fetchSetores();

    const fetchFuncionarios = async () => {
      try {
        const res = await fetch(`${API_URL}/api/empresa/${empresa.empresa._id}/funcionario`, {
          headers: {
            Authorization: `Bearer ${empresa.token}`,
          },
        });

        if (!res.ok) throw new Error('Erro ao carregar funcionários');

        const data = await res.json();
        setFuncionarios(data);
      } catch (err) {
        alert(err.message);
      }
    };

    fetchFuncionarios();
  }, [empresa, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const editUrl = editMode === 'create' ? `${API_URL}/api/pessoa` : `${API_URL}/api/pessoa/${formData._id}`;

    try {
      const response = await fetch(editUrl, {
        method: editMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empresa.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Erro ao ${editMode === 'edit' ? 'atualizar' : 'criar'} funcionário`);

      const savedFuncionario = await response.json();

      if (editMode === 'create') {
        setFuncionarios((prev) => [...prev, savedFuncionario]);
      } else {
        setFuncionarios((prev) =>
          prev.map((f) => (f._id === savedFuncionario._id ? savedFuncionario : f))
        );
      }

      setShowModal(false);
      alert(`Funcionário ${editMode === 'edit' ? 'atualizada' : 'cadastrada'} com sucesso!`);
    } catch (error) {
      alert('Erro ao cadastrar empresa: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    console.log('Removendo funcionário com ID:', id);
    if (!window.confirm('Tem certeza que deseja remover este funcionário?')) return;

    try {
      const response = await fetch(`${API_URL}/api/pessoa/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${empresa.token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao remover funcionário');

      setFuncionarios(funcionarios.filter((funcionario) => funcionario._id !== id));
      alert('Funcionário removido com sucesso!');
    } catch (error) {
      alert('Erro ao remover funcionário: ' + error.message);
    }
  }

  return (
    <>
      <Nav />

      <div className="content-background">
        <div className="card">
          <div className="card-header">
            <h2>Funcionários</h2>
            <button className="btn-primary"
              onClick={(e) => {
                setFormData({
                  nome: '',
                  apelido: '',
                  matricula: '',
                  email: '',
                  setor: '',
                  telefone: { numero: '' }, // <- aqui é o ponto
                });
                setShowModal(true);
                setEditMode('create')
              }}>Novo Funcionário</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Apelido</th>
                <th>Matrícula</th>
                <th>Setor</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum funcionário encontrado</td>
                </tr>
              ) : (
                funcionarios.map((funcionario) => (
                  <tr key={funcionario._id}>
                    <td>{funcionario.nome}</td>
                    <td>{funcionario.apelido}</td>
                    <td>{funcionario.matricula}</td>
                    <td>{funcionario.setor.descricao}</td>
                    <td>{funcionario.email}</td>
                    <td>{funcionario.telefone?.numero || 'N/A'}</td>
                    <td>
                      <button className="btn-secondary"
                        onClick={() => {
                          setFormData(funcionario);
                          setEditMode('edit');
                          setShowModal(true);
                        }}>Editar</button>
                      <button className="btn-danger"
                        onClick={() => {
                          handleDelete(funcionario._id);
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
        visible={showModal}
        title={editMode === 'edit' ? 'Editar Funcionário' : 'Novo Funcionário'}
        fields={fields}
        data={formData} // Initial data for the modal
        onChange={setFormData} // Handle changes if needed
        onClose={() => {
          setShowModal(false);
          setEditMode('create'); // volta ao estado inicial ao fechar
          setFormData({});
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
