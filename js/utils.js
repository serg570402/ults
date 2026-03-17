// src/utils.js

// Check if two arrays are equal (shallow)
export function arraysEqual(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, i) => val === b[i])
  )
}

// Sort array of numeric strings as numbers
export function sortNumericStrings(arr) {
  return arr.slice().sort((a, b) => Number(a) - Number(b))
}

// Return unique values of an array
export function unique(arr) {
  return [...new Set(arr)]
}

// Clean up a sentence, keeping apostrophes/hyphens inside words
export function cleanSentence(sentence) {
  return sentence
    .replace(/[^\u{0000}-\u{10FFFF}\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/(?<![\p{L}\p{N}])-(?![\p{L}\p{N}])/gu, ' ')
    .replace(/(?<![\p{L}\p{N}])'(?![\p{L}\p{N}])/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Capitalize the first letter of a string
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Deep clone object or array
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Check if value is empty (null, undefined, '', [], {})
export function isEmpty(val) {
  if (val == null) return true
  if (typeof val === 'string' && val.trim() === '') return true
  if (Array.isArray(val) && val.length === 0) return true
  if (typeof val === 'object' && Object.keys(val).length === 0) return true
  return false
}

//How to use in a code

// src/main.js
import { arraysEqual, cleanSentence, unique } from './utils.js'

console.log(arraysEqual([1, 2], [1, 2])) // true
console.log(cleanSentence('I’d like an-orange  <>   juice.')) // "I'd like an-orange juice"
console.log(unique([1, 2, 2, 3])) // [1, 2, 3]
