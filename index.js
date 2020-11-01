const fs     = require("fs");
const lodash = require("lodash");

function checkDir(path) {
    try {
        fs.readdirSync(path);
        return true;
    } catch(err) { 
        return false;
    }
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
    constructor(config = { folder: "./" }, callback = () => {}) {
        if (typeof config !== "object") throw new Error("Config is not an object.");
        if (!checkDir(config.folder)) throw new Error(`Cannot found directory "${config.folder}".`);
        if (!config.folder.endsWith("/")) config.folder += "/";

        this.config   = config;
        this.callback = callback;
    }
    save(document, data) {
        fs.writeFileSync(`${this.config.folder}${document}.json`, JSON.stringify(data));
    }
    getAll(document) {
        if (typeof document !== "string") throw new Error(`document argument must be a string.`);
        
        let data = {};

        const { config, callback } = this;
        const fullPath             = `${config.folder}${document}.json`

        try {
            data = require(fullPath);
        } catch(err) {
            if (!fs.existsSync(fullPath)) throw new Error(`Cannot find document ${document}.`);
            else if (typeof callback === "function") {
                callback({ path: fullPath, document: document });
                this.save(document, data);
            }
        }

        return data;
    }
    get(document, key) {
        let data = this.getAll(document);

        return lodash.get(data, key);
    }
    set(document, key, val) {
        if (typeof document !== "string") throw new Error(`document argument must be a string.`);
        if (typeof key !== "string") throw new Error(`key argument must be a string.`);

        let data = {};
        
        const { config, callback } = this;
        const fullPath             = `${config.folder}${document}.json`;

        try {
            data = require(fullPath);
        } catch(err) {
            if (!fs.existsSync(fullPath)) throw new Error(`Cannot find document ${document}.`);
            else if (typeof callback === "function") callback({ path: fullPath, document: document });
        }

        if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);

        lodash.set(data, key, val);
        this.save(document, data);

        return this.get(document, key);
    }
    remove(document, key) {
        let data = this.getAll(document);

        delete data[key];

        this.save(document, data);

        return true;
    }
    push(document, key, val) {
        let o = this.get(document, key);

        if (!Array.isArray(o)) throw new Error(`${key}'s value is not an array.`);
        if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);

        o.push(val);
        return this.set(document, key, o);
    }
    isExist(document) {
        if (fs.existsSync(`${this.config.folder}${document}.json`) && !checkDir(`${this.config.folder}${document}.json`)) return true;

        return false;
    }
    getKeys(document) {
        return Object.keys(this.getAll(document));
    }
    getValues(document) {
        return Object.values(this.getAll(document));
    }
    getEntries(document) {
        return Object.entries(this.getAll(document));
    }
    delete(document) {
        const name = `${this.config.folder}${document}.json`;

        if (!fs.existsSync(name)) throw new Error(`Cannot find document ${document}.`);

        fs.unlinkSync(name);

        return true;
    }
    create(document) {
        const name = `${this.config.folder}${document}.json`;

        if (fs.existsSync(name)) throw new Error(`Document ${document} already exists.`);

        fs.writeFileSync(name, JSON.stringify({}));

        return true;
    }
    add(document, key, val) {
        let v = this.get(document, key);

        if (!v && isNaN(v)) throw new Error(`${key}'s value is not defined.`);
        if (!Array.isArray(v) && isNaN(v)) throw new Error(`${key}'s value is not an array or a number.`);
        if (isNaN(val) && !isNaN(v)) throw new Error(`Value argument must be a number if ${key}'s value is a number.`);
        if (isCyclic(val)) throw new Error(`value argument cannot be a circular object.`);
        if (Array.isArray(v)) {
            v.push(val);
            this.set(document, key, v);
        } else if (!isNaN(v) && !isNaN(val)) {
            this.set(document, key, v+val);
        } else throw new Error(`???`);

        return this.get(document, key);
    }
}

module.exports = DB;
