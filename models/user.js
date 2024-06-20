const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

//Defining the Schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    mobile:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
});

//Hashing the password before saving
userSchema.pre('save',async function(next){
    const person=this;

    //Hash the password only if it has been mdified or is new

    if(!person.isModified('password')) return next();   //agar modify hua hai to try function run karo warna next ko call kar do

    try{
        //Hash password generation
        const salt=await bcrypt.genSalt(10);

        //Hash the password
        const hashedPassword=await bcrypt.hash(person.password,salt);
        
        //Replace the password with the hashed password
        person.password=hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
})

//Creating a method for comparing the password
userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        //use bcrypt to compare the provided password with the Hashed password
        const isMatch=await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    }
    catch(err){
        throw err;
    }
}

//Creating person model
const User=mongoose.model('User',userSchema);

//Exporting the model
module.exports=User;