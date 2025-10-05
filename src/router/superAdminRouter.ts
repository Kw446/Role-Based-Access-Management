import express from "express";
// import {auth}  from "../middelware/auth";
import  { createAdminBySuperAdmin,updateAdminBySuperAdmin,deleteAdminBySuperAdmin,getSuperAdminById,getAllAdminsBySuperAdmin,updateAdminStatusBySuperAdmin, getAdminIdBySuperAdmin}  from "../controller/superAdminController";
import { asyncHandler } from '../utils/asycnHyndler';
import { superAdminAuth } from '../middelware/auth';

const router = express.Router();

router.get('/get-superadmin-by-id', asyncHandler(superAdminAuth), asyncHandler(getSuperAdminById));
router.get('/get-admin-by-id-by-superadmin-by-id', asyncHandler(superAdminAuth), asyncHandler(getAdminIdBySuperAdmin));
router.post("/create-admin-by-super-admin",asyncHandler(superAdminAuth),asyncHandler(createAdminBySuperAdmin));
 router.put('/update-admin-by-super-admin/:user_id',asyncHandler(superAdminAuth), asyncHandler(updateAdminBySuperAdmin));
 router.delete('/delete-admin-by-super-admin/:user_id',asyncHandler(superAdminAuth), asyncHandler(deleteAdminBySuperAdmin));
 router.get("/get-All-admins-by-super-admin",asyncHandler(superAdminAuth), asyncHandler(getAllAdminsBySuperAdmin));
 router.put('/update-admin-status-by-superadmin/:user_id', asyncHandler(superAdminAuth), asyncHandler(updateAdminStatusBySuperAdmin));
 export = router; 
 
 