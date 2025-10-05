import multer from 'multer';
import { Request, Response, NextFunction } from "express";


const storage = multer.diskStorage({
    destination: function(req:Request,file:Express.Multer.File,cb :(error:Error | null,destination: string) =>void){
        cb(null,'public/uploads');
    },
    filename: function(req:Request,file: Express.Multer.File,cb: (error: Error | null, filename: string) => void){
        const extArray = file.mimetype.split("/");
        const extension = extArray[extArray.length - 1];
        if (file.mimetype === "audio/mpeg") {
            cb(null, `${Date.now()}.mp3`);
          } 
        else if (file.mimetype === "audio/wave") {
            cb(null, `${Date.now()}.mp3`);
          } 
        else if (file.mimetype === "audio/wav") {
            cb(null, `${Date.now()}.mp3`);
          } 
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // check file type to be doc, or docx
            cb(null, Date.now() + '.docx');
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') { // check file type to be excel
            cb(null, Date.now() + '.xlsx');
        } else if (file.mimetype === 'text/plain') { // check file type to be plain text, txt
            cb(null, Date.now() + '.txt');
        } else if (file.mimetype === 'image/jpeg') { // Handle JPG images
            cb(null, Date.now() + '.jpg');
        } else if (file.mimetype === "application/octet-stream") {
            cb(null, Date.now() + ".mp4");
        } else {
            cb(null, Date.now() + '.' + extension);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 400* 1024 * 1024,
    }
})

function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.json({
                status: 400,
                success: false,
                message: 'File size exceeds the 150 MB limit.',
            });
        }
    } else if (err) {
        console.error('Unexpected error:',`${err.message}`);
        return res.json({
            status: 500,
            success: false,
            message: 'Internal server error multer.',
        });
    }
    next();
}


export { upload ,multerErrorHandler}