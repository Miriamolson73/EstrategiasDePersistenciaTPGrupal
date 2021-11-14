'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING
  }, {});
 
  //codigo de asociacion  (tiene muchos:)
  carrera.associate = function(models) {
  	carrera.hasMany(models.materias,  // Modelo al que pertenece
    {
      as: 'materia',                 // nombre de mi relacion
      foreignKey: 'id_carrera'       // campo con el que voy a igualar 
    })
  };
  ///////////////////////
  
  return carrera;
};