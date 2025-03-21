const express = require("express")
const helmet = require("helmet")
const mysql2 = require("mysql2")
const morgan = require("morgan")
const cors = require("cors")
const bcrypt = require("bcrypt")
const { error } = require("npmlog")

// carregando os modulos para execução no backend
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());

//CONFIGURAÇÕES de coneção com o banco de dados
const con = mysql2.createConnection({
    host:"127.0.0.1",
    port:"3307",
    user:"root",
    password:"",
    database:"dbexpress"
})


//endpoints para acesso
app.get("/", (req,res) =>{
    // obter os cliente que estão cadastrados no banco de dados
    con.query("Select * from cliente",(error, result)=>{
        if(error){
           return res.status(500).send({msg:`Erro ao tentar selecionar os clientes ${error}`});
        }
        res.status(200).send({payload:result});
    })
});

app.post("/cadastrar", (req,res)=>{

    bcrypt.hash(req.body.senha,10,(error,novaSenha)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao cadastrar. Tente novamente mais tarde`})
        }else{
            //vamos devolver a senha para o body porem a senha está criptografada
            req.body.senha=novaSenha;
  

    con.query("INSERT INTO cliente set ?",req.body,(error,result)=>{
        if(error){
            return res.status(400).send({msg:`Erro ao tentar cadastrar ${error}`}); 
        }
        res.status(201).send({msg:`Cliente cadastrado`,payload:result})
    })

 }
 })

});

app.put("/atualizar/:id", (req,res)=>{
    if(req.params.id==0 || req.params.id==null){
        return res.status(400).send({msg:`Você Precisa manda o id do cliente`});
    }
    con.query("update cliente set ? where id=?",[req.body,req.params.id],(error,result)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao tentar atualizar`})
        }
        res.status(200).send({msg:`Cliente Atualizado.`,payload:result})
    })
});

app.delete("/apagar/:id", (req,res)=>{
    if(req.params.id==0 || req.params.id==null){
        return res.status(400).send({msg:`Você Precisa manda o id do cliente`});
    }
    con.query("delete from cliente where id=?",req.params.id,(error,result)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao tentar deletar ${error}`})
        }
        res.status(204).send({msg:`Apagou`})
    })
});

app.post("/login",(req,res)=>{
    con.query("select * from cliente where usuario=?",req.body.usuario,(error,result)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao tentativa de login ${error}`})
        }else if(result[0]==null){
            return res.status(400).send({msg:`Erro ao fazer login. Talvez o usuario ou senha não existe`})
        }else{
            bcrypt.compare(req.body.senha,result[0].senha).then((igual)=>{
                if(!igual){
                    return res.status(400).send({msg:`Erro ao fazer login. Talvez o usuario ou a senha estejam incorretos`})
                }
                else{
                    res.status(200).send({msg:`Usuario Logado`})
                }
            }).catch((error)=> res.status(500).send({msg:`Usuario ou senha`}))
        }
    })
})


app.listen(8000,()=>console.log("servidor online"))