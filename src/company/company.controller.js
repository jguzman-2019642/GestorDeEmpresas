'use strict'

import Company from './company.model.js'
import { checkUpdate } from '../utils/validator.js'


export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test function is running' })
}

export const add = async (req, res) => {
    try {
        let data = req.body
        let company = new Company(data)
        await company.save()

        return res.send({ message: 'company or usuario saved successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error saving company' })
    }
}


export const update = async(req, res)=>{
    try {
        let { id } = req.params
        let data = req.body
        let uid = req.user._id

        let update = checkUpdate(data, id)
        let company = await Company.findOne({_id: id, user: uid})
        if(!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data'})
        let updateCompany = await Company.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
            )
        if(!updateCompany) return res.status(401).send({message: 'COmpany not found and not update'})        
        return res.send({ message: 'Company updated successfully ', updateCompany })
   
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating Company', err: err})
    }
}

export const orderAZ = async (req, res) => {
    try {
        let companies = await Company.find().sort({name: 1})
        return res.send({ companies })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error ordening companies' })
    }
}
