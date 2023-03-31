const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(express.static(path.join(__dirname + "/public")))

const PORT = process.env.PORT || 5000;

//mongodb connection
mongoose.set("strictQuery", false);
mongoose
.connect(process.env.MONGODB_URL)
  .catch((error) => console.log(error));

mongoose.connection.on("connected", () => {
  console.log("connected to Database");
  app.listen(PORT, () => console.log("server is running at port :" + PORT));
});

mongoose.connection.on("error", (error) => {
  console.log(error);
});

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

const userModel = mongoose.model("user", userSchema);

// API
app.get("/", (req, res) => {
  res.send("Server is running");
});

// api signup
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  try {
    const result = await userModel.findOne({ email: email });
    if (result) {
      res.send({ message: "Email id is already registered" });
    } else {
      const data = new userModel(req.body);
      await data.save();
      res.send({ message: "Successfully SignUp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// api login
app.post("/login", async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
      const result = await userModel.findOne({ email: email });
      if (result && result.password === password) {
        const dataSend = {
          _id: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          image: result.image,
        };
        console.log(dataSend);
        res.send({ message: "Login is successfully", alert: true, data: dataSend });
      } else {
        res.status(400).send({ message: "Invalid email or password", alert: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });
  //save product in data through api
 app.post("/uploadProduct", async(req,res) => {
  console.log(req.body);
  const data = await productModel(req.body)
  const datasave = await data.save()
  res.send({message : "Upload successfully"})
 })   
 //get product data
 app.get("/product", async (req, res) => {
  try {
    const data = await productModel.find({});
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
 
 // product section
 const schemaProduct = mongoose.Schema({
       name: String,
       category: String,
       image: String,
       price: String,
       description: String,
 }) 
 const productModel = mongoose.model("product", schemaProduct)

//  deploy heroku
if(process.env.NODE_ENV = "production") {
   app.use(express.static("public/build"));
}