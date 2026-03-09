import multer from "multer";


const upload=multer({
    dest:"uploads/"
}) // multer  middleware for handeling 

export default upload;