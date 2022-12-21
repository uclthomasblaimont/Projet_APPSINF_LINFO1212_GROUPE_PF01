// page du serveur
const express = require('express');
//const path = require("path");
const ejs=require('ejs');
const app = express();
const bcrypt =require("bcrypt");
const https = require("https");
const {response} = require("express");
const session =require("express-session");
const fs = require("fs");
const bodyParser =require("body-parser");
const multer = require('multer'); // pour stocker les images

///////////////////////////stockage de l'image (clé unique) ////////////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb, newKey) {
        cb(null, './public/Image');
    },
    filename: async function (req, file, cb) {
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        let lenString = 7;
        let randString = '';
        while (randString === '' || await checkKey(req.session.ID,randString)) {
            randString = '';
            for (let i = 0; i < lenString; i++) {
                randString += characters[Math.floor(Math.random() * characters.length)];
            }
        }
        cb(null, req.session.ID.toString() + "-" + randString + ".jpg");
    }
});
const upload = multer({storage: storage});
/////////////////// Configuration du serveur //////////////////////////////////////
app.set("view engine","ejs");
app.set('views','views');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(bodyParser.json());
let db = require("./db")
const {updateorder,deleteproduct, getID, getMoney,getProduct,checkKey, checkpoint, getHistoric} = require("./db");
const {updateMoney, updateMoney2,updateProfils} = require("./db");

///////////////////////////////////////////////////////////
app.use(express.static('public'));
app.use(bodyParser.json());
//////////////////// cookie //////////////////////////////////////////////////
app.use(session({
    secret: "propre123",
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 3600000
    }
}));
///////////////////  GET   ////////////////////////////////////////////////////////
app.get('/',async (req,res)=>{
    let products;
    products = await db.getdisplay_order()

    let iduser;
    iduser= req.session.ID
    console.log(iduser)
    console.log("**************aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa***")
    res.render("menu",{username:req.session.username,data:products,IDUSER:iduser},);
    // Thomas: I have to direct to the main page
})
app.get("/product",async (req,res)=>{
    let products;
    products= await  db.getdisplay_order();

    res.render("product",{product:products,username:req.session.username,IDUSER:iduser});
})
app.get("/login", (req, res) => {
    res.render("login",{username:req.session.username,error2:req.session.error2});
});


app.get("/register", (req, res) => {
    res.render("register",{username:req.session.username,error1:req.session.error1});
});
app.get("/Panier", (req, res) => {
    res.render("Panier",{username:req.session.username});
});
app.get("/portefeuille", async (req, res) => {
    req.session.money = await getMoney(req.session.username)
    res.render("Portefeuille",{username:req.session.username, money:req.session.money});
});
app.get("/Commandes",(req, res)=>{
    res.render("Commandes",{username:req.session.username});
})

app.get("/settingProfils",async (req, res)=>{
    await res.render("settingProfils", {username:req.session.username, error3:req.session.error3});
})
app.get("/add_product",async (req,res)=>{
    res.render('add_product',{username:req.session.username});
})
app.get("/details_product/:proid",async (req,res)=>{
    let products;
    products=await db.viewsdetailsproduct(req.params.proid);
    res.render("details_product",{products:products,username:req.session.username});

})
app.get("/edit/:proid", async (req,res)=>{
    let products;
    products = await db.viewsdetailsproduct(req.params.proid)
    res.render("edit",{username:req.session.username,products:products});
    // il affiche les données qu'il y a déjà dans la carte du produit .

})
app.get("/Historique_achat", async(req,res)=>{
    let products
    products= await getHistoric(req.session.username)
    res.render("Historique_achat",{username:req.session.username,products:products})
})

