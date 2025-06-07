import jwt from 'jsonwebtoken';
import Empresa from '../model/empresa.js';

const login = async (req, res) => {
  console.log('Login request received');
  const { email, password } = req.body;
  const alg = { algorithm: 'HS256' };

  const message = 'Invalid email/password.';

  try {
    const empresa = await Empresa.findOne({ email });

    if (!empresa) {
      return res.status(401).json({ message });
    }
    console.log(empresa)
    
    const senhaConfere = await empresa.comparePassword(password);
    
    console.log(senhaConfere)
    
    if (!senhaConfere) {
      return res.status(401).json({ message });
    }
    
    const token = jwt.sign({ id: empresa._id }, process.env.JWT_SECRET, alg);

    console.log(token)
    
    return res.status(200).json({ token, empresa });

  } catch (err) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error:err});
  }
};

export default login;
