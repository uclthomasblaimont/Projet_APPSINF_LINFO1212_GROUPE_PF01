const {Sequelize,Model,DataType,where, DataTypes, DATE, STRING} = require('sequelize');
const moment = require("moment");
const bcrypt = require("bcrypt"); // servira pour les dates
const Op = Sequelize.Op;// servira pour les recherches
const sequelize = new Sequelize({
    dialect:"sqlite",
    storage:"db.sqlite3"
})
class  User extends Model{}
class Products extends Model{}
class Historic_achat extends Model{}

User.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    username:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:true,
        primaryKey: false
    },
    password:{
        type:DataTypes.TEXT,
        unique:true,
        allowNull:false
    },
    adresse:{
        type:DataTypes.TEXT,
        unique:false,
        allowNull:false
    },
    money:{
        type:DataTypes.FLOAT,
        defaultValue:0.0
    }
},{sequelize,modelName:'User'});
Products.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    categorie:{
        type:DataTypes.STRING,
        allowNull:false
    },
    idUser:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false,
        defaultValue:0.0
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    image:{
        type:DataTypes.TEXT,
        allowNull:false
    }
},{sequelize, modelName:"Products"});
Historic_achat.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    categorie:{
        type:DataTypes.STRING,
        allowNull:false
    },
    idVendeur:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    idAcheteur:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false,
        defaultValue:0.0
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    image:{
        type:DataTypes.TEXT,
        allowNull:false
    }
},{sequelize,modelName:"Historic_achat"})

async function getMoney(id) {
    return User.findOne({where: {id: id}, attributes: ["money"]}).then(mon => {
        if (mon) {
            return mon.dataValues.money
        } else {
            return false
        }
    }).catch(err => {
        console.log("Unable to rretrive money of " + id + ": " + err)
        return false
    })
}

async function getCategorie(id) {
    return Products.findOne({where: {id: id}, attributes: ["categorie"]}).then(mon => {
        if (mon) {
            return mon.dataValues.categorie
        } else {
            return false
        }
    })
}


async function getDescription(id) {
    return Products.findOne({where: {id: id}, attributes: ["description"]}).then(mon => {
        if (mon) {
            return mon.dataValues.description
        } else {
            return false
        }
    })
}
async function getImage(id) {
    return Products.findOne({where: {id: id}, attributes: ["image"]}).then(mon => {
        if (mon) {
            return mon.dataValues.image
        } else {
            return false
        }
    })
}

