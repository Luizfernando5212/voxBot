import { useNavigate } from "react-router-dom";

export default function Nav() {
     const navigate = useNavigate();

    const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src="/assets/voxbot_logo_branco.png" alt="Logo" className="logo-navbar" />
                {/* <a href="/planos">Planos</a> */}
                <a href="/empresa">Empresa</a>
                <a href="/setor">Setor</a>
                <a href="/funcionario">Funcionário</a>
            </div>
            <div className="navbar-right">
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
            </div>
        </nav>
    )
};