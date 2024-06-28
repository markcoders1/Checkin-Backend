
export const uppercaseFirstLetter=(word)=>{
    let newword=word.toLowerCase()
    return newword.charAt(0).toUpperCase()+newword.slice(1)
}
export const unixToDate=(unix)=>{
    const date=new Date(unix)
    return date.toLocaleString().slice(0,10)
}

export const unixTo24Time=(unix)=>{
    if(unix==undefined){
        return `N/a`
    }
    let time = new Date(unix).toISOString()
    console.log(time)
    time =time.slice(11,19)
    return `${time.slice(0,5)}`
}

export const unixToTime=(unix)=>{
    if(unix==undefined){
        return `N/a`
    }
    let time=new Date(unix).toLocaleTimeString()
    return time

    // time=time.slice(11,19)
    // if(Number(time.slice(0,2))>12){
    //     return `${Number(time.slice(0,2))-12}${time.slice(2,5)} PM`
        
    // }else if(Number(time.slice(0,1))==12){
    //     return `${Number(time.slice(0,2))}${time.slice(2,5)} PM`
    // }else{
    //     return `${time.slice(0,5)} AM`
    // }
}