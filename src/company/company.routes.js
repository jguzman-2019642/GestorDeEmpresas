'use strict'

import  express  from "express"
import {
    add,
    update,
    orderAZ
    } from './company.controller.js'
import { validateJwt } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas privadas
api.post('/add', [validateJwt], add)
api.post('/update/:id', [validateJwt], update)
api.get('/orderAZ', orderAZ)


export default api
