import express from 'express'
const app=express();
app.get('/health',(_,_res)=>_res.json({ok:true}));
app.listen(4001,()=>console.log('PING on http://localhost:4001'))
