export const uppercaseFirstLetter=(word)=>{
    let newword=word.toLowerCase()
    return newword.charAt(0).toUpperCase()+newword.slice(1)
}