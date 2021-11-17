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

// paginacion

router.get("/pag", (req, res) => {

  const pagina = parseInt(req.query.nPagina)
  const cantidadElementos = parseInt(req.query.nElementos)  

  models.alumno
    .findAll({
      attributes: ["id", "nombre", "apellido", "id_materia"],
       /////////se agrega la asociacion 
       include:[{as: 'Materia-Relacionada', model:models.materias, attributes: ["id","nombre"]}],
       ////////////////////////////////

       offset:(pagina -1 ) * cantidadElementos, // desde donde hasta donde en cada pag
       limit: cantidadElementos

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


// solamente update con token 
//Si el token esta verificado, puedo realizar el cambio
//y el 'put' solo funciona generando previamente el token
router.put("/:id",verificarToken, (req, res) => {
  
  const onSuccess = unAlumno =>
    unAlumno
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.send(`Usuario autorizado y cambio de nombre a ${req.body.nombre} ${unAlumno.apellido} realizado`))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra/o alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
      
      // con esta funcion se verifica que el token generado sea el correcto
      //si eso sucede , se llama a 'findAlumno' y se ejecuta la lógica del cambio a realizar 
  jwt.verify(req.token, 'llave', (error, authData) => {
    if(error){
        res.sendStatus(403);
    }else{
       
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
      .then(() => res.status(200).send(`Alumno dado de baja id: ${unAlumno.id}, apellido: ${unAlumno.apellido} nombre :${unAlumno.nombre}`))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


//Esta funcion general el token con los datos de usuario ingresados
// antes de iniciar el update tiene que solicitar clave a /alu/login 
//para poder realizar algun cambio
router.post("/login", (req , res) => {
  const usuario = {
      id: 1,
      nombre : "Pablo",
      apellido: "Marcelli"
  }

  //genera el token con los datos que vienen de 'usuario' y se configura el tiempo de vencimiento
  jwt.sign({usuario}, 'llave', {expiresIn: '300s'}, (err, token) => {
      res.json({
          token
      });
  });
});

  //
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