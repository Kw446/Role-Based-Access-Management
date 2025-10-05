import express from 'express';
import { login,updateUser,changePasswordByUserProfile,recoveryEmailPasswordByUser,setnewForgetPasswordBylinkByUser, getUserById, uploadFile} from '../controller/userController';
import { userAuth } from '../middelware/auth';
import { asyncHandler } from '../utils/asycnHyndler';
import { upload } from '../middelware/multer';
 
const router = express.Router();

router.post('/login', asyncHandler(login));
router.get('/get-user-by-id', asyncHandler(userAuth), asyncHandler(getUserById));
router.put('/update-user',asyncHandler(userAuth), asyncHandler(updateUser));
router.put('/change-password-by-user',asyncHandler(userAuth), asyncHandler(changePasswordByUserProfile));
router.post('/recovery-email-password-by-user', asyncHandler(recoveryEmailPasswordByUser));
router.put('/set-new-by-link-password-by-user',asyncHandler(setnewForgetPasswordBylinkByUser));

router.post('/upload', upload.fields([{name: 'uploadGallery',maxCount: 10}]), asyncHandler(uploadFile));

export default router;

