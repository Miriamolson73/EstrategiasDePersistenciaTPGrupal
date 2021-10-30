const express = require("express");
const jwt = require("jsonwebtoken");
var router = express.Router();




router.get("/", (req , res) => {
    res.json({
        mensaje: "Nodejs and JWT"
    });
});

router.post("/login", (req , res) => {
    const usuario = {
        id: 1,
        nombre : "Pablo",
        apellido: "Marcelli"
    }

    jwt.sign({usuario}, 'llave', {expiresIn: '60s'}, (err, token) => {
        res.json({
            token
        });
    });

});

router.post("/posts", verificarToken, (req , res) => {

    jwt.verify(req.token, 'llave', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            res.json({
                    mensaje: "Usuario Autorizado",
                   // authData
                });
        }
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