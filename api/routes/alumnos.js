var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumno
    .findAll({
      attributes: ["id", "nombre", "apellido", "id_materia"],
       /////////se agrega la asociacion 
       include:[{as: 'Materia-Relacionada', model:models.materias, attributes: ["id","nombre"]}]
       ////////////////////////////////
    })
    .then(alumno => res.send(alumno))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, id_materia:req.body.id_materia })
    .then(unAlumno => res.status(201).send({ id: unAlumno.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra/o alumno con el mismo nombre y apellido')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre", "apellido", "id_materia"],
        /////////se agrega la asociacion 
        include:[{as:'Materia-Relacionada', model:models.materias, attributes: ["id","nombre"]}],
        ////////////////////////////////
 
      where: { id }
    })
    .then(unAlumno => (unAlumno ? onSuccess(unAlumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: unAlumno => res.send(unAlumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});
// solamente update con token ////////////////////////////
router.put("/:id",verificarToken, (req, res) => {
  //*********************** */
  const onSuccess = unAlumno =>
    unAlumno
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra/o alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
      ////**////

  jwt.verify(req.token, 'llave', (error, authData) => {
    if(error){
        res.sendStatus(403);
    }else{
         res.json({
                mensaje: "Usuario Autorizado",    
                observacion: "Se modifico el usuario",         
              
              
              
                // authData
            }); 
            findAlumno(req.params.id, {
              onSuccess,
              onNotFound: () => res.sendStatus(404),
              onError: () => res.sendStatus(500)
            });
    }
  
    
});
});
router.delete("/:id", (req, res) => {
  const onSuccess = unAlumno =>
    unAlumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

//******************************** */
// antes de iniciar el update tiene que solicitar clave a /alu/login
router.post("/login", (req , res) => {
  const usuario = {
      id: 1,
      nombre : "Pablo",
      apellido: "Marcelli"
  }

  jwt.sign({usuario}, 'llave', {expiresIn: '300s'}, (err, token) => {
      res.json({
          token
      });
  });
});

  function verificarToken(req, res, next){
    const bearerHeader =  req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){
         const bearerToken = bearerHeader.split(" ")[1];
         req.token  = bearerToken;
         next();
    }else{
        res.sendStatus(403);
    }
}



module.exports = router;