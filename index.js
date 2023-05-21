const bcrypt = require('bcrypt');
const express = require('express');
const User = require("./userModel")
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const os = require('os')




const PORT = 5000;
const atlas_uri='mongodb+srv://Abhay:QKPPHvFQosLXigNb@cluster1.qotn8n8.mongodb.net/?retryWrites=true&w=majority'
app.use(express.json());
app.use(cors({
    origin: '*'
}));



//connecting to mongodb
const connectDb = async () => {
  await mongoose.connect(atlas_uri).then(
    () => {
        console.log(`USER SERVICE DATABASE CONNECTED`) 
    },
    error => {
        console.error(`Connection error: ${error.stack}`)
        process.exit(1)
    }
)
}
connectDb().catch(error => console.error(error))


//Welcome endpoint 
app.get('/',(req,res)=>{
  try{
    res.status(200).json({msg:"Welcome",hostname:os.hostname()})
  }catch(err){
    res.status(500).json({msg:"error"})
  }
})

//Register User

app.post("/user/register",async(req,res)=>{
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})



//List all users
app.get("/user/list",async(req,res)=>{
  const user_list = await User.find({},'firstName lastName email -_id');
  return res.status(200).send({"users":user_list});
})

//List email of users
app.get("/user/email",async(req,res)=>{
	const email_list = await User.find({},'email -_id');
	return res.status(200).send({"emails":email_list});
})


//Delete a user 
app.delete('/user/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});


//update a user
app.patch('/user/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName','email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});





app.listen(PORT,()=>{

  console.log(`SERVICE IS RUNNING ON PORT - ${PORT}`)
})
