#!/bin/env node

const fs = require('fs')
const path = require('path')

let f = path.join(__dirname, 'places.json')

let places = JSON.parse(fs.readFileSync(f))

console.log(JSON.stringify(places))