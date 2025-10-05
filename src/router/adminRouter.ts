import express from "express";
import  {createUserByAdmin,updateUserByAdmin,deleteUserByAdmin,changePasswordByAdminProfile,updateUserStatusByAdmin, getAllUsersByAdmin, recoveryEmailPasswordByAdmin, setnewForgetPasswordBylinkByAdmin,getAdminById, changePasswordUsingToken,getStatusAndTemp_passwordByToken, getUserByIdByAdmin, createAdminByAdmin}  from "../controller/adminController";
import { asyncHandler } from '../utils/asycnHyndler';
import { adminAuth } from '../middelware/auth';

const router = express.Router();

 router.get('/get-admin-by-id', asyncHandler(adminAuth), asyncHandler(getAdminById));
 router.get('/get-user-id-by-admin', asyncHandler(adminAuth), asyncHandler(getUserByIdByAdmin));
 router.post('/create-user-by-admin',asyncHandler(adminAuth), asyncHandler(createUserByAdmin));
 router.post('/update-user-by-admin/:user_id',asyncHandler(adminAuth), asyncHandler(updateUserByAdmin));
 router.delete('/delete-user-by-admin/:user_id',asyncHandler(adminAuth), asyncHandler(deleteUserByAdmin));
 router.put('/change-password-by-admin',asyncHandler(adminAuth), asyncHandler(changePasswordByAdminProfile));
 router.post('/recovery-email-password-by-admin', asyncHandler(recoveryEmailPasswordByAdmin));
 router.put('/set-new-by-link-password-by-admin',asyncHandler(setnewForgetPasswordBylinkByAdmin));
 router.get("/get-All-users-by-admin",asyncHandler(adminAuth), asyncHandler(getAllUsersByAdmin));
 router.put('/update-user-status-by-admin/:user_id',asyncHandler(adminAuth), asyncHandler(updateUserStatusByAdmin));
 router.put('/change-password-by-token',asyncHandler(changePasswordUsingToken)); //for email
 router.get('/get-status-and-temp_password-by-token',asyncHandler(getStatusAndTemp_passwordByToken)); //for email
 router.post('/create-admin-by-admin',asyncHandler(adminAuth), asyncHandler(createAdminByAdmin));

 export = router; 