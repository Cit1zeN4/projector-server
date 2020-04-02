const Sequelize = require('sequelize')
const db = require('../../db/database')
const Role = require('./Role')
const AdditionalContact = require('./AdditionalContact')

const User = db.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    surname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    middleName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    photoLink: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
)

Role.hasOne(User)
User.belongsTo(Role)
User.belongsToMany(AdditionalContact, { through: 'user_additionalContact' })
AdditionalContact.belongsToMany(User, { through: 'user_additionalContact' })

module.exports = User
