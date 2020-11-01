let DB = require("../index.js");
let db = new DB({
    folder: __dirname + "/"
}, (data) => {
    console.log(`Document ${data.document} is corrupted! Successfully fixed the document.`);
});

if (!db.isExist("test")) {
    db.create("test");

    console.log(`Cannot find document "test". Successfully to make it.`);
}

if (!db.get("test", "count")) {
    db.set("test", "count", 1);

    console.log(`Cannot find variable "count" in document "test".`);
} else {
    db.add("test", "count", 1);

    console.log(`Added 1 into "count"'s value in "test" document.`);
}

console.log(`Count: ${db.get("test", "count")}`);
console.log(`All keys of document "test": ${db.getKeys("test")}`);
console.log(`All values of document "test": ${db.getValues("test")}`);

if (db.get("test", "count") > 2) {
    db.remove("test", "count");
    db.delete("test");

    console.log(`Count reached 3! Deleted "test" document.`);
}
