const documentRepository =
    require("./document.repository");

const path = require("path");


class DocumentService {



    async createDocument({
        file,
        userId,
        visibility = "private"
    }) {


        if (!file) {

            throw new Error(
                "File is required"
            );

        }



        // multer file example:
        //
        // file:
        // {
        //   originalname:"photo.png",
        //   filename:"abc.png",
        //   path:"uploads/abc.png",
        //   mimetype:"image/png",
        //   size:12345
        // }



        const extension =
            path.extname(file.originalname)
                .replace(".", "");
        console.log(extension, file.mimetype);



        let mediaType = "other";



        if (file.mimetype.startsWith("image")) {
            mediaType = "image";
        }

        else if (file.mimetype.startsWith("video")) {
            mediaType = "video";
        }
        else if (file.mimetype.startsWith("audio")) {
            mediaType = "audio";
        }

        else if (
            file.mimetype === "application/pdf"
        ) {
            mediaType = "pdf";
        }

        else if (
            file.mimetype.includes("word") ||
            file.mimetype.includes("excel")
        ) {
            mediaType = "document";
        }




        const document =
            await documentRepository.create({

                uploaded_by_user_id: userId,


                original_name:
                    file.originalname,


                file_name:
                    file.filename,


                file_url:
                    file.path,


                mime_type:
                    file.mimetype,


                media_type:
                    mediaType,


                extension,


                file_size:
                    file.size,


                visibility


            });



        return document;


    }





    async getDocument(id) {


        const document =
            await documentRepository.findById(id);



        if (!document) {

            throw new Error(
                "Document not found"
            );

        }



        return document;


    }




    async getDocuments(filters) {


        return await documentRepository.findAll(filters);


    }




    async removeDocument(id) {


        return await documentRepository.delete(id);


    }



}


module.exports =
    new DocumentService();