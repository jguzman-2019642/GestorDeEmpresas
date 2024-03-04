'use strict' 

import User from './user.model.js'
import { generateJwt } from '../utils/jwt.js'
import {
    encrypt,
    checkPassword,
    checkUpdateUser
} from '../utils/validator.js'

export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}


export const register = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) return res.status(400).send({ message: 'Username is alredy in use' })
        data.password = await encrypt(data.password)
        data.role = 'ADMIN'//Asignar rol por defecto
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

export const login = async (req, res) => {
    try {
        let { usernameOrEmail, password } = req.body
        let users = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });
        if (users && await checkPassword(password, users.password)) {
            let loggedUser = {
                uid: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
            }
            let token = await generateJwt(loggedUser)
            return res.send(
                {
                    message: `Welcome ${loggedUser.name}`,
                    loggedUser,
                    token
                }
            )
        }
        return res.status(404).send({ message: 'Invalid credentials' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

export const update = async (req, res) => {
    try {
        let data = req.body;
        let { id } = req.params
        let uid = req.user._id
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) return res.status(400).send({ message: 'Username is alredy in use' })
        let updated = checkUpdateUser(data, id)
        if(id != uid) return  res.status(401).send({ message: 'you can only update your account' })
        if (!updated) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updatedUsers = await User.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updatedUsers) return res.status(401).send({ message: 'User not found and not updated' })
        return res.send({ message: 'Updated user', updatedUsers })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating user .', err: err });
    }
}

export const editMyPassword = async (req, res) => {
    try{
        let {oldPassword, newPassword } = req.body
        let { id } = req.params
        let uid = req.user._id

        if (id != uid) return res.status(401).send({ message: 'You can only update your own account' });

        let user = await User.findOne({_id: id})
        if(!user) return res.status(404).send({message: 'User not found'})

        let rightOldPassword = await checkPassword(oldPassword, user.password)
        if(!rightOldPassword) return res.status(400).send({message: 'Incorrect old password'})
        if(oldPassword === newPassword) return res.status(500).send({message: 'enter a password different from the previous one'});
        
        let updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { password: await encrypt(newPassword) },
            { new: true }
        )
        if (!updatedUser) return res.status(404).send({ message: 'User not found or password not updated' })
        return res.send({ message: 'Password updated successfully', updatedUser })
    }catch(err){
        console.error(err);
        return res.status(500).send({ message: 'Error updating password', err: err });
    }
}
export const deleteU = async(req, res)=>{
    try{
        //Obtener el Id
        let { id } = req.params
        //Validar si está logeado y es el mismo X No lo vemos hoy X
        //Eliminar (deleteOne (solo elimina no devuelve el documento) / findOneAndDelete (Me devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id}) 
        //Verificar que se eliminó
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not deleted'})
        //Responder
        return res.send({message: `Account with username ${deletedUser.username} deleted successfully`}) //status 200
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting account'})
    }
}