'use strict';

module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});
  alumno.associate = function(models) {
    // associations can be defined here
    alumno.belongsTo(models.materias,
      {
        as : 'Materia-Relacionada',
        foreignKey: 'id_materia'

      })
  };
  return alumno;
};


