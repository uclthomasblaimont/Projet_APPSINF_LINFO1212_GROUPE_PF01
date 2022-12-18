/*npm test -- --coverage*/
const {updateorder,addUser,deleteuser,deleteproduct, getID, getMoney,getProduct, getUser, add_object, getdisplay_order,
    viewsdetailsproduct, nbrPost
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
        const money1 = await getMoney("Elie")
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
        const depositmoney1 = await updateMoney("mimi",50)
        const depositmoney2 = await updateMoney(user2.username,20)
        const money1 = await getMoney("mimi")
        expect(depositmoney1).toBe(false);
        expect(depositmoney2).toBe(false);
        expect(money1).toBe(100);
        await deleteuser(user1.id)
    });
    test("withdraw money", async () => {
        await addUser("malu", "molo", "perwez", 50)
        const user1 = await getUser("malu")
        const user2 = await getUser("lap")
        const depositmoney1 = await updateMoney2("malu",30)
        const depositmoney2 = await updateMoney2(user2.password,20)
        const money1 = await getMoney("malu")
        expect(depositmoney1).toBe(false);
        expect(depositmoney2).toBe(false);
        expect(money1).toBe(20);
        await deleteuser(user1.id)
    });
})

describe("product", () => {
    test("get product info", async () => {
        await add_object("Elie", 10, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct("l")
        const product2 = await getProduct(10)
        expect(product1).toBe(false);
        expect(product2.name).toBe("Elie")
        expect(product2.idUser).toBe(10)
        expect(product2.price).toBe(125)
        expect(product2.description).toBe("nice")
        expect(product2.image).toBe("3-nbrImage.jpg")
        await deleteproduct(product2.id)
    });
    test("delete product", async () => {
        const addproduct1 = await add_object("lolo", 12, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct(12)
        await deleteproduct(product1.id)
        const deleteuser1 = await deleteproduct(product1.id)
        expect(deleteuser1).toBe(false);
    });
    test("update product", async () => {
        await add_object("lolo", 14, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct(14)
        const updateProduct1 = await updateorder(product1.id,"lili","very nice",500,"4-nbrImage.jpg")
        await updateorder(product1.id,"","","","")
        await updateorder(14,"lili","very nice",500,"4-nbrImage.jpg")
        expect(updateProduct1).toBe(true);
        const product2 = await getProduct(14)
        await deleteproduct(product2.id)
    });
    test("didplay product", async () => {
        const displayProduct1 = await getdisplay_order()
        expect(displayProduct1[0].description).toBe("il est sympa mais un peut idiot ");
        expect(displayProduct1[0].name).toBe("joey");
        expect(displayProduct1[0].price).toBe(5000.0);
        expect(displayProduct1[0].image).toBe("1-nbrImage.jpg");
    });
    test("details product", async () => {
        await add_object("lolo", 14, 125,"nice" ,"3-nbrImage.jpg")
        const product1 = await getProduct(14)
        const product2 = await getProduct(-5)
        const detailsProduct1 = await viewsdetailsproduct(product1.id)
        const detailsProduct2 = await viewsdetailsproduct(product2.id)
        expect(detailsProduct1.description).toBe("nice");
        expect(detailsProduct1.name).toBe("lolo");
        expect(detailsProduct1.price).toBe(125);
        expect(detailsProduct1.image).toBe("3-nbrImage.jpg");
        expect(detailsProduct1.idUser).toBe(14);
        expect(detailsProduct2).toBe(false);
        await deleteproduct(product1.id)
    });
})

describe("image", () => {
    test("get highest image numbre", async () => {
        const numimage = await nbrPost(1)
        expect(numimage).toBe(0);
    });

})
