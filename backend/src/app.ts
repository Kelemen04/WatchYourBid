import express from 'express';

const app = express();
const port = 8000;

app.get('/', (req,res) => {
    res.send("Helllo");
}) 

app.get('/:id', (req,res) => {
    console.log(`${JSON.stringify(req.query)}`)
    console.log(`${JSON.stringify(req.headers)}`)
    res.send(`Sziaa ${req.params.id}`);
})

app.listen(port, () => {
    console.log(`Server listening on port - ${port}`);
});