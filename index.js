// page du serveur
const express = require('express');
const app = express();
const bcrypt =require("bcrypt");
const https = require("https");
const session =require("express-session");
const fs = require("fs");
const bodyParser =require("body-parser");
const multer = require('multer'); // pour stocker les images
let color = "style.css"
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
const {updateorder,deleteproduct, getID, getMoney,getProduct,checkKey, getHistoric,ToHistoric, getUser} = require("./db");
const {updateMoney,updateProfils,getCategorie,getImage,getDescription} = require("./db");
const {del} = require("express/lib/application");

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
app.get("/choiceNightDay", async (req,res)=>{
    let products;
    if (req.session.listOfProducts === undefined){
        products = await db.getProduct()
    }else {
        products = req.session.listOfProducts
    }
    let iduser;
    iduser=req.session.ID;

    if (color === "nightmode.css") {color = "style.css"}
    else color = "nightmode.css"
    res.render("menu",{username:req.session.username,data:products,IDUSER:iduser,color:color});
})
app.get('/',async (req,res)=>{
    let products;
    if (req.session.listOfProducts === undefined){
        products = await db.getProduct()
    }else {
        products = req.session.listOfProducts
    }
    let iduser;
    iduser=req.session.ID;
    res.render("menu",{username:req.session.username,data:products,IDUSER:iduser,color:color});
    // Thomas: I have to direct to the main page
});
app.get("/product",async (req,res)=>{
    let products;
    products= await  db.getdisplay_order();

    res.render("product",{product:products,username:req.session.username,IDUSER:iduser,color:color});
})
app.get("/login", (req, res) => {
    res.render("login",{username:req.session.username,error2:req.session.error2,color:color});
});
app.get("/register", (req, res) => {
    res.render("register",{username:req.session.username,error1:req.session.error1,color:color});
});
app.get("/portefeuille", async (req, res) => {
    req.session.money = await getMoney(req.session.ID)
    res.render("Portefeuille",{username:req.session.username, money:req.session.money,color:color});
});
app.get("/Commandes", async (req, res)=>{
    let data;
    data = await getHistoric(req.session.ID)// doit recuperer tt les objets acheté ou vendu
    console.log(data)
    res.render("Commandes",{username:req.session.username,data:data,id:req.session.ID,color:color});
})
app.get("/settingProfils",async (req, res)=>{
    const people = await getUser(req.session.username)
    await res.render("settingProfils", {username:req.session.username,people:people, error3:req.session.error3,color:color});
})
app.get("/add_product",async (req,res)=>{
    res.render('add_product',{username:req.session.username,color:color});
})
app.get("/edit/:proid", async (req,res)=>{
    let products;
    products = await db.viewsdetailsproduct(req.params.proid)
    res.render("edit",{products:products,username:req.session.username,color:color});
})
///////////////////  POST   ////////////////////////////////////////////////////////
app.post("/",async (req,res)=>{
    const users = await db.getUser(req.session.username);
})
app.post("/banner", async function(req, res){
    req.session.listOfProducts = await db.getProduct(req.body.recherche,req.body.categorieMenu)
    res.redirect("/")
});
app.post("/edit", async (req,res)=>{
    const name_product= req.body.title;
    const price_product=req.body.price;
    const description_product = req.body.description;
    const id=req.body.id;
    console.log(name_product,price_product,description_product,id);
    await updateorder(id, name_product, description_product, price_product);
    res.redirect("/");
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
});
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
    if (req.body.argent !== undefined && req.body.argent !=="") await updateMoney(req.session.ID, parseInt(req.body.argent)); // retire
    if (req.body.argent2 !== undefined && req.body.argent2 !=="") await updateMoney(req.session.ID, parseInt(req.body.argent2) * -1);
    res.redirect("/portefeuille")
});
app.post("/Commandes",async (req,res)=>{
    res.redirect("/product");

})
app.post("/settingProfils",async (req, res)=>{
    req.session.error3 = ""
    if (await db.getUser(req.body.newusername) & req.session.username !== await db.getUser(req.body.newusername)){
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
    db.add_object(req.body.title,req.body.categorie, req.session.ID, req.body.price,req.body.description, req.file.filename);
    res.redirect("/");
})

app.post("/Historique_achat",async (req,res)=>{
    res.redirect("/Historique_achat")
})
app.post("/delete", async (req,res)=>{
    console.log(req.body.id)
    await deleteproduct(req.body.id)
    res.redirect("/")
})

app.post("/delete",async(req,res)=>{
    console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
    console.log(req.body.id)
    await deleteproduct(req.body.id)
    res.redirect("/")

})

app.post("/:id", async (req, res)=>{
    if (req.session.username !== undefined){
        if (req.session.money >= req.body.price) { // si assez d'argent
            await updateMoney(req.session.ID, parseInt(req.body.price) * -1) // retire argent pour client
            await updateMoney(req.body.idUser, parseInt(req.body.price)) // ajoute argent pour vendeur
            const categorie = await getCategorie(req.body.id)
            const description = await getDescription(req.body.id)
            const image = await getImage(req.body.id)
            console.log(req.body.name)
            console.log(categorie)
            console.log(req.body.idUser)
            console.log(req.session.ID)
            console.log(req.body.price)
            console.log(description)
            console.log(image)
            await ToHistoric(req.body.name,categorie,req.body.idUser,req.session.ID,req.body.price,description,image)
            await deleteproduct(req.body.id)
            // ajoute a l'historique
            console.log("achat effectué")
            res.redirect("/portefeuille")
        }
        else {
            console.log("pas assez de crédit")
            res.redirect("/portefeuille")
        }
    }
    else res.redirect("/login")
})

//////////////////   Start server   //////////////////////////////////////////////////////////////
https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);