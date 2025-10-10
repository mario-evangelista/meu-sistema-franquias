import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/funcionarios/[id] - Buscar funcionário específico
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)

    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      include: {
        franquia: true
      }
    })

    if (!funcionario) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(funcionario)
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/funcionarios/[id] - Atualizar funcionário
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()
    
    const { nome, email, cargo, salario, franquiaId } = data

    const funcionarioExiste = await prisma.funcionario.findUnique({
      where: { id }
    })

    if (!funcionarioExiste) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    if (!nome || !email || !cargo || !salario || !franquiaId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const franquia = await prisma.franquia.findUnique({
      where: { id: parseInt(franquiaId) }
    })

    if (!franquia) {
      return NextResponse.json(
        { error: 'Franquia não encontrada' },
        { status: 404 }
      )
    }

    const emailExiste = await prisma.funcionario.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExiste) {
      return NextResponse.json(
        { error: 'Email já está em uso por outro funcionário' },
        { status: 400 }
      )
    }

    const funcionario = await prisma.funcionario.update({
      where: { id },
      data: {
        nome,
        email,
        cargo,
        salario: parseFloat(salario),
        franquiaId: parseInt(franquiaId)
      },
      include: {
        franquia: true
      }
    })

    return NextResponse.json(funcionario)
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/funcionarios/[id] - Deletar funcionário
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id }
    })

    if (!funcionario) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    await prisma.funcionario.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Funcionário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}