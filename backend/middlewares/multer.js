
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, res, callback){
        callback(null, 'uploads/');     // set the desired upload folder
    },
    filename: function(req,file,callback){
        callback(null,file.originalname)
    }
})

const upload = multer({storage});

export default upload;