const { Document } = require("../../models");


class DocumentRepository {


  async create(data, transaction = null) {

    return await Document.create(
      data,
      {
        transaction
      }
    );

  }



  async findById(id) {

    return await Document.findOne({
      where:{
        id,
        status:"active"
      },

      include:[
        {
          association:"uploaded_by",
          attributes:[
            "id",
            "name_or_company_name",
            "email"
          ]
        }
      ]

    });

  }



  async findAll(filters={}){


    return await Document.findAll({

      where:{
        status:"active",
        ...filters
      },

      order:[
        [
          "created_at",
          "DESC"
        ]
      ]

    });


  }



  async delete(id){


    return await Document.update(

      {
        status:"deleted"
      },

      {
        where:{
          id
        }
      }

    );


  }


}


module.exports =
new DocumentRepository();