import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusegredoaqui'; // sua chave secreta para JWT

// Middleware para validar token e pegar dados do usuário
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer TOKEN
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    console.log(user)
    req.user = user; // dados decodificados do token, ex: { empresaId: '...', email: '...' }
    next();
  });
}

export default authenticateToken;
