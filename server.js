const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// A parte do BANCO DE DADO
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'tarefas_db'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados tarefas_db com sucesso!');
});

// 1. INCLUSÃO (Create) - POST 
app.post('/tarefas', (req, res) => {
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;
    
    const query = 'INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nome, descricao, responsavel, data_tarefa, concluido || false], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ id: result.insertId, mensagem: 'Tarefa criada com sucesso!' });
    });
});

// 2. LISTA DE TAREFAS POR PERÍODO 
app.get('/tarefas', (req, res) => {
    const { inicio, fim } = req.query;
    
    let query = 'SELECT * FROM tarefas';
    let params = [];

    if (inicio && fim) {
        query += ' WHERE data_tarefa BETWEEN ? AND ?';
        params = [inicio, fim];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(200).json(results);
    });
});

// 3. CONSULTA POR ID (Read by ID) - GET /tarefas/:id
app.get('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM tarefas WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length === 0) return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
        res.status(200).json(results[0]);
    });
});

// 4. ATUALIZAÇÃO (Update) - PUT 
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

    const query = 'UPDATE tarefas SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? WHERE id = ?';
    db.query(query, [nome, descricao, responsavel, data_tarefa, concluido, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensagem: 'Tarefa não encontrada para atualizar.' });
        res.status(200).json({ mensagem: 'Tarefa atualizada com sucesso!' });
    });
});

// 5. EXCLUSÃO (Delete) - DELETE
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tarefas WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensagem: 'Tarefa não encontrada para excluir.' });
        res.status(200).json({ mensagem: 'Tarefa excluída com sucesso!' });
    });
});

//PORTA
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000 (http://localhost:3000)');
});