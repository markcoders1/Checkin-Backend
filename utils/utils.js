
// console.log(uppercaseFirstLetter("brian o'connor")); // Output: "Brian O'Connor"
// console.log(uppercaseFirstLetter("hi how are yOu")); // Output: "Hi How Are You"
// console.log(uppercaseFirstLetter("mary-jane o'leary")); // Output: "Mary-Jane O'Leary"
export const uppercaseFirstLetter = (fullname) => {
    return fullname
        .split(' ')
        .map(word => 
            word
                .split(/(?=[-'`])/)
                .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
                .join('')
        )
        .join(' ');
};
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