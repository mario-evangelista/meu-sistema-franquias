'use client'

import React from 'react'

import { useState, useEffect } from 'react';
import { Table } from 'antd';

function Funcionarios() {

    //Criar uma variavel para armazenar a lista de franquias
    const [funcionarios, setFuncionarios] = useState([]);

    async function carregarFuncionarios() {
        try {
            const response = await fetch('/api/funcionarios')
            const data = await response.json()
            setFuncionarios(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, [])

    //Table do antd


    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'id'
        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'id'
        },
        {
            title: 'cargo',
            dataIndex: 'cargo',
            key: 'id'
        },
        {
            title: 'salario',
            dataIndex: 'salario',
            key: 'id'
        }
    ]

    return (
        <div>
            <h1>Tabela de Funcionarios</h1>
            <Table
                columns={columns}
                dataSource={funcionarios}
                rowKey='id'
            />
        </div>
    )
}

export default Funcionarios