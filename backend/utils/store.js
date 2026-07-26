const fs = require("fs");
const path = require("path");

function readJSON(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function appendJSON(fileName, entry) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const list = readJSON(fileName);
  list.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  return list;
}

// Overwrites the whole file with the given array/object.
function writeJSON(fileName, data) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

// Updates (merges) the first item whose `key` field equals `value`. Returns updated item or null.
function updateItem(fileName, key, value, patch) {
  const list = readJSON(fileName);
  const idx = list.findIndex((it) => it[key] === value);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  writeJSON(fileName, list);
  return list[idx];
}

// Removes the first item whose `key` field equals `value`. Returns true if removed.
function removeItem(fileName, key, value) {
  const list = readJSON(fileName);
  const idx = list.findIndex((it) => it[key] === value);
  if (idx === -1) return false;
  list.splice(idx, 1);
  writeJSON(fileName, list);
  return true;
}

// Ensures a data file exists (creates it with defaultValue if missing).
function ensureFile(fileName, defaultValue) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  }
}

module.exports = { readJSON, appendJSON, writeJSON, updateItem, removeItem, ensureFile };
