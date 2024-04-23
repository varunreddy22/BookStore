import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from 'mongoose';
import { Book } from "./models/bookModel.js";
import booksRoute from "./routes/booksRoute.js";
import cors from 'cors';





const app = express();


//Middleware for handling CORS POLICY
//Option 1: Allow all Origins with Default of cors(*)
app.use(cors());
//Option 2: Allow custom Origins

/*
app.use(
    cors({origin:'http://localhost:5470',
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type'],
    })
    );
*/
//Since in Post man when we try the send our data as a JSON to server, 
//the body is not recognizing our server, So we adding a middleware for parsing our request body
//this will allow express to use JSON body

//So below is the Middleware for parsing request body
app.use(express.json());

//Now after the above step, we created a book and it is saved on our database successfully
//////////////////////////////////////////////////////////////////////////////////////////

//Now lets create a Route to get all books from database
//Here we use '/books' as our ROUTE for this method, which is different from previous route, as that is post
//method, but this is a get method
//here we crete an asyns callback fun to handle our request, with try and catch to handle error.
//On catch we recieve error logging to the server console and return a response of ststus 500 with err msg
//In try block, I used book.find({}) to get the list of all books from database ans store it in books variable
//with a status of 200 and send books to the client. Lets go to POST MAN and chech it with GET->url->Send
//Route to get all books from database
app.get('/books', async(request, response) => {
    try{
        const books = await Book.find({});

        return response.status(200).json({
            count: books.length,
            data: books
        });
    }
    catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message});
    }

});

//Route to GET one book from database
//here we use id as parameter in the URL
app.get('/books/:id', async(request, response) => {
    try{

        const {id} = request.params;
        const book = await Book.findById(id);

        return response.status(200).json(book);
    }
    catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message});
    }

});


//Route to update a book
//we use put() method to updade a resourse
app.put('/books/:id', async(request, response) => {
    try{
        if(
            !request.body.title ||
            !request.body.author ||
            !request.body.publishedYear
        ){
            return response.status(400).send(
                {message:'Send all the required fields: title, author, publishedYear'});

        }

        const {id} = request.params;

        const result = await Book.findByIdAndUpdate(id, request.body);
        //return response.status(201).send(book);

        if(!result)
        {
            return response.status(404).json({message:'Book not found'});
        
        }
        return response.status(200).send({message:'book updated successfully'});

    }catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message});

    }
});


//Route to delete a Book
app.delete('/books/:id', async(request, response) => {
    try{
       /* if(
            !request.body.title ||
            !request.body.author ||
            !request.body.publishedYear
        ){
            return response.status(400).send(
                {message:'Send all the required fields: title, author, publishedYear'});

        }*/
        const {id} = request.params;

        const result = await Book.findByIdAndDelete(id);
        //return response.status(201).send(book);

        if(!result)
        {
            return response.status(404).json({message:'Book not found'});
        
        }
        return response.status(200).send({message:'book deleted successfully'});



    }
    catch(error){
        console.log(error.message);
        response.status(500).send(error.message);

    }

});


//while practicing this code I was stuck with the errors because I changed the status code as any random number
//and tried changing the port number, I thought the error is because of the port number.But the issue was with
//changing the status number.

//Also check the mongodb password encoding while connecting to database

//Instead of loading a '/' in the browser, we print 'Welcome to MERN Stack Project' whenever the HTTP request
//is successful

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Welcome to MERN Stack Project')

});



//We need a HTTP Route to save a new Book, so we use post method. This is used to create new resource.
//Since working with mongoose is an asynchronous process we use asyn method
//we also use try, catch block to handle success and failure

//For testing a post method we canot use browser, So I am using Postman. It is a good tool to working with web API's

app.post('/books', async(request,response) => {
    try{
        if(
            !request.body.title ||
            !request.body.author ||
            !request.body.publishedYear
          )
        {
            return response.status(400).send({
                message: 'Send all required fields: title, author, publishedYear',
            });
        }
        const newBook = {
            title: request.body.title,
            author: request.body.author,
            publishedYear: request.body.publishedYear,
         
        };

        const book = await Book.create(newBook);

        return response.status(201).send(book);

    } 
    catch(error){
        console.log(error.message);
        response.status(500).send({message:error.message});

    }


});


app.use('/books', booksRoute);



//here we used moogoose.connect() to connect to mongoDB, the below code ellustrate that 

mongoose
    .connect(mongoDBURL)
    .then(() => {
     console.log('App connected to database');
     app.listen(PORT, () => {
        console.log(`App is listening to PORT: ${PORT}`);
    });
})
    .catch((error) => {
     console.log(error);
});
