/*npm test -- --coverage*/
const {updateorder,addUser,deleteuser,deleteproduct, getID, getMoney,getProduct,getProduct2, getUser, add_object, getdisplay_order,
    viewsdetailsproduct, nbrPost,
    checkKey,
    getCategorie,
    getDescription,
    getImage,
    ToHistoric,
    deleteHistoric,
    getHistoric,
    checkpoint
} = require("../db");
const {updateMoney, updateMoney2,updateProfils} = require("../db");


describe("user info", () => {
    test("Get the valid user info", async () => {
        await addUser("Elie", "lilo", "perwez", 50)
        const addUser1 = await addUser("Elie", "lilo", "perwez", 50)
        const user1 = await getUser("Elie")
        const user2 = await getUser("lulo")
        const userID1 = await getID(user1.username)
        const userID2 = await getID(user2.username)
        const userID3 = await getID("lop")
        expect(addUser1).toBe(false);
        expect(user1.username).toBe("Elie");
        expect(user1.adresse).toBe("perwez");
        expect(user1.id).toBe(user1.id);
        expect(user1.money).toBe(50);
        expect(userID1).toBe(user1.id);
        expect(userID2).toBe(false);
        expect(userID3).toBe(false);
        expect(user2.username).toBe(undefined);
        await deleteuser(user1.id)
    });
    test("Delete user", async () => {
        const addUser1 =await addUser("Elie", "lilo", "perwez", 50)
        const user1 = await getUser("Elie")
        await deleteuser(user1.id)
        const deluser2 = await deleteuser(user1.id)
        const userdel = await getUser("Elie")
        expect(user1).not.toBe(false);
        expect(userdel).toBe(false);
        expect(deluser2).toBe(false);
    });
    test("update user info", async () => {
        await addUser("vivi", "vovo", "perwez", 1550)
        const upresult1 = await updateProfils("vivi" , "vivo" , "vava")
        await updateProfils("vivo" , "" , "","")
        await updateProfils("vlovo" , "" , "","")
        const user1 = await getUser("vivo")
        expect(user1.username).toBe("vivo");
        expect(upresult1).toBe(true);
        await deleteuser(user1.id)
    });
})

describe("user money", () => {
    test("get user's money", async () => {
        await addUser("Elie", "lilo", "perwez", 50)
        const user1 = await getUser("Elie")
        const money1 = await getMoney(user1.id)
        const money2 = await getMoney("lop")
        const money3 = await getMoney(user1)
        expect(money1).toBe(50);
        expect(money2).toBe(false);
        expect(money3).toBe(false);
        await deleteuser(user1.id)
    });
    test("deposit money", async () => {
        await addUser("mimi", "momo", "perwez", 50)
        const user1 = await getUser("mimi")
        const user2 = await getUser("lap")
        const depositmoney1 = await updateMoney(user1.id,50)
        const depositmoney2 = await updateMoney(user2.id,20)
        const money1 = await getMoney(user1.id)
        expect(depositmoney1).toBe(false);
        expect(depositmoney2).toBe(false);
        expect(money1).toBe(100);
        await deleteuser(user1.id)
    });
    test("withdraw money", async () => {
        await addUser("malu", "molo", "perwez", 50)
        const user1 = await getUser("malu")
        const user2 = await getUser("lap")
        const depositmoney1 = await updateMoney(user1.id,-30)
        const depositmoney2 = await updateMoney(user2.password,20)
        const money1 = await getMoney(user1.id)
        expect(depositmoney1).toBe(false);
        expect(depositmoney2).toBe(false);
        expect(money1).toBe(20);
        await deleteuser(user1.id)
    });
})

