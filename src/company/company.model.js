import {Schema, model} from 'mongoose'

const companySchema = Schema({
    name: {
        type: String,
        require: [true, "User or company is require"]
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "category",
        require: [true, "Category is require"]
    },
    level: {
        type: String,
        require: [false, "Level of impact is require"]
    },
    age: {
        type: Number,
        require: [true, "age is require"]
    }
},{
    versionKey: false
})

export default model('company', companySchema)