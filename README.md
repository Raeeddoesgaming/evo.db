# Evo.DB
Is a local storage database that is very easy to use.

## Methods
`DB(config, callback)` To make new database.
- `config` (`JSON`) Config of database.
  - `folder` (`String`) Path of database files.
- `callback` (`Function`) Function that will fired if a document is corrupted.

`DB#isExist(name)` To check does a document is exist or no.
- `name` (`String`) Name of the document.

`DB#create(name)` To create a document.
- `name` (`String`) Name of document.

`DB#delete(name)` To delete a document.
- `name` (`String`) Name of document.

`DB#set(name, key, value)` To set variable value from a document.
- `name` (`String`) Name of document.
- `key` (`String`) Name of variable.
- `value` (`String`/`Non Circular Object`/`JSON`/`Array`/`Number`) New value of variable.

`DB#add(name, key, value)` To add value into variable value from a document.
- `name` (`String`) Name of document.
- `key` (`String`) Name of variable.
- `value` (`String`/`Non Circular Object`/`JSON`/`Array`/`Number`) New value of variable.

`DB#get(name, key)` To get variable value from a document.
- `name` (`String`) Name of document.
- `key` (`String`) Name of variable.

`DB#push(name, key, value)` Push a value info key from a document.
- `name` (`String`) Name of document.
- `key` (`String`) Name of variable.
- `value` (`String`/`Non Circular Object`/`JSON`/`Array`/`Number`) Item that want to get pushed to a variable.

`DB#keys(name)` Get all keys of document.
- `name` (`String`) Name of document.

`DB#values(name)` Get all values of document.
- `name` (`String`) Name of document.

`DB#removeValue(name, key)` (Beta) Remove a value of document by key.
- `name` (`String`) Name of document.
- `key` (`String`) Name of variable.

## Example
```js
let DB = require("@evodev/evo.db");
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

    if (db.get("test", "count") === 3) {
        db.delete("test");

        console.log(`Count reached 3! Deleted "test" document.`);
    }
})();
```

## Developer
- Gaia#7541

## Support
- [Discord Server](http://discord.gg/4kUDR5G)

## Donation
- PayPal: `nekomaru76`