let DB = require("../index.js");
let db = new DB({ folder: __dirname + "/" }, (data) => {
    console.log(`Document ${data.document} is corrupted! Successfully fixed the document.`);
});

(async function() {
    if (!await db.isExist("test")) {
        await db.create("test");

        console.log(`Cannot found document "test". Successfully to make it.`);
    }

    if (!db.get("test", "count")) {
        db.set("test", "count", 1);

        console.log(`Cannot found variable "count" in document "test". Successfully to make it.`);
    } else {
        db.add("test", "count", 1);

        console.log(`Added 1 into "count"'s value in "test" document.`);
    }

    console.log(`Count: ${db.get("test", "count")}`);
    console.log(`All keys of document "test": ${db.keys("test")}`);
    console.log(`All values of document "test": ${db.values("test")}`);

    if (db.get("test", "count") > 2) {
        db.removeValue("test", "count");
        db.delete("test");

        console.log(`Count reached 3! Deleted "test" document.`);
    }
})();