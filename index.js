const express = require('express')
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/uplodes', express.static('uplodes'));

const photoRouter = require('./routes/photoroutes');
const userRouter = require('./routes/userroutes');
const likeRouter = require('./routes/likeroutes');
const commentRouter = require('./routes/commentroutes');

app.use('/user',userRouter)
app.use('/photo',photoRouter)
app.use('/like',likeRouter )
app.use('/comment',commentRouter)

app.listen(4000,()=>{
    console.log(' Amringizga mumtazirman ');
 })