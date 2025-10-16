'use client'

  import { useState, useEffect } from 'react'
  import { Button, Table, Modal, Form, Input, message, Space, Popconfirm } from 'antd'
  import { ShopOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
  import styles from './franquias.module.css'
  
  export default function FranquiasPage() {
    const [franquias, setFranquias] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [form] = Form.useForm()
  
    async function carregarFranquias() {
      try {
        setLoading(true)
        const response = await fetch('/api/franquias')
        const data = await response.json()
        setFranquias(data)
      } catch (error) {
        message.error('Erro ao carregar franquias')
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => {
      carregarFranquias()
    }, [])
  
    async function salvarFranquia(values) {
      try {
        const url = editandoId ? `/api/franquias/${editandoId}` : '/api/franquias'
        const response = await fetch(url, {
          method: editandoId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })
  
        if (response.ok) {
          message.success(`Franquia ${editandoId ? 'atualizada' : 'criada'} com sucesso!`)
          setModalVisible(false)
          form.resetFields()
          setEditandoId(null)
          carregarFranquias()
        } else {
          message.error('Erro ao salvar franquia')
        }
      } catch (error) {
        message.error('Erro ao salvar franquia')
      }
    }
  
    async function removerFranquia(id) {
      try {
        const response = await fetch(`/api/franquias/${id}`, { method: 'DELETE' })
        if (response.ok) {
          message.success('Franquia removida!')
          carregarFranquias()
        } else {
          message.error('Erro ao remover franquia')
        }
      } catch (error) {
        message.error('Erro ao remover franquia')
      }
    }
  
    function editar(franquia) {
      setEditandoId(franquia.id)
      form.setFieldsValue(franquia)
      setModalVisible(true)
    }
  
    const columns = [
      { title: 'Nome', dataIndex: 'nome', key: 'nome' },
      { title: 'Cidade', dataIndex: 'cidade', key: 'cidade' },
      { title: 'Endereço', dataIndex: 'endereco', key: 'endereco' },
      { title: 'Telefone', dataIndex: 'telefone', key: 'telefone' },
      {
        title: 'Funcionários',
        dataIndex: ['_count', 'funcionarios'],
        key: 'funcionarios_count',
        render: (count) => count || 0
      },
      {
        title: 'Ações',
        key: 'acoes',
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => editar(record)} size="small" />
            <Popconfirm
              title="Confirma remover?"
              onConfirm={() => removerFranquia(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Space>
        ),
      }
    ]
  
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <ShopOutlined className={styles.titleIcon} /> Franquias
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.addButton}
            onClick={() => setModalVisible(true)}
          >
            Adicionar
          </Button>
        </div>
  
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={franquias}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
  
        <Modal
          title={editandoId ? 'Editar Franquia' : 'Nova Franquia'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setEditandoId(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText="Salvar"
          cancelText="Cancelar"
        >
          <Form form={form} layout="vertical" onFinish={salvarFranquia}>
            <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Campo obrigatório' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="cidade" label="Cidade" rules={[{ required: true, message: 'Campo obrigatório' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="endereco" label="Endereço" rules={[{ required: true, message: 'Campo obrigatório' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="telefone" label="Telefone" rules={[{ required: true, message: 'Campo obrigatório' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }