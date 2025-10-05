import express from "express";
 const router = express.Router();
import superAdmin from "../router/superAdminRouter"; 
import admin from "../router/adminRouter"; 
import user from "../router/userRouter"; 

 router.use('/superAdmin', superAdmin);
 router.use('/admin', admin);
 router.use('/user', user);

 export = router;