describe("product", () => {
    test("get product info", async () => {
        await add_object("Elie", "Ordinateur",10, 125,"nice" ,"3-nbrImage.jpg")
        const product2 = await getProduct2(10)
        expect(product2.name).toBe("Elie")
        expect(product2.idUser).toBe(10)
        expect(product2.price).toBe(125)
        expect(product2.description).toBe("nice")
        expect(product2.image).toBe("3-nbrImage.jpg")
        await deleteproduct(product2.id)
    });
    test("get product info2", async () => {
        await add_object("Elie", "Ordinateur",20, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(20)
        const categorie1 = await getCategorie(product1.id)
        expect(categorie1).toBe("Ordinateur")
        const categorie2 = await getCategorie(-5)
        expect(categorie2).toBe(false)
        const categorie3 = await getCategorie(product1.id)
        await getProduct()
        await getProduct("","Ordinateur")
        await getProduct("lop","")
        await getProduct("Ordinateur","Ordinateur")
        await deleteproduct(product1.id)
    });
    test("get categorie", async () => {
        await add_object("Elie", "Ordinateur",20, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(20)
        const categorie1 = await getCategorie(product1.id)
        expect(categorie1).toBe("Ordinateur")
        const categorie2 = await getCategorie(-5)
        expect(categorie2).toBe(false)
        await deleteproduct(product1.id)
    });
    test("get description", async () => {
        await add_object("Elie", "Ordinateur",20, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(20)
        const description1 = await getDescription(product1.id)
        expect(description1).toBe("nice")
        const description2 = await getDescription(-5)
        expect(description2).toBe(false)
        await deleteproduct(product1.id)
    });
    test("get image", async () => {
        await add_object("Elie", "Ordinateur",20, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(20)
        const image1 = await getImage(product1.id)
        expect(image1).toBe("3-nbrImage.jpg")
        const image2 = await getImage(-5)
        expect(image2).toBe(false)
        await deleteproduct(product1.id)
    });
    test("delete product", async () => {
        await add_object("lolo", "Ordinateur",12, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(12)
        await deleteproduct(product1.id)
        const deleteuser1 = await deleteproduct(product1.id)
        expect(deleteuser1).toBe(false);
    });
    test("update product", async () => {
        await add_object("lolo", "Ordinateur",14, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(14)
        const updateProduct1 = await updateorder(product1.id,"lili","very nice",500,"4-nbrImage.jpg")
        await updateorder(product1.id,"","","","")
        await updateorder(14,"lili",500,500,"4-nbrImage.jpg")
        expect(updateProduct1).toBe(true);
        const product2 = await getProduct2(14)
        await deleteproduct(product2.id)
    });
    test("didplay product", async () => {
        await add_object("lala", "Ordinateur",18, 125,"nice" ,"5-nbrImage.jpg")
        const displayProduct1 = await getdisplay_order()
        const product1 = await getProduct2(18)
        expect(displayProduct1[0].description).toBe(displayProduct1[0].description);
        expect(displayProduct1[0].name).toBe(displayProduct1[0].name);
        expect(displayProduct1[0].price).toBe(displayProduct1[0].price);
        expect(displayProduct1[0].image).toBe(displayProduct1[0].image);
        await deleteproduct(product1.id)
    });
    test("details product", async () => {
        await add_object("lala", "Ordinateur",18, 125,"nice" ,"5-nbrImage.jpg")
        const product1 = await getProduct2(18)
        const product2 = await getProduct2(-5)
        const detailsProduct1 = await viewsdetailsproduct(product1.id)
        const detailsProduct2 = await viewsdetailsproduct(product2.id)
        expect(detailsProduct1.description).toBe("nice");
        expect(detailsProduct1.name).toBe("lala");
        expect(detailsProduct1.price).toBe(125);
        expect(detailsProduct1.image).toBe("5-nbrImage.jpg");
        expect(detailsProduct1.idUser).toBe(18);
        expect(detailsProduct2).toBe(false);
        await deleteproduct(product1.id)
    });
})

describe("image", () => {
    test("valid image", async () => {
        await add_object("Elie", "Ordinateur",10, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct2(10)
        const imagecheck1 = await  checkKey(3,"nbrImage")
        const imagecheck2 = await  checkKey(7,"nbrI")
        expect(imagecheck1).toBe(true);
        expect(imagecheck2).toBe(false);
        await deleteproduct(product1.id)
    });

})

describe("historique", () => {
    test("valid historique", async () => {
        const historique = await ToHistoric("pc", "Ordinateur", 10, 5, 100, "nice", "7-nbrImage.jpg")
        const historique2 = await getHistoric(5)
        await deleteHistoric(historique2)
        await deleteHistoric(historique2)
    });
})