///////////////////  POST   ////////////////////////////////////////////////////////
app.post("/",async (req,res)=>{
    const users = await db.getUser(req.session.username);
})
app.post("/register",async (req,res)=> {
    req.session.error1 = "";
    if (await db.getUser(req.body.username)) { // si le pseudo est déjà dans la bdd -> n'enregistre pas l'utilisateur
        console.log("pseudo déjà utilisé")
        req.session.error1 = "Pseudo déjà utilisé";
        res.redirect("/register")
    }
    else {
        const salt = bcrypt.genSaltSync(10)
        const cryp_mdp = bcrypt.hashSync(req.body.password, salt) // ache le mdp pour l'enregistrer
        await db.addUser(req.body.username,cryp_mdp,req.body.adresse);  // ajoute l'utilisateur à la bdd
        req.session.username = req.body.username
        req.session.adresse = req.body.adresse
        req.session.ID = await getID(req.session.username);
        console.log("nouvel utilisateur ajouté à la base de donnée")
        res.redirect("/");
    }
})
app.post("/login",async (req,res)=>{ // async pour dire que fonction est asynchrone
    req.session.error2 = "";
    console.log(req.body.username);
    await db.getUser(req.body.username).then(user=>{ // "await" pour dire que on attend "getUser" pour continuer
        if(user){
            bcrypt.compare(req.body.password,user.password).then(async passwordCorrect =>{
                if(passwordCorrect){
                    console.log("Utilisateur trouvé")
                    req.session.username = req.body.username;
                    req.session.ID = await getID(req.session.username);
                    req.session.money = await getMoney(req.session.username); // recupère la valeur de l'argent de l'utilisateur
                    console.log(req.session.money)
                    res.redirect('/');
                }else{
                    console.log("mauvais mot de passe");
                    req.session.error2 = "Mauvais mot de passe , veuillez réessayez"
                    res.redirect("/login");
                }
            });
        }
        else{
            console.log("Utilisateur non trouvée");
            req.session.error2 = "Ce pseudo ne correspond à aucun utilisateur"
            res.redirect("/login")
        }
    });
});
app.post("/portefeuille",async (req,res)=>{
    if (req.body.argent !== undefined) await updateMoney(req.session.username, parseInt(req.body.argent));
    if (req.body.argent2 !== undefined) await updateMoney2(req.session.username, parseInt(req.body.argent2));
    res.redirect("/portefeuille")
})
app.post("/Commandes",async (req,res)=>{
    res.redirect("/product");

})
app.post("/settingProfils",async (req, res)=>{
    req.session.error3 = ""
    if (await db.getUser(req.body.newusername)){
        console.log("psuedo deja utilisé")
        req.session.error3 = "Pseudo déjà utilisé";
        res.redirect("/settingProfils")
    }
    else {
        await updateProfils(req.session.username, req.body.newusername, req.body.newpassword, req.body.newadresse)
        if (req.body.newusername !== "") req.session.username = req.body.newusername;
        if (req.body.newadresse !== "") req.session.adresse = req.body.newadresse;
        console.log("profils MAJ")
        res.redirect('/');
    }
})
app.post("/add_product",upload.single("image"), async (req,res)=>{
    db.add_object(req.body.title, req.session.ID, req.body.price,req.body.description, req.file.filename);
    res.redirect("/");
})
app.post("/edit", async (req,res)=>{
    const name_product= req.body.title;
    //const image_product = req.body.image;
    console.log(req.file.filename)
    const price_product=req.body.price;
    const description_product = req.body.description;
    const id=req.body.id;
    //console.log(name_product,req.file.filename,price_product,description_product,id);
    await updateorder(id, name_product, description_product, price_product, req.file.filename);
    res.redirect("/menu");
})
app.post("/delete",async (req,res)=>{
    console.log(req.body.id)
    await deleteproduct(req.body.id)
    res.redirect("/")
    // pas sûr de cette methode à revoir
})



app.post("/Historique_achat",async (req,res)=>{
    res.redirect("/Historique_achat")
})


app.post("/acheter",async(req,res)=>{
    console.log(req.body.id)
    console.log("----------------------")
    console.log(req.session.username)
    console.log("----------------------")
    console.log(req.body.price)
    console.log("----------------------")
    console.log(req.body.name)
    console.log("----------------------")
    console.log(req.session.ID)// id user
    console.log("----------------------")
    let money;
    money =  getMoney(req.session.ID)// avec l 'id du user
    console.log("----------")
    console.log(money)
    await checkpoint(req.body.name,req.body.price,money,req.session.username)
    res.redirect("/")


})

//////////////////   Start server   //////////////////////////////////////////////////////////////
https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);