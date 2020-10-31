const fs     = require("fs");
const lodash = require("lodash");

async function checkDir(path) {
    return await new Promise((resolve, reject) => {
        fs.access(path, function(err) {
            if (err && err.code === 'ENOENT') {
                resolve(false);
            } else resolve(true);
        });
    });
}

function isCyclic(obj) {
    var seenObjects = [];
  
    function detect (obj) {
      if (obj && typeof obj === 'object') {
        if (seenObjects.indexOf(obj) !== -1) {
          return true;
        }
        seenObjects.push(obj);
        for (let key in obj) {
          if (obj.hasOwnProperty(key) && detect(obj[key])) {
            return true;
          }
        }
      }
      return false;
    }
  
    return detect(obj);
  }

class DB {
    constructor(path = { folder: "./" }, callback = () => {}) {
        if (typeof path !== "object") throw new Error("Path is not an object.");
        if (!(fs.existsSync(path.folder))) throw new Error(`Cannot found directory "${path.folder}".`);

        function save(path2, data2) {
            fs.writeFileSync(path2, JSON.stringify(data2));
        }

        let get = (document, key) => {
            if (typeof document !== "string") throw new Error(`document argument must be a string.`);
            if (typeof key !== "string") throw new Error(`key argument must be a string.`);

            let data_ = {};

            try {
                data_ = require(path.folder + document + ".json");
            } catch(err) {
                if (!fs.existsSync(path.folder + document + ".json")) throw new Error(`Cannot found document ${document}.`);
                else if (typeof callback === "function") {
                    callback({ path: path.folder + document + ".json", document: document });
                    save(path.folder + document + ".json", data_);
                }
            }

            return lodash.get(data_, key);
        };

        let set = (document, key, val) => {
            if (typeof document !== "string") throw new Error(`document argument must be a string.`);
            if (typeof key !== "string") throw new Error(`key argument must be a string.`);

            let data_ = {};
            
            try {
                data_ = require(path.folder + document + ".json");
            } catch(err) {
                if (!fs.existsSync(path.folder + document + ".json")) throw new Error(`Cannot found document ${document}.`);
                else if (typeof callback === "function") callback({ path: path.folder + document + ".json", document: document });
            }

            if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);

            lodash.set(data_, key, val);

            save((path.folder + document + ".json"), data_);

            return get(document, key);
        };

        let removeValue = (document, key) => {
            if (typeof document !== "string") throw new Error(`document argument must be a string.`);
            if (typeof key !== "string") throw new Error(`key argument must be a string.`);

            let data_ = {};
            
            try {
                data_ = require(path.folder + document + ".json");
            } catch(err) {
                if (!fs.existsSync(path.folder + document + ".json")) throw new Error(`Cannot found document ${document}.`);
                else if (typeof callback === "function") callback({ path: path.folder + document + ".json", document: document });
            }

            delete data_[key];

            save((path.folder + document + ".json"), data_);

            return true;
        }

        let push = (document, key, val) => {
            if (!Array.isArray(get(document, key))) throw new Error(`${key}'s value is not an array.`);

            if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);

            let o = get(document, key);
            o.push(val);
            return set(document, key, o);
        };

        let keys = (document) => {
            if (typeof document !== "string") throw new Error(`document argument must be a string.`);
            
            let data_ = {};

            try {
                data_ = require(path.folder + document + ".json");
            } catch(err) {
                if (!fs.existsSync(path.folder + document + ".json")) throw new Error(`Cannot found document ${document}.`);
                else if (typeof callback === "function") {
                    callback({ path: path.folder + document + ".json", document: document });
                    save(path.folder + document + ".json", data_);
                }
            }

            return Object.keys(data_);
        }

        let values = (document) => {
            if (typeof document !== "string") throw new Error(`document argument must be a string.`);
            
            let data_ = {};

            try {
                data_ = require(path.folder + document + ".json");
            } catch(err) {
                if (!fs.existsSync(path.folder + document + ".json")) throw new Error(`Cannot found document ${document}.`);
                else if (typeof callback === "function") {
                    callback({ path: path.folder + document + ".json", document: document });
                    save(path.folder + document + ".json", data_);
                }
            }

            return Object.values(data_);
        };

        let remove = async (document) => {
            if (!(await checkDir(path.folder + document + ".json"))) throw new Error(`Cannot found document ${document}.`);

            fs.unlinkSync(path.folder + document + ".json");

            return true;
        }

        let create = async (document) => {
            if ((await checkDir(path.folder + document + ".json"))) throw new Error(`Document ${document} is already exist.`);

            fs.writeFileSync(path.folder + document + ".json", JSON.stringify({}));

            return true;
        }

        let add = (document, key, val) => {
            let v = get(document, key);

            if (!v && isNaN(v)) throw new Error(`${key}'s value is not defined.`);
            if (!Array.isArray(v) && isNaN(v)) throw new Error(`${key}'s value is not an array or a number.`);
            if (isNaN(val) && !isNaN(v)) throw new Error(`Value argument must be a number if ${key}'s value is a number.`);
            
            if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);

            if (Array.isArray(v)) {
                v.push(val);
                set(document, key, v);
            } else if (!isNaN(v) && !isNaN(val)) {
                set(document, key, v+val);
            } else throw new Error(`???`);

            return get(document, key);
        };

        let isDocumentExist = async (document) => {
            if (fs.existsSync(path.folder + document + ".json")) return true;

            return false;
        };

        this.set         = set;
        this.get         = get;
        this.push        = push;
        this.keys        = keys;
        this.values      = values;
        this.add         = add;
        this.delete      = remove;
        this.create      = create;
        this.isExist     = isDocumentExist;
        this.removeValue = removeValue;
    }
}

module.exports = DB;