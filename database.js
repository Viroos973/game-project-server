const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('gameDB', 'postgres', 'root973', {
    host: 'localhost',
    dialect: 'postgres',
});

sequelize.authenticate()
    .then(() => {
        console.log('The connection to the database has been successfully established.');
    })
    .catch(err => {
        console.error('Couldn\'t connect to the database:', err);
    });

module.exports = sequelize;