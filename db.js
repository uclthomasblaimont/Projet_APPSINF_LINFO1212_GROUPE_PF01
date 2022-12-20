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
    idUser:{
        type:DataTypes.INTEGER
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
    produit:{
        type:DataTypes.TEXT,
        allowNull:false
    }

},{sequelize,modelName:"Historic_achat"})

async function nbrPost(id){
    // return le nombre le plus élevé d'image +1, table: Products  , colonne: idUser
    return 0;

}
async function getMoney(username) {
    return User.findOne({where: {username: username}, attributes: ["money"]}).then(mon => {
        if (mon) {
            return mon.dataValues.money
        } else {
            return false
        }
    }).catch(err => {
        console.log("Unable to rretrive money of " + username + ": " + err)
        return false
    })
}
async function getProduct(id) {
    return User.findOne({where: {id: id}})
        .then(prod => {
            if (prod) {
                return prod;
            } else {
                return false;
            }
        });
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
async function updateMoney(username, montant) {
    money = await getMoney(username);
    new_money = money + montant;
    return User.update({money: new_money}, {where: {username: username}}).then(state => {
        return state === 1; // nbr changement
    }).catch(err => {
        console.log("Couldn't update money of " + username + ": " + err)
        return false
    })
}
async function updateMoney2(username, montant) {
    money = await getMoney(username);
    new_money = money - montant;
    return User.update({money: new_money}, {where: {username: username}}).then(state => {
        return state === 1; // nbr changement
    }).catch(err => {
        console.log("Couldn't update money of " + username + ": " + err)
        return false
    })
}
async function updateProfils(username, newusername, newpassword, newadresse){
    return User.findOne({where:{username:username}}).then(modif => {
        if(modif) {
            if (newpassword !== ""){
                console.log("MAJ password")
                const salt = bcrypt.genSaltSync(10)
                const cryp_mdp = bcrypt.hashSync(newpassword, salt) // ache le mdp pour l'enregistrer
                User.update({password:cryp_mdp}, {where: {username:username}})
            }
            if (newadresse !== ""){
                console.log("MAJ adresse")
                User.update({adresse:newadresse}, {where: {username:username}})
            }
            if (newusername !== ""){
                console.log("MAJ username")
                User.update({username:newusername}, {where: {username:username}})
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
    updateMoney2,
    updateProfils,
    getID,
    checkKey,
    getProduct,
    add_object: function add_object(name, idUser, price, description, image) {
        Products.create({
            name: name,
            idUser:idUser,
            price: price,
            description: description,
            image: image
        }).then(products => {
            console.log("Products added " + products);
            return true;
        }).catch(err => {
            console.log("Products already exists" + err);
            return false;
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
                    }).catch(err=>console.log("error" + err))
                    console.log("description_modified")
                }
                if(new_price!==""){
                    console.log(new_price)
                    Products.update({price:new_price},{where:{id:id}}).then(price=>{
                        console.log("***")
                        console.log(price)
                    }).catch(err=>console.log("error" + err))
                    console.log("price_modified")
                }
                if(new_image!==""){
                    console.log(new_image)
                    Products.update({image:new_image},{where:{id:id}}).then(image=>{
                        console.log("****")
                        console.log(image)
                    }).catch(err=>console.log("error"+err))
                    console.log("image_modified")
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
    
    checkpoint: async function checkpoint(product,price_product,point,userid){

        if(point === 0){
            console.log("portefeuille vide")
            return false
        }
        if(point>=price_product){
            point-=price_product;
            //User.update({money:point},{where:{id:userid}})// on reprend l'id du user
            //updateMoney2()
            Historic_achat.create({
                    produit: product
                }).then(pro=>{
                    console.log("Product added : "+pro)
                return true
            }).catch(err=>{
                console.log("Error : "+err)
                return false
            })

        }else{
            console.log("pas assez d'argent cheh")
            return false
        }

    }
}


