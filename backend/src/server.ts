import express, { Request, Response } from "express";
import prisma from "./config/prisma";

const app = express() ;

const main = async () => {
    const user = await prisma.user.findMany() ;
    console.log(user) ;
}
main() 

app.listen(3000, ()=>{
    console.log( 'app is running on port 3000 ')
})