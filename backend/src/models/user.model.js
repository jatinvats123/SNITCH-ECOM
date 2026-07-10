import mongoose from "mongoose";    
import bcrypt from "bcryptjs";



const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    contact:{type:String, required:false},
    password:{type:String, 
        required: function () {
            return !this.googleId;
        }
    },
    fullName:{type:String, required:true},
    role:{
        type:String,
        enum:["buyer", "seller"],
        default:"buyer"
    },
    googleId:{type:String, required:false},
    resetPasswordToken:{type:String, required:false},
    resetPasswordExpires:{type:Date, required:false},
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
})
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
const userModel = mongoose.model("user",
    userSchema);

 export default userModel;   