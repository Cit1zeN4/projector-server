/* eslint-disable security/detect-non-literal-fs-filename */
const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const mime = require('mime')
const storage = require('../../config/multerStorage')
const File = require('../../model/File')

const router = express.Router()
const upload = multer({ storage: storage })

// GET /private/files/

router.get('/', (req, res, next) => {
  File.findAll()
    .then((files) => {
      if (files.length !== 0) res.status(200).json(files)
      else res.status(404).json({ message: `Can't found files` })
    })
    .catch((err) => {
      next(err)
    })
})

// GET /private/files/:id

router.get('/:id', (req, res, next) => {
  File.findByPk(req.params.id)
    .then((file) => {
      if (file === null)
        res
          .status(404)
          .json({ message: `Can't find file with id: ${req.params.id}` })
      res.status(200).json(file)
    })
    .catch((err) => {
      next(err)
    })
})

// GET /private/files/:id/content

router.get('/:id/content', (req, res, next) => {
  File.findByPk(req.params.id)
    .then((file) => {
      if (file === null) {
        res
          .status(404)
          .json({ message: `Can't find file with id: ${req.params.id}` })
      } else {
        res.sendFile(path.normalize(`${__dirname}/${file.filePath}`))
      }
    })
    .catch((err) => {
      next(err)
    })
})

// POST /private/files/

router.post('/', upload.single('file'), (req, res, next) => {
  File.create({
    fileName: req.file.filename,
    fileType: mime.getExtension(req.file.mimetype),
    filePath: path.normalize(req.file.path),
  })
    .then((file) => {
      res.json({ message: `File was uploaded successfully`, file })
    })
    .catch((err) => {
      next(err)
    })
})

// PUT /private/files/:id/content
// File content is updated by replacing the old file with a new one.
// Sorry i'm beginner and i don't know how to do it better ¯\_(ツ)_/¯.

router.put('/:id/content', upload.single('file'), (req, res, next) => {
  File.findByPk(req.params.id).then((file) => {
    if (file === null)
      res
        .status(404)
        .json({ message: `Can't find file with id: ${req.params.id}` })

    fs.promises
      .unlink(path.normalize(`${process.env.SERVER_DIR}/${file.filePath}`))
      .then(() => {
        file
          .update({
            fileName: req.file.filename,
            fileType: mime.getExtension(req.file.mimetype),
            filePath: req.file.path,
          })
          .then((result) => {
            res.json({ message: 'File was updated successfully', file: result })
          })
          .catch((err) => {
            Promise.all(
              fs.promises.unlink(
                path.normalize(`${process.env.SERVER_DIR}/${file.filePath}`)
              ),
              fs.promises.unlink(
                path.normalize(`${process.env.SERVER_DIR}/${req.file.path}`)
              )
            ).then(() => {
              next(err)
            })
          })
      })
      .catch((err) => {
        fs.promises
          .unlink(path.normalize(`${process.env.SERVER_DIR}/${req.file.path}`))
          .then(() => {
            next(err)
          })
      })
  })
})

// PUT /private/files/:id/
// Update only file name.

router.put('/:id', (req, res, next) => {
  File.findByPk(req.params.id).then((file) => {
    if (file === null)
      res
        .status(404)
        .json({ message: `Can't find file with id: ${req.params.id}` })
    file
      .update({
        fileName: req.body.filename,
      })
      .then((result) => {
        res
          .status(200)
          .json({ message: 'File name was updated successfully', file: result })
      })
      .catch((err) => {
        next(err)
      })
  })
})

// DELETE /private/files/:id

router.delete('/:id', (req, res, next) => {
  File.findByPk(req.params.id).then((file) => {
    if (file === null)
      res
        .status(404)
        .json({ message: `Can't find file with id: ${req.params.id}` })

    const filePath = path.normalize(
      `${process.env.SERVER_DIR}/${file.filePath}`
    )

    fs.promises
      .stat(filePath)
      .then(() => {
        fs.promises
          .unlink(filePath)
          .then(() => {
            file.destroy().then(() => {
              res.json({ message: `File was deleted successfully` })
            })
          })
          .catch((err) => {
            next(err)
          })
      })
      .catch(() => {
        file.destroy().then(() => {
          res.status(200).json({
            message: `Db record was deleted successfully, but file was not found`,
          })
        })
      })
  })
})

module.exports = router
