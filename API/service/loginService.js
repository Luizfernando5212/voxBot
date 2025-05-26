import jwt from 'jsonwebtoken';
import Empresa from '../model/empresa.js';

const login = async (req, res) => {
    console.log('Login request received');
    const { email, password } = req.body;

    const alg = { algorithm: 'HS256' };

    var message = 'Invalid email/password.';
    const empresa = await Empresa.findOne({ email: email });

    if (empresa) {
        try {
            if (await empresa.comparePassword(password)) {
                const token = jwt.sign({ id: empresa._id }, process.env.JWT_SECRET, alg);
                res.status(200).json({ token, empresa });
            } else {
                res.status(401).json({ message: message })
            }
        } catch (err) {
            res.status(401).json()
        }
    } else {
        res.status(401).json({ message: message })
    }
}

export default login;