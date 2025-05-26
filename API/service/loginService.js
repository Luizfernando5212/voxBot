import jwt from 'jsonwebtoken';
import Empresa from '../model/empresa.js';

const login = async (req, res) => {
  console.log('Login request received');
  const { email, password } = req.body;
  const alg = { algorithm: 'HS256' };

  const message = 'Invalid email/password.';

  try {
    const empresa = await Empresa.findOne({ email });

    console.log(empresa);

    if (!empresa) {
      return res.status(401).json({ message });
    }

    const senhaConfere = await empresa.comparePassword(password);

    if (!senhaConfere) {
      return res.status(401).json({ message });
    }

    console.log('Password matched for email:', email);
    const token = jwt.sign({ id: empresa._id }, process.env.JWT_SECRET, alg);
    return res.status(200).json({ token, empresa });

  } catch (err) {
    console.error('Erro durante o login:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export default login;