import { UserSchema } from '../model/userModel';
import jwt from 'jsonwebtoken';


export const currentUserDataHelper = async(userId:string)=>{
    try {
        const userdata = await UserSchema.findById({ _id: userId, status: 'active' })
        if (!userdata) {
            console.log("User not found");
            return null; 
          }
          return userdata
    } catch (error) {
        console.log(error);
        
    }
}
export const decodeToken = (token: string, secret: string) => {
    try {
      // Verify and decode the token
      const decodedToken = jwt.verify(token, secret);
  
      // Return decoded token
      return decodedToken;
    } catch (error) {
      throw new Error("Invalid token");
    }
  };




