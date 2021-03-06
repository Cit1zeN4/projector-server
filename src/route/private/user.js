const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../../model/User')
const Role = require('../../model/Role')
const checkRole = require('../../middleware/checkRole')
const Project = require('../../model/Project')

const router = express.Router()

// GET /private/users/

router.get(
  '/',
  checkRole(['user', 'admin', 'manager']),
  async (req, res, next) => {
    try {
      const users = await User.findAll({ include: [Role] })
      if (users.length === 0)
        res.status(404).json({ message: `Can't find users` })
      res.json(users)
    } catch (err) {
      next(err)
    }
  }
)

// GET /private/users/:id

router.get(
  '/:id',
  checkRole(['user', 'admin', 'manager']),
  (req, res, next) => {
    User.findByPk(req.params.id)
      .then((user) => {
        if (user === null)
          res
            .status(404)
            .json({ message: `Can't find user with id: ${req.params.id}` })
        res.status(200).json(user)
      })
      .catch((err) => {
        next(err)
      })
  }
)

// POST /private/users/
// TODO: the handler needs refactoring

router.post('/', checkRole(['admin']), async (req, res, next) => {
  Role.findByPk(req.body.roleId)
    .then((role) => {
      if (role === null)
        res
          .status(404)
          .json({ message: `Can't find role with id: ${req.body.roleId}` })

      const slat = bcrypt.genSaltSync()
      const hash = bcrypt.hashSync(req.body.password, slat)

      User.create({
        firstName: req.body.firstName,
        surname: req.body.surname,
        middleName: req.body.middleName,
        email: req.body.email,
        password: hash,
        photoLink: req.body.photoLink,
        roleId: role.id,
      })
        .then((user) => {
          res.json({
            message: 'User was added successfully',
            user: {
              firstName: user.firstName,
              surname: user.surname,
              middleName: user.middleName,
              email: user.email,
              photoLink: user.photoLink,
              roleId: user.roleId,
            },
          })
        })
        .catch((err) => {
          next(err)
        })
    })
    .catch((err) => {
      next(err)
    })
})

// DELETE /private/users/:id

router.delete('/:id', checkRole(['admin']), (req, res, next) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      if (user) res.json({ message: `User was deleted successfully ` })
      else
        res
          .status(404)
          .json({ message: `Can't find user with id: ${req.params.id}` })
    })
    .catch((err) => {
      next(err)
    })
})

// PUT /private/users/:id

router.put(
  '/:id',
  checkRole(['user', 'admin', 'manager']),
  (req, res, next) => {
    console.log(`${req.decoded.id} - ${req.params.id}`)
    if (['user', 'manager'].some((role) => role === req.decoded.role))
      if (Number(req.decoded.id) !== Number(req.params.id)) {
        res.status(423).json({
          error: 'PermissionError',
          message: `User with role: ${req.decoded.role} don't have permission`,
        })
      }

    User.findByPk(req.params.id).then((user) => {
      if (user === null)
        res
          .status(404)
          .json({ message: `Can't find user with id: ${req.params.id}` })
          .end()

      user
        .update(req.body)
        .then((result) => {
          const updatedUser = result
          updatedUser.password = undefined
          res.json({
            message: `User was updated successfully`,
            user: updatedUser,
          })
        })
        .catch((err) => {
          next(err)
        })
    })
  }
)

module.exports = router
