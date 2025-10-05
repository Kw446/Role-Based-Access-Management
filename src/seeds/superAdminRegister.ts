import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserSchema } from "../model/userModel";
import bcrypt, { hashSync, genSaltSync } from "bcrypt";
 
dotenv.config();
 
const dataBody = {
user_name: "Superadmin",
  email: "Superadmin@Yopmail.com",
  designation:"head",
  password: "123456",
  status: "active",
  role: "super",
  employee_code:"001",
  name_of_site:"pharma_wire"
};
 
const seedAdmin = async () => {
  const salt = genSaltSync(12);
  const hashedPassword = hashSync(dataBody.password, salt);
  dataBody.password = hashedPassword;
 
  const isAlreadyExist = await UserSchema.findOne({ email: dataBody.email });
 
  if (!isAlreadyExist) {
    const addSuperadmin = await new UserSchema(dataBody).save();
    if (addSuperadmin) {
      console.log("Superadmin created successfully");
    } else {
      console.error("Error in adding superadmin");
    }
  } else {
    console.log("User email already exists");
  }
 
  mongoose.connection.close();
};
 
const mongoUrl = process.env.DB_NAME;
if (!mongoUrl) {
  console.error(" MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
    seedAdmin();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });