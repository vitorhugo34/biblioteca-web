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

const carregarAutores = (callback) => {
  db.query(
    'SELECT * FROM autor ORDER BY nome ASC',
    (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        const autores = results.map(result => result);
        callback(null, autores);
      }
    }
  );
};

app.get('/cadastrarLivro', (req, res) => {
  carregarAutores( (error, listaAutores) => {
    if (error) {
      console.log('Erro ao buscar autores');
      res.status(500).send('Erro ao buscar autores');
    } else {
      res.render('cadastrarLivro', { autores: listaAutores, livro: null});
    }

  })
});

app.post('/cadastrarLivro', (req, res) => {
  const ISBN = parseInt(req.body.inputISBN);
  const id_autor = parseInt(req.body.inputAutor);
  const titulo = req.body.inputTitulo;
  const ano_publicacao = parseInt(req.body.inputAnoPublicacao);
  const genero = req.body.inputGenero;
  const resumo = req.body.textResumo;

  db.query('INSERT INTO Livro (ISBN, titulo, id_autor, ano_publicacao, genero, resumo) VALUES (?,?,?,?,?,?)', [ISBN, titulo, id_autor, ano_publicacao, genero, resumo], (error, results) => {
    if (error) {
      console.log('Erro ao realizar inserção', error);
      res.status(500).send('Erro ao cadastrar livro');
    } else {
      console.log('Cadastrado com sucesso');
      res.redirect('/acervo');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
