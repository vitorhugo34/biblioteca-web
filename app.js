const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;

//criando a conexão com o banco
const db = mysql.createConnection({
  host: 'localhost',
  user:'root',
  password: '',
  database:'biblioteca'
});

//conectando com o banco
db.connect((error) => {
if(error){
  console.error('Erro ao conectar ao MySQL:', error)
}else{
  console.log("Conectado ao MySQL!")
}
});

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'));
app.use(express.static('src'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get(['/', '/home'], (req, res) => {
  res.render('home');
});

app.get('/acervo', (req, res) => {
  db.query('SELECT autor.nome as autor, ISBN, titulo, ano_publicacao, resumo FROM livro JOIN autor on livro.id_autor = autor.id_autor ORDER BY titulo ASC', (error, results) =>{
    if(error){
      console.log('Erro ao buscar livros do acervo')
    }else{
      res.render('acervo', {livros: results})
    }
  });
});

app.get('/pesquisarLivros', (req, res) => {
  const pesquisa = req.query.pesquisa;
  console.log(pesquisa)
  db.query('SELECT autor.nome as autor, ISBN, titulo, ano_publicacao, resumo FROM livro JOIN autor on livro.id_autor = autor.id_autor WHERE autor.nome like ? or titulo like ?',[`%${pesquisa}%`, `%${pesquisa}%`], (error, results) =>{
    if(error){
      console.log('Erro ao buscar livros do acervo')
    }else{
      console.log(results)
      res.render('acervo', {livros: results})
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
