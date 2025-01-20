const { generateToken } = require('../utils/jwtUtils');

// Exemple d'inici de sessió d'usuari
function loginUser(req, res) {
  const { email, password } = req.body;
  
  // Suposem que has validat l'usuari i la contrasenya correctament
  const userId = 123;  // Exemple d'ID d'usuari

  const token = generateToken(userId);  // Generar el JWT per a l'usuari

  res.json({ token });  // Retornar el token generat
}