async function getID(username) {
    return User.findOne({where: {username: username}, attributes: ["id"]}).then(mon => {
        if (mon) {
            return mon.dataValues.id
        } else {
            return false
        }
    }).catch(err => {
        console.log("Unable to rretrive money of " + username + ": " + err)
        return false
    })
}
async function updateMoney(id, montant) {
    money = await getMoney(id);
    new_money = money + montant;
    return User.update({money: new_money}, {where: {id: id}}).then(state => {
        return state === 1; // nbr changement
    }).catch(err => {
        console.log("Couldn't update money" + err)
        return false
    })
}//ajoute ou retire argent
async function updateProfils(username, newusername, newpassword, newadresse){
    return User.findOne({where:{username:username}}).then(modif => {
        if(modif) {
            if (newpassword !== ""){
                const salt = bcrypt.genSaltSync(10)
                const cryp_mdp = bcrypt.hashSync(newpassword, salt) // ache le mdp pour l'enregistrer
                User.update({password:cryp_mdp}, {where: {username:username}})
                console.log("MAJ password")
            }
            if (newadresse !== ""){
                User.update({adresse:newadresse}, {where: {username:username}})
                console.log("MAJ adresse")
            }
            if (newusername !== ""){
                User.update({username:newusername}, {where: {username:username}})
                console.log("MAJ username")
            }
            return true;
        }
    })
}
async function checkKey(iD,key) {
    const key2 = iD.toString()+"-"+key+".jpg";
    return Products.findOne({where: {image:key2}})
        .then(k => {
            if (k) {
                return true;
            } else {
                return false;
            }
        });
}
module.exports= {

    ToHistoric: function ToHistoric(name, categorie, idVendeur, idAcheteur, price, description, image){
        Historic_achat.create({
            name: name,
            categorie: categorie,
            idVendeur:idVendeur,
            idAcheteur:idAcheteur,
            price: price,
            description: description,
            image: image
        }).then(products => {
            console.log("Products added " + products);
            return true;
        })

    },



    getProduct2: async function getProduct2(id) {
        return Products.findOne({where: {idUser: id}})
            .then(prod => {
                if (prod) {
                    return prod;
                } else {
                    return false;
                }
            });
    },
    getUser: function getUser(username) {
        return User.findOne({where: {username: username}})
            .then(user => {
                if (user) {
                    return user;
                } else {
                    return false;
                }
            });
    },
    getProduct: async function getProduct(name = undefined,categorie = undefined){
        if (categorie === undefined || categorie === "") {
            if (name === undefined || name === ""){
                return await Products.findAll().then(function(result){ return result })
            }
            else return await Products.findAll({where:{name: {[Op.like]:"%"+name+"%"}}})
        }
        else {
            if (name === undefined || name === ""){
                return await Products.findAll({where:{categorie:categorie}}).then(function(result){ return result })
            }
            else return await Products.findAll({where:{categorie:categorie,name: {[Op.like]:"%"+name+"%"}}})
        }
    },
    addUser: function addUser(username, password, adresse, money) {
        return User.create({
            username: username,
            password: password,
            adresse: adresse,
            money:money
        }).then(user => {
            console.log("User added : " + user);
            return true;
        }).catch(err => {
            console.log("User already exists " + err);
            return false;
        })

    },
    getMoney,
    updateMoney,
    updateProfils,
    getID,
    checkKey,
    getCategorie,
    getDescription,
    getImage,

    add_object: function add_object(name,categorie,idUser, price, description, image) {
        Products.create({
            name: name,
            categorie: categorie,
            idUser:idUser,
            price: price,
            description: description,
            image: image
        }).then(products => {
            console.log("Products added " + products);
            return true;
        })

    },
    getdisplay_order: async function getdisplay_order(id = undefined) {
        return await Products.findAll().then(function (result) {
            return result
        })

    },
    viewsdetailsproduct: async function viewsdetailsproduct(id){

        return await Products.findByPk(id).then(id=>{
            if (id){
                return id
            }else{
                return false
            }


        })
    },

    updateorder : async function updateorder(id,new_name,new_description,new_price,new_image){
        return   Products.findOne({where:{id:id}}).then(found=>{
            if(found){
                if(new_name!==""){
                    console.log("ICIII222222")
                    Products.update({name:new_name},{where:{id:id}})
                }
                if(new_description!==""){
                    console.log(new_description)
                    Products.update({description:new_description},{where:{id:id}}).then(description=>{
                        console.log("**")
                        console.log(description)
                    })
                }
                if(new_price!==""){
                    console.log(new_price)
                    Products.update({price:new_price},{where:{id:id}}).then(price=>{
                        console.log("***")
                        console.log(price)
                    })
                }
                if(new_image!==""){
                    console.log(new_image)
                    Products.update({image:new_image},{where:{id:id}}).then(image=>{
                        console.log("****")
                        console.log(image)
                    })
                }
                return true
            }
        })
    },
    deleteproduct:  async function deleteproduct(id){
        return await  Products.findOne({where:{id:id}}).then(id=>
            id.destroy()
        ).catch(err=>{
            console.log("error: "+ err)
            return false
        })
        // supprime le produit
    },
    
    deleteuser:  async function deleteuser(id){
        return await User.findOne({where:{id:id}}).then(id=>
            id.destroy()
        ).catch(err=>{
            console.log("error: "+ err)
            return false
        })
        // supprime le produit
    },

    deleteHistoric:  async function deleteHistoric(id){
        return await Historic_achat.findOne({where:{idAcheteur:id}}).then(id=>
            id.destroy()
        ).catch(err=>{
            console.log("error: "+ err)
            return false
        })
        // supprime le produit
    },



    getHistoric: async function getHistoric(idAcheteur){
        return await Historic_achat.findAll({where:{[Op.or]: [{idAcheteur:idAcheteur},{idVendeur:idAcheteur}]}})
    }
}



