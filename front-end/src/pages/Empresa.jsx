import '../styles/styles.css';

import Nav from '../components/Nav';

import { useAuth } from '../context/AuthContext';

import { useEffect, useState } from 'react';
import ModalEdit from '../components/ModalEdit';

import { API_URL } from '../config/api';

export default function Empresa() {
  const [objeto, setObjeto] = useState({});
  const [showModal, setShowModal] = useState(false);

  const { empresa } = useAuth();

  const [editData, setEditData] = useState(empresa.empresa);


  const fields = [
    { label: 'Razão Social', name: 'razaoSocial' },
    { label: 'CNPJ', name: 'cnpj', readOnly: true },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Quantidade de funcionários', name: 'qtdFuncionarios' },
    { label: 'Horário início expediente', name: 'iniExpediente' },
    { label: 'Horário fim expediente', name: 'fimExpediente' },
  ];


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/empresa/${empresa.empresa._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empresa.token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Erro ao atualizar empresa');

      await response.json();

      setObjeto(response);

      setShowModal(false);
      alert('Empresa atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar empresa: ' + error.message);
    }
  };

  return (
    <>
      <Nav />

      <div className="content-background">
        <div className="card">
          <div className="card-header">
            <h2>Informações da empresa</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>CNPJ</th>
                <th>Email</th>
                <th>Qtd. Funcionários</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{empresa.empresa.razaoSocial}</td>
                <td>{empresa.empresa.cnpj}</td>
                <td>{empresa.empresa.email}</td>
                <td>{empresa.empresa.qtdFuncionarios}</td>
                <td>
                  <button className="btn-secondary"
                    onClick={() => {
                      console.log('1234421')
                      setEditData(empresa.empresa);
                      setShowModal(true);
                    }}>Editar</button>
                  <button className="btn-danger">Remover conta</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ModalEdit
        visible={showModal}
        title="Editar Empresa"
        fields={fields}
        data={editData}
        onChange={setEditData}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
