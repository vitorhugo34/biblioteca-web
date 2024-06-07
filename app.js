const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const ejs = require('ejs');
const path = require('path');
const { error } = require('console');

const app = express();
const port = 3000;

//criando a conexão com o banco
const db = mysql.createConnection({
  host: 'localhost',
  user:'root',
  password: '',
  database:'biblioteca'
});



app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
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

app.get('/acervo', (req,res) =>{
  db.query('select a.nome as autor, l.titulo, l.ISBN, l.ano_publicacao from livro l join autor a on l.id_autor = a.id_autor', (error, results) =>{
    if(error){
      console.log('Houve um erro ao recuperar os livros', error)
    } else{
      res.render('acervo', {livros: results})
    }
  })
})

app.get(['/pesquisarlivros'], (req, res) => {
  const pesquisa = req.query.pesquisa //query vem da url e body vem do json
  console.log(pesquisa)
  db.query('select a.nome as autor, l.titulo, l.ISBN, l.ano_publicacao from livro l join autor a on l.id_autor = a.id_autor where l.titulo like ? or a.nome like ?' ,[`%${pesquisa}%`, `%${pesquisa}%`], (error,results) =>{
    if(error){
      console.log('Houve um erro ao recuperar os livros', error)
    } else{
      res.render('acervo', {livros: results})
    }
  })
  });
  const carregarAutores = (callback) =>{
    db.query('select * from autor order by nome', (error,results)=> {
      if(error){
        console.log('erro ao carregar autores', error);
      }else{
          const autores = results.map(results => results)
          callback(null, autores)
      } 
    });
  }

  app.get('/livro',(req, res) =>{
    const ISBN = req.query.ISBN;
    console.log(ISBN)
    carregarAutores((error, listaAutores) =>{
      db.query('Select * from livro where ISBN=?', [ISBN],(error,results) =>{
        if(error){
          console.log('Erro ao buscar o livro com ISBN',ISBN)
        }else
        if(results.length > 0){
          res.render('livro',{autores:listaAutores, livro: results[0]});
        }else{
          console.log('livro não encontrado')
        }
      })
    })
  });

    app.get('/livro',(req, res) =>{
    const ISBN = req.query.ISBN;
    console.log(ISBN)
    carregarAutores((error, listaAutores) =>{
      db.query('Select * from livro where ISBN=?', [ISBN],(error,results) =>{
        if(error){
          console.log('Erro ao buscar o livro com ISBN',ISBN)
        }else
        if(results.length > 0){
          res.render('livro',{autores:listaAutores, livro: results[0]});
        }else{
          console.log('livro não encontrado')
        }
      })
    })
  });
  
app.post('/editarLivro',(req, res) => {
  const ISBN = parseInt(req.body.inputISBN);
  const id_autor = parseInt(req.body.inputAutor);
  const titulo = req.body.inputTitulo;
  const ano_publicacao = req.body.InputAnoPublicacao
  const genero = req.body.inputGenero;
  const resumo = req.body.textResumo;

  db.query('update livro seet ISBN =?, titulo = ?, id_autor =?, ano_publicacao =?, genero = ? where ISBN =?', [ISBN,titulo, id_autor, ano_publicacao,genero,resumo,ISBN],
    (error,results) => {
      if (error){
        console.log('erro ao editar Livro')
      } else{
        res.redirect('/acervo')
      }
    })
})

app.post('excluirLivro/:ISBN',(req,res)=>{
  const ISBN = parseFloat (req.params.ISBN)
  console.log(ISBN)
  db.query('DELETE FROM LIVRO WHERE ISBN = ?',[ISBN],(error,results) =>{
    if(error){
      console.log( 'Erro ao deletar')
    } else{
      res.redirect('/acervo')
    }
  })
})