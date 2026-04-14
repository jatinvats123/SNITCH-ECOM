import mongoose from "mongoose";    



const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    contact:{type:String, required:true},
    password:{type:String, required:true},
    fullName:{type:String, required:true},
    role:{
        type:String,
        enum:["buyer", "seller"],
        default:"buyer"
    }
})

userSchema.pre("save"),async function(next){
    if(!this.isModified("password"))return;
   

     const hash = await bcrypt.hash(this.password,10);
        this.password = hash;
}
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
const userModel = mongoose.model("user",
    userSchema);

 export default userModel;   