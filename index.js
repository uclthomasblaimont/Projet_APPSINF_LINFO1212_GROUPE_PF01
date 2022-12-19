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
const {updateorder,deleteproduct, getID, getMoney,getProduct,checkKey} = require("./db");
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
    res.render("menu",{username:req.session.username,data:products},);
    // Thomas: I have to direct to the main page
})
app.get("/product",async (req,res)=>{
    let products;
    products= await  db.getdisplay_order();
    res.render("index",{product:products});
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
app.get("/Ordinateurs_et_accesoires",async (req, res)=>{
    await res.render("Ordinateurs_et_accesoires", {
        username:req.session.username,
        products1: [
            {
                price: 1299,
                description: "SAMSUNG 13.3” Galaxy Book2 Pro Laptop Computer|\n" +
                    "        Windows 11 PRO | 16GB | 256GB, 12th Gen Intel® Core™ i5-1240P Processor, Evo Certified, Lightweight, 2022 Model, Silver (NP934XED-KB1US)",
                image: "Ordinateurs_et_accessoires/laptop1.png"
            }

        ],
        products2: [
            {
                price: 499,
                description: "Gaming PC Desktop Computer by Alarco Intel i5 3.10GHz,8GB Ram,1TB Hard Drive,Windows 10 pro,WiFi Ready,Video n" +
                "Card Nvidia GTX 650 1GB, 3 RGB Fans with Remote",
                image: "Ordinateurs_et_accessoires/pc-fix1.png"
            }
        ],
        products3: [
            {
                price: 149,
                description: "SAMSUNG 27-Inch CF39 Series FHD 1080p Curved Computer Monitor, Ultra Slim Design, AMD FreeSync, 4ms response, \n" +
                "HDMI, DisplayPort, VESA Compatible, Wide Viewing Angle (LC27F398FWNXZA), Black",
                image: "Ordinateurs_et_accessoires/ecran-pc-fixe1.png"
            }
        ],
        products4: [
            {
                price: 70,
                description: "RAZEAK Ultra Custom Wireless Gaming Mouse Syww 8, Gaming Mouse 3395 Sensor 26000 DPI Triple-Mode (Wired+2.4 G+ BT5.0) \n"+
                "Connection- with Software Programmable (White)",
                image: "Ordinateurs_et_accessoires/sourie1.png"
            }
        ],
        products5: [
            {
                price: 26,
                description: "RaceGT Gaming Keyboard,114 Keys Full Size Wired LED Backlit with Dedicated Multimedia Keys Wrist Rest \n"+
                "Mechanical Feeling Keybaord Compatible for Computer PC Laptop Xbox",
                image: "Ordinateurs_et_accessoires/clavier1.png"
            }
        ],
        products6: [
            {
                price: 83,
                description: "YSSOA Backrest and Seat Height Adjustable Swivel Recliner Racing Office Computer Ergonomic \n"+
               "Video Game Chair, Without footrest, Black/White",
                image: "Ordinateurs_et_accessoires/chaise1.png"
            }
        ],
        products7: [
            {
                price: 24,
                description: "BENGOO G9000 Stereo Gaming Headset for PS4 PC Xbox One PS5 Controller, Noise Cancelling Over Ear Headphones with \n"+
                "Mic, LED Light, Bass Surround, Soft Memory Earmuffs for Laptop Mac Nintendo NES Games",
                image: "Ordinateurs_et_accessoires/casque1.png"
            }
        ]
    });
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
    res.render("edit",{products:products});
    // il affiche les données qu'il y a déjà dans la carte du produit .

})
app.get("/Historique_achat", async(req,res)=>{
    res.render("Historique_achat",{username:req.session.username})
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
    const price_product=req.body.price;
    const description_product = req.body.description;
    const id=req.body.id;
    //console.log(name_product,req.file.filename,price_product,description_product,id);
    await updateorder(id, name_product, description_product, price_product, req.file.filename);
    res.redirect("/");
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
    console.log(req.session.username)
    console.log(req.body.price)
    console.log(req.body.name)
    let money;
    money = await getMoney(req.session.ID)// avec l 'id du user



})

//////////////////   Start server   //////////////////////////////////////////////////////////////
https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);